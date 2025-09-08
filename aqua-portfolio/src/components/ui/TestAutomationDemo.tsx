'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  status: 'waiting' | 'active' | 'complete';
  duration: number;
}

const TestAutomationDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps: DemoStep[] = useMemo(() => [
    {
      id: 'navigation',
      title: 'Navigate to Page',
      description: 'Opening test page and handling consent...',
      status: 'waiting',
      duration: 2000
    },
    {
      id: 'selectors',
      title: 'Element Detection',
      description: 'AI detecting page elements and selectors...',
      status: 'waiting',
      duration: 3000
    },
    {
      id: 'testing',
      title: 'Running Tests',
      description: 'Executing automated test scenarios...',
      status: 'waiting',
      duration: 2500
    },
    {
      id: 'healing',
      title: 'Auto Healing',
      description: 'Self-healing broken selectors with AI...',
      status: 'waiting',
      duration: 3500
    }
  ], []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsRunning(false);
          return 0;
        }
      });
    }, steps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [currentStep, isRunning, steps]);

  const startDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
  };

  const stopDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Container with Curved Borders - Hover Trigger */}
      <div 
        className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:border-cyan-200/50"
        onMouseEnter={startDemo}
        onMouseLeave={stopDemo}
        role="region"
        aria-label="AI-powered test automation demo"
        aria-live="polite"
        aria-busy={isRunning}
      >
        {/* Corner Decorations */}
        <svg 
          className="absolute top-0 left-0 w-3 h-3 text-slate-200/50" 
          fill="currentColor" 
          viewBox="0 0 11 11"
        >
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg 
          className="absolute top-0 right-0 w-3 h-3 text-slate-200/50 rotate-90" 
          fill="currentColor" 
          viewBox="0 0 11 11"
        >
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg 
          className="absolute bottom-0 left-0 w-3 h-3 text-slate-200/50 -rotate-90" 
          fill="currentColor" 
          viewBox="0 0 11 11"
        >
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg 
          className="absolute bottom-0 right-0 w-3 h-3 text-slate-200/50 rotate-180" 
          fill="currentColor" 
          viewBox="0 0 11 11"
        >
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200/50 border border-slate-300/50"></div>
              <div className="w-3 h-3 rounded-full bg-slate-200/50 border border-slate-300/50"></div>
              <div className="w-3 h-3 rounded-full bg-slate-200/50 border border-slate-300/50"></div>
            </div>
            <div className="ml-4 flex items-center gap-3">
              <div className={`w-5 h-5 relative ${isRunning ? 'animate-spin' : ''}`}>
                <svg 
                  className="w-full h-full" 
                  fill="none" 
                  viewBox="0 0 20 20"
                >
                  <circle 
                    cx="10" 
                    cy="10" 
                    r="7" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    className="text-slate-300"
                  />
                  <path 
                    d="M17 10C17 13.866 13.866 17 10 17" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    className="text-cyan-500"
                  />
                </svg>
              </div>
              <span className="text-sm font-mono text-slate-600">
                playwright-test-doctor.ts
              </span>
            </div>
          </div>
          <div className="px-4 py-2 text-slate-600 text-sm font-medium">
            {isRunning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                Running...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                </svg>
                Hover to run demo
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative h-80 overflow-hidden">
          {/* Background Code Animation */}
          <div className="absolute inset-4 font-mono text-xs text-slate-400/30 select-none pointer-events-none">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="mb-1"
                animate={{
                  opacity: isRunning ? [0.3, 0.6, 0.3] : 0.3,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: isRunning ? Infinity : 0,
                }}
              >
                {i % 4 === 0 && '  await page.click(selector);'}
                {i % 4 === 1 && '  const element = await page.$(selector);'}
                {i % 4 === 2 && '  if (!element) await healSelector();'}
                {i % 4 === 3 && '  expect(element).toBeVisible();'}
              </motion.div>
            ))}
          </div>

          {/* Central Status Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-200/50 max-w-sm w-full mx-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 relative">
                      <motion.div
                        className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"
                      />
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-midnight">
                        {steps[currentStep]?.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {steps[currentStep]?.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 bg-slate-100 rounded-full h-1">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: (steps[currentStep]?.duration || 2000) / 1000 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/10 to-cyan-400/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-midnight mb-2">
                    AI Test Automation
                  </h3>
                  <p className="text-sm text-slate-600">
                    Watch how our intelligent system detects,<br />
                    tests, and heals web elements automatically
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side Decorative Elements */}
          <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-slate-200/50">
            <div className="p-4 space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`w-3 h-3 rounded-full border ${
                    index < currentStep 
                      ? 'bg-aqua-500 border-aqua-500' 
                      : index === currentStep && isRunning
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'bg-slate-200 border-slate-300'
                  }`}
                  animate={index === currentStep && isRunning ? { 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-20 border-l border-slate-200/50">
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded border border-slate-300/50"
                  animate={isRunning ? {
                    backgroundColor: ['rgb(226, 232, 240)', 'rgb(6, 182, 212)', 'rgb(226, 232, 240)']
                  } : {}}
                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-aqua-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-slate-600">
                  {isRunning ? 'Running' : 'Ready'}
                </span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-slate-500">
                {isRunning ? `Step ${currentStep + 1}/${steps.length}` : 'Idle'}
              </span>
            </div>
            <div className="text-slate-500">
              95% healing success rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAutomationDemo;