'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealingStep {
  id: string;
  phase: 'detecting' | 'analyzing' | 'healing' | 'validating' | 'complete';
  title: string;
  description: string;
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'error';
  details?: string[];
}

interface FailedTest {
  id: string;
  name: string;
  selector: string;
  newSelector: string;
  error: string;
  healingSteps: HealingStep[];
}

const TestFailureSimulator = () => {
  const [currentTest, setCurrentTest] = useState<FailedTest | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const failedTests: FailedTest[] = [
    {
      id: 'login-test',
      name: 'Login Form Submission',
      selector: 'button.submit-btn',
      newSelector: 'button[data-testid="login-submit"]',
      error: 'Element not found: selector "button.submit-btn" did not match any elements',
      healingSteps: [
        {
          id: 'detect',
          phase: 'detecting',
          title: 'Detecting Failure',
          description: 'Test failed - analyzing error patterns',
          duration: 1000,
          status: 'pending',
          details: [
            'Error: TimeoutError: waiting for selector "button.submit-btn"',
            'Screenshot captured for analysis',
            'DOM structure retrieved'
          ]
        },
        {
          id: 'analyze',
          phase: 'analyzing',
          title: 'AI Analysis',
          description: 'Scanning DOM for similar elements',
          duration: 2000,
          status: 'pending',
          details: [
            'Found 3 similar button elements',
            'Analyzing semantic patterns',
            'Checking accessibility attributes'
          ]
        },
        {
          id: 'heal',
          phase: 'healing',
          title: 'Auto-Healing',
          description: 'Generating new selector strategy',
          duration: 1500,
          status: 'pending',
          details: [
            'Testing alternative selector: button[type="submit"]',
            'Validating with data-testid attributes',
            'Final selector: button[data-testid="login-submit"]'
          ]
        },
        {
          id: 'validate',
          phase: 'validating',
          title: 'Validation',
          description: 'Testing healed selector reliability',
          duration: 1000,
          status: 'pending',
          details: [
            'Element successfully located',
            'Interaction test passed',
            'Selector reliability: 98%'
          ]
        },
        {
          id: 'complete',
          phase: 'complete',
          title: 'Healing Complete',
          description: 'Test updated and re-executed',
          duration: 500,
          status: 'pending',
          details: [
            'Test file updated automatically',
            'Re-running test with new selector',
            'Test passed successfully!'
          ]
        }
      ]
    },
    {
      id: 'navigation-test',
      name: 'Menu Navigation',
      selector: '.nav-menu-item:nth-child(3)',
      newSelector: 'nav[role="navigation"] >> text="Dashboard"',
      error: 'Element index out of bounds: menu has only 2 items',
      healingSteps: [
        {
          id: 'detect',
          phase: 'detecting',
          title: 'Index Error Detected',
          description: 'Positional selector failed due to DOM changes',
          duration: 800,
          status: 'pending',
          details: [
            'nth-child(3) selector failed',
            'Menu structure changed: 3 → 2 items',
            'Initiating semantic healing'
          ]
        },
        {
          id: 'analyze',
          phase: 'analyzing',
          title: 'Semantic Analysis',
          description: 'Converting to text-based selector',
          duration: 1800,
          status: 'pending',
          details: [
            'Analyzing menu item text content',
            'Found target: "Dashboard" link',
            'Building semantic selector strategy'
          ]
        },
        {
          id: 'heal',
          phase: 'healing',
          title: 'Selector Evolution',
          description: 'Generating robust text-based selector',
          duration: 1200,
          status: 'pending',
          details: [
            'Strategy: Role-based + text content',
            'New selector: nav[role="navigation"] >> text="Dashboard"',
            'Resilient to DOM structure changes'
          ]
        },
        {
          id: 'validate',
          phase: 'validating',
          title: 'Robustness Test',
          description: 'Validating across different scenarios',
          duration: 1500,
          status: 'pending',
          details: [
            'Testing with different menu states',
            'Cross-browser compatibility check',
            'Performance impact: minimal'
          ]
        },
        {
          id: 'complete',
          phase: 'complete',
          title: 'Navigation Fixed',
          description: 'Robust selector deployed successfully',
          duration: 600,
          status: 'pending',
          details: [
            'Selector updated in test suite',
            'Test execution successful',
            'Future-proofed against DOM changes'
          ]
        }
      ]
    }
  ];

  const startSimulation = async (test: FailedTest) => {
    if (isSimulating) return;
    
    setCurrentTest({ ...test, healingSteps: test.healingSteps.map(step => ({ ...step, status: 'pending' })) });
    setIsSimulating(true);

    // Reset all steps
    for (let stepIndex = 0; stepIndex < test.healingSteps.length; stepIndex++) {
      
      // Mark current step as active
      setCurrentTest(prev => prev ? {
        ...prev,
        healingSteps: prev.healingSteps.map((step, index) => ({
          ...step,
          status: index === stepIndex ? 'active' : index < stepIndex ? 'completed' : 'pending'
        }))
      } : null);

      await new Promise(resolve => setTimeout(resolve, test.healingSteps[stepIndex].duration));

      // Mark current step as completed
      setCurrentTest(prev => prev ? {
        ...prev,
        healingSteps: prev.healingSteps.map((step, index) => ({
          ...step,
          status: index <= stepIndex ? 'completed' : 'pending'
        }))
      } : null);

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsSimulating(false);
  };

  const getStepIcon = (step: HealingStep) => {
    switch (step.phase) {
      case 'detecting':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'analyzing':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'healing':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      case 'validating':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'complete':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-midnight mb-2">AI Test Failure Simulator</h3>
          <p className="text-slate-600">Watch AI automatically heal broken test selectors in real-time</p>
        </div>

        <div className="p-8">
          {/* Test Scenarios */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-midnight mb-4">Failed Test Scenarios</h4>
            <div className="grid gap-4">
              {failedTests.map((test) => (
                <motion.div
                  key={test.id}
                  className="p-4 border border-slate-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => startSimulation(test)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <h5 className="font-semibold text-midnight">{test.name}</h5>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        <div className="font-mono bg-slate-100 px-2 py-1 rounded text-xs mb-1">
                          Failed: {test.selector}
                        </div>
                        <div className="text-red-600">{test.error}</div>
                      </div>
                    </div>
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                      disabled={isSimulating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSimulating && currentTest?.id === test.id ? 'Healing...' : 'Simulate Healing'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Healing Process Visualization */}
          <AnimatePresence>
            {currentTest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-cyan-500"
                      animate={isSimulating ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <h4 className="text-lg font-semibold text-midnight">
                      Healing: {currentTest.name}
                    </h4>
                  </div>
                  {!isSimulating && (
                    <div className="text-sm text-aqua-600 font-medium">
                      ✓ Healing Complete
                    </div>
                  )}
                </div>

                {/* Selector Comparison */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Before (Broken)</div>
                      <div className="font-mono text-sm bg-red-50 border border-red-200 rounded p-2 text-red-700">
                        {currentTest.selector}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-2">After (Healed)</div>
                      <div className="font-mono text-sm bg-aqua-50 border border-aqua-200 rounded p-2 text-aqua-700">
                        {currentTest.newSelector}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Healing Steps */}
                <div className="space-y-4">
                  {currentTest.healingSteps.map((step, index) => {
                    const isActive = step.status === 'active';
                    const isCompleted = step.status === 'completed';
                    
                    return (
                      <motion.div
                        key={step.id}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          isActive ? 'border-amber-300 bg-amber-50' :
                          isCompleted ? 'border-aqua-300 bg-aqua-50' :
                          'border-slate-200 bg-white'
                        }`}
                        initial={{ opacity: 0.5, x: -20 }}
                        animate={{ 
                          opacity: step.status === 'pending' ? 0.5 : 1,
                          x: 0,
                          scale: isActive ? 1.02 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Connection Line */}
                        {index < currentTest.healingSteps.length - 1 && (
                          <div 
                            className={`absolute left-6 -bottom-4 w-0.5 h-8 ${
                              isCompleted ? 'bg-green-400' : 'bg-slate-300'
                            }`}
                          />
                        )}

                        <div className="flex items-start gap-4">
                          {/* Step Icon */}
                          <motion.div
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                              isActive ? 'bg-amber-200 text-amber-700' :
                              isCompleted ? 'bg-aqua-200 text-aqua-700' :
                              'bg-slate-200 text-slate-500'
                            }`}
                            animate={isActive ? { 
                              rotate: [0, 360],
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {getStepIcon(step)}
                          </motion.div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`font-semibold ${
                                isActive ? 'text-amber-900' :
                                isCompleted ? 'text-aqua-900' :
                                'text-slate-700'
                              }`}>
                                {step.title}
                              </h5>
                              <div className="flex items-center gap-2">
                                {isActive && (
                                  <motion.div
                                    className="text-xs text-amber-600 font-medium"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    Processing...
                                  </motion.div>
                                )}
                                {isCompleted && (
                                  <div className="text-xs text-aqua-600 font-medium">
                                    ✓ Complete
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${
                              isActive ? 'text-amber-800' :
                              isCompleted ? 'text-aqua-800' :
                              'text-slate-600'
                            }`}>
                              {step.description}
                            </p>

                            {/* Step Details */}
                            {(isActive || isCompleted) && step.details && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1"
                              >
                                {step.details.map((detail, detailIndex) => (
                                  <motion.div
                                    key={detailIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: detailIndex * 0.1 }}
                                    className={`text-xs font-mono p-2 rounded ${
                                      isActive ? 'bg-amber-100 text-amber-800' :
                                      'bg-aqua-100 text-aqua-800'
                                    }`}
                                  >
                                    {detail}
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TestFailureSimulator;