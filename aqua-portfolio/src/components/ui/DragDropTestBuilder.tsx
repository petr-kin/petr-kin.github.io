'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragDrop, DragItem } from '@/hooks/useDragDrop';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * Represents a test step in the builder
 */
export interface TestStep {
  readonly id: string;
  readonly type: 'navigate' | 'click' | 'type' | 'assert' | 'heal';
  readonly label: string;
  readonly code: string;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly config?: Readonly<Record<string, string>>;
  readonly description?: string;
}

/**
 * Represents a test step that has been dropped in the builder
 */
export interface DroppedStep extends TestStep {
  readonly position: number;
  readonly instanceId: string; // Unique ID for this instance
  readonly customConfig?: Record<string, string>;
}

/**
 * Test execution result for each step
 */
export interface TestResult {
  readonly stepId: string;
  readonly status: 'running' | 'passed' | 'failed' | 'skipped';
  readonly message?: string;
  readonly duration?: number;
}

/**
 * Template for pre-configured test scenarios
 */
export interface TestTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps: readonly TestStep[];
  readonly category: 'authentication' | 'navigation' | 'form' | 'validation';
}

const DragDropTestBuilder: React.FC = () => {
  // State management with undo/redo
  const {
    state: droppedSteps,
    set: setDroppedSteps,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<DroppedStep[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Focus trap for template modal
  const { trapRef } = useFocusTrap({ active: showTemplates });

  const availableSteps: readonly TestStep[] = useMemo(() => [
    {
      id: 'navigate',
      type: 'navigate',
      label: 'Navigate to URL',
      code: "await page.goto('https://example.com');",
      color: '#06b6d4',
      description: 'Navigate to a specific URL',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      )
    },
    {
      id: 'click',
      type: 'click',
      label: 'Click Element',
      code: "await page.click('button[data-testid=\"submit\"]');",
      color: '#10b981',
      description: 'Click on a specific element',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      id: 'type',
      type: 'type',
      label: 'Type Text',
      code: "await page.fill('input[name=\"email\"]', 'user@example.com');",
      color: '#8b5cf6',
      description: 'Enter text into an input field',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'assert',
      type: 'assert',
      label: 'Assert Element',
      code: "await expect(page.locator('.success-message')).toBeVisible();",
      color: '#f59e0b',
      description: 'Verify that an element is present or has expected properties',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'heal',
      type: 'heal',
      label: 'AI Healing',
      code: "// AI will automatically heal broken selectors",
      color: '#ef4444',
      description: 'Let AI automatically fix broken selectors',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    }
  ] as const, []);

  // Test templates
  const testTemplates: readonly TestTemplate[] = useMemo(() => [
    {
      id: 'login-flow',
      name: 'Login Flow',
      description: 'Complete user authentication flow',
      category: 'authentication',
      steps: [
        availableSteps.find(s => s.id === 'navigate')!,
        availableSteps.find(s => s.id === 'type')!,
        availableSteps.find(s => s.id === 'click')!,
        availableSteps.find(s => s.id === 'assert')!,
      ],
    },
    {
      id: 'form-submission',
      name: 'Form Submission',
      description: 'Fill out and submit a form',
      category: 'form',
      steps: [
        availableSteps.find(s => s.id === 'navigate')!,
        availableSteps.find(s => s.id === 'type')!,
        availableSteps.find(s => s.id === 'type')!,
        availableSteps.find(s => s.id === 'click')!,
        availableSteps.find(s => s.id === 'assert')!,
      ],
    },
  ] as const, [availableSteps]);

  // Drag and drop handlers
  const { createDragHandlers, createDropHandlers, createKeyboardDropHandlers, keyboardDropMode } = useDragDrop({
    onDrop: useCallback((result: any) => {
      const stepToDrop = availableSteps.find(s => s.id === result.item.id);
      if (!stepToDrop) return;

      const newStep: DroppedStep = {
        ...stepToDrop,
        position: result.position || droppedSteps.length,
        instanceId: `${stepToDrop.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setDroppedSteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        updatedSteps.splice(newStep.position, 0, newStep);
        return updatedSteps.map((step, index) => ({ ...step, position: index }));
      });
    }, [availableSteps, droppedSteps.length, setDroppedSteps]),
    acceptedTypes: ['test-step'],
  });

  // Step management functions
  const removeStep = useCallback((instanceId: string) => {
    setDroppedSteps(prevSteps => 
      prevSteps
        .filter(step => step.instanceId !== instanceId)
        .map((step, index) => ({ ...step, position: index }))
    );
  }, [setDroppedSteps]);

  const moveStep = useCallback((fromIndex: number, toIndex: number) => {
    setDroppedSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      const [movedStep] = updatedSteps.splice(fromIndex, 1);
      updatedSteps.splice(toIndex, 0, movedStep);
      return updatedSteps.map((step, index) => ({ ...step, position: index }));
    });
  }, [setDroppedSteps]);

  const duplicateStep = useCallback((instanceId: string) => {
    const stepToDuplicate = droppedSteps.find(s => s.instanceId === instanceId);
    if (!stepToDuplicate) return;

    const duplicatedStep: DroppedStep = {
      ...stepToDuplicate,
      instanceId: `${stepToDuplicate.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: stepToDuplicate.position + 1,
    };

    setDroppedSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      updatedSteps.splice(duplicatedStep.position, 0, duplicatedStep);
      return updatedSteps.map((step, index) => ({ ...step, position: index }));
    });
  }, [droppedSteps, setDroppedSteps]);

  // Template functions
  const applyTemplate = useCallback((template: TestTemplate) => {
    const templateSteps: DroppedStep[] = template.steps.map((step, index) => ({
      ...step,
      position: index,
      instanceId: `${step.id}-${Date.now()}-${index}`,
    }));
    
    setDroppedSteps(templateSteps);
    setShowTemplates(false);
  }, [setDroppedSteps]);

  // Test execution functions
  const executeTest = useCallback(async () => {
    if (droppedSteps.length === 0) return;
    
    setIsRunning(true);
    setTestResults(new Map());
    
    for (let i = 0; i < droppedSteps.length; i++) {
      const step = droppedSteps[i];
      setRunningStep(step.instanceId);
      
      // Add running state
      setTestResults(prev => new Map(prev).set(step.instanceId, {
        stepId: step.instanceId,
        status: 'running',
      }));
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      setTestResults(prev => new Map(prev).set(step.instanceId, {
        stepId: step.instanceId,
        status: success ? 'passed' : 'failed',
        message: success ? 'Step completed successfully' : 'Step failed to execute',
        duration: 1000 + Math.random() * 2000,
      }));
    }
    
    setRunningStep(null);
    setIsRunning(false);
  }, [droppedSteps]);

  // Generate test code
  const generateCode = useCallback(() => {
    const codeLines = [
      "import { test, expect } from '@playwright/test';",
      '',
      "test('Generated test', async ({ page }) => {",
      ...droppedSteps.map(step => `  ${step.code}`),
      '});',
    ];
    
    return codeLines.join('\n');
  }, [droppedSteps]);
  
  // Clear all steps
  const clearAllSteps = useCallback(() => {
    setDroppedSteps([]);
    setTestResults(new Map());
  }, [setDroppedSteps]);

  const exportTest = useCallback(() => {
    if (droppedSteps.length === 0) {
      alert('No steps to export. Please add some test steps first.');
      return;
    }
    
    const testCode = generateCode();
    const blob = new Blob([testCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test.spec.js';
    a.click();
    URL.revokeObjectURL(url);
  }, [droppedSteps.length, generateCode]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-midnight mb-2">
                Drag & Drop Test Builder
              </h3>
              <p className="text-slate-600">
                Build your test scenario by dragging steps into the timeline
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isRunning}
              >
                Templates
              </button>
              
              <button
                onClick={undo}
                disabled={!canUndo || isRunning}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                onClick={redo}
                disabled={!canRedo || isRunning}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Redo"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m10-10l-6-6m6 6l-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Steps */}
            <div>
              <h4 className="text-lg font-semibold text-midnight mb-4">
                Available Test Steps
              </h4>
              <div className="space-y-3">
                {availableSteps.map((step) => {
                  const dragItem: DragItem = {
                    id: step.id,
                    type: 'test-step',
                    data: step as Record<string, unknown>,
                  };

                  return (
                    <div
                      key={step.id}
                      className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                      {...createDragHandlers(dragItem)}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: step.color }}
                        >
                          {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-midnight text-sm mb-1">
                            {step.label}
                          </h5>
                          <p className="text-xs text-slate-600 truncate">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drop Zone & Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-midnight">
                  Test Timeline ({droppedSteps.length} steps)
                </h4>
                {droppedSteps.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={executeTest}
                      disabled={isRunning}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRunning ? 'Running...' : 'Run Test'}
                    </button>
                    <button
                      onClick={exportTest}
                      disabled={isRunning}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={clearAllSteps}
                      disabled={isRunning}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              <div
                className={`min-h-96 border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
                  droppedSteps.length === 0 
                    ? 'border-slate-300 bg-slate-50' 
                    : 'border-slate-200 bg-white'
                }`}
                {...createDropHandlers('timeline')}
                {...createKeyboardDropHandlers('timeline')}
              >
                {droppedSteps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Drop test steps here</p>
                    <p className="text-sm text-center">
                      Drag steps from the left panel to build your test scenario
                      {keyboardDropMode && (
                        <span className="block mt-2 text-blue-600">
                          Press Enter to drop here
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {droppedSteps.map((step, index) => {
                        const result = testResults.get(step.instanceId);
                        const isCurrentlyRunning = runningStep === step.instanceId;
                        
                        return (
                          <motion.div
                            key={step.instanceId}
                            className={`relative bg-white border rounded-lg p-4 shadow-sm ${
                              isCurrentlyRunning 
                                ? 'border-blue-300 ring-2 ring-blue-100' 
                                : result?.status === 'passed'
                                ? 'border-green-300'
                                : result?.status === 'failed'
                                ? 'border-red-300'
                                : 'border-slate-200'
                            }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            layout
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                              </div>
                              
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: step.color }}
                              >
                                {step.icon}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-midnight text-sm mb-1">
                                  {step.label}
                                </h6>
                                <code className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded font-mono">
                                  {step.code}
                                </code>
                              </div>
                              
                              {/* Status indicator */}
                              <div className="flex-shrink-0">
                                {result?.status === 'running' && (
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                )}
                                {result?.status === 'passed' && (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                {result?.status === 'failed' && (
                                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => duplicateStep(step.instanceId)}
                                  disabled={isRunning}
                                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                  title="Duplicate step"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeStep(step.instanceId)}
                                  disabled={isRunning}
                                  className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50"
                                  title="Remove step"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Code Preview */}
          {droppedSteps.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-midnight mb-4">
                Generated Test Code
              </h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{generateCode()}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            ref={trapRef}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-midnight">
                  Test Templates
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {testTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <h4 className="font-medium text-midnight mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {template.description}
                    </p>
                    <div className="text-xs text-slate-500">
                      {template.steps.length} steps • {template.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropTestBuilder;