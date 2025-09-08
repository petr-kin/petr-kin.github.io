'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestStep {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'assert' | 'heal';
  label: string;
  code: string;
  icon: React.ReactNode;
  color: string;
  config?: Record<string, string>;
}

interface DroppedStep extends TestStep {
  position: number;
}

const DragDropTestBuilder = () => {
  const [droppedSteps, setDroppedSteps] = useState<DroppedStep[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState<number>(-1);
  const [testResults, setTestResults] = useState<Array<{step: number, status: 'running' | 'passed' | 'failed'}>>([]);
  const dragRef = useRef<HTMLDivElement>(null);

  const availableSteps: TestStep[] = [
    {
      id: 'navigate',
      type: 'navigate',
      label: 'Navigate to URL',
      code: "await page.goto('https://example.com');",
      color: '#06b6d4',
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
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    }
  ];

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    setDraggedItem(stepId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropZoneActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(false);
    
    if (draggedItem) {
      const step = availableSteps.find(s => s.id === draggedItem);
      if (step) {
        const newStep: DroppedStep = {
          ...step,
          id: `${step.id}-${Date.now()}`,
          position: droppedSteps.length
        };
        setDroppedSteps(prev => [...prev, newStep]);
      }
    }
    setDraggedItem(null);
  };

  const removeStep = (stepId: string) => {
    setDroppedSteps(prev => prev.filter(step => step.id !== stepId));
  };

  const generateCode = () => {
    if (droppedSteps.length === 0) return "// Drag and drop test steps to generate code";
    
    const codeLines = [
      "import { test, expect } from '@playwright/test';",
      "",
      "test('Generated test scenario', async ({ page }) => {",
      ...droppedSteps.map((step, index) => `  // Step ${index + 1}: ${step.label}`),
      ...droppedSteps.map(step => `  ${step.code}`),
      "});",
      "",
      "// Generated with AI Test Builder"
    ];
    
    return codeLines.join('\n');
  };

  const runTest = async () => {
    if (droppedSteps.length === 0 || isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    setRunningStep(-1);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i < droppedSteps.length; i++) {
      setRunningStep(i);
      setTestResults(prev => [...prev, { step: i, status: 'running' }]);
      
      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      // Most steps pass, but sometimes fail for demo
      const shouldFail = Math.random() < 0.1; // 10% chance of failure
      const status = shouldFail ? 'failed' : 'passed';
      
      setTestResults(prev => prev.map(result => 
        result.step === i ? { ...result, status } : result
      ));
      
      if (shouldFail) {
        // If a step fails, stop execution
        break;
      }
    }
    
    setRunningStep(-1);
    setIsRunning(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-midnight mb-2">Drag & Drop Test Builder</h3>
          <p className="text-slate-600">Build your test scenario by dragging steps into the timeline</p>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Steps */}
            <div>
              <h4 className="text-lg font-semibold text-midnight mb-4">Available Test Steps</h4>
              <div className="space-y-3">
                {availableSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    ref={dragRef}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, step.id)}
                    className="p-4 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-lg transition-all"
                    style={{ borderColor: step.color + '40' }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: step.color + '20', color: step.color }}
                      >
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-midnight">{step.label}</div>
                        <div className="text-sm text-slate-500 font-mono mt-1 truncate">
                          {step.code}
                        </div>
                      </div>
                      <motion.div
                        className="text-slate-400"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Drop Zone and Generated Code */}
            <div className="space-y-6">
              {/* Drop Zone */}
              <div>
                <h4 className="text-lg font-semibold text-midnight mb-4">Test Timeline</h4>
                <motion.div
                  className={`min-h-64 p-6 border-2 border-dashed rounded-xl transition-all ${
                    dropZoneActive 
                      ? 'border-cyan-500 bg-cyan-50' 
                      : droppedSteps.length === 0 
                        ? 'border-slate-300 bg-slate-50' 
                        : 'border-slate-200 bg-white'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  animate={dropZoneActive ? { scale: 1.02 } : {}}
                >
                  <AnimatePresence>
                    {droppedSteps.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center h-full text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <p className="text-center">
                          Drop test steps here to build your scenario
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {droppedSteps.map((step, index) => {
                          const stepResult = testResults.find(r => r.step === index);
                          const isRunning = runningStep === index;
                          const status = stepResult?.status;
                          
                          return (
                            <motion.div
                              key={step.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm ${
                                status === 'passed' ? 'bg-aqua-50 border-aqua-200' :
                                status === 'failed' ? 'bg-red-50 border-red-200' :
                                isRunning ? 'bg-yellow-50 border-yellow-200' :
                                'bg-white border-slate-200'
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              layout
                            >
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                                status === 'passed' ? 'bg-aqua-500 text-white' :
                                status === 'failed' ? 'bg-red-500 text-white' :
                                isRunning ? 'bg-yellow-500 text-white' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {status === 'passed' ? '✓' :
                                 status === 'failed' ? '✗' :
                                 isRunning ? (
                                   <motion.div
                                     animate={{ rotate: 360 }}
                                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                   >
                                     ⟳
                                   </motion.div>
                                 ) :
                                 index + 1}
                              </div>
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: step.color + '20', color: step.color }}
                              >
                                {step.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-midnight">{step.label}</div>
                                {isRunning && (
                                  <div className="text-xs text-yellow-600 mt-1">Executing...</div>
                                )}
                                {status === 'passed' && (
                                  <div className="text-xs text-aqua-600 mt-1">✓ Passed</div>
                                )}
                                {status === 'failed' && (
                                  <div className="text-xs text-red-600 mt-1">✗ Failed</div>
                                )}
                              </div>
                              {!isRunning && !isRunning && (
                                <button
                                  onClick={() => removeStep(step.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Generated Code */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-midnight">Generated Code</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateCode())}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors"
                  >
                    Copy Code
                  </button>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                    <motion.code
                      key={droppedSteps.length}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {generateCode()}
                    </motion.code>
                  </pre>
                </div>
              </div>

              {/* Actions */}
              {droppedSteps.length > 0 && (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={() => {
                      setDroppedSteps([]);
                      setTestResults([]);
                      setRunningStep(-1);
                      setIsRunning(false);
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <motion.button
                    onClick={runTest}
                    disabled={isRunning || droppedSteps.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isRunning 
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                        : droppedSteps.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    }`}
                    whileHover={!isRunning && droppedSteps.length > 0 ? { scale: 1.05 } : {}}
                    whileTap={!isRunning && droppedSteps.length > 0 ? { scale: 0.95 } : {}}
                  >
                    {isRunning ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⟳
                        </motion.div>
                        Running Test...
                      </div>
                    ) : (
                      '▶️ Run Test'
                    )}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropTestBuilder;