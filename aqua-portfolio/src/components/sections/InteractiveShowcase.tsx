'use client';

import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import InfoCardMatrix from '@/components/ui/InfoCardMatrix';

// Lazy load heavy components
const InteractiveTerminal = lazy(() => import('@/components/ui/InteractiveTerminal'));
const RealtimeMetricsDashboard = lazy(() => import('@/components/ui/RealtimeMetricsDashboard'));
const DragDropTestBuilder = lazy(() => import('@/components/ui/DragDropTestBuilder'));
const AIChatInterface = lazy(() => import('@/components/ui/AIChatInterface'));
const TestFailureSimulator = lazy(() => import('@/components/ui/TestFailureSimulator'));
const CodeDiffVisualizer = lazy(() => import('@/components/ui/CodeDiffVisualizer'));
const TimelineJourney = lazy(() => import('@/components/ui/TimelineJourney'));
const CaseStudyVideoMockups = lazy(() => import('@/components/ui/CaseStudyVideoMockups'));
const ProblemSolutionFlow = lazy(() => import('@/components/ui/ProblemSolutionFlow'));
const LoadingStateTheater = lazy(() => import('@/components/ui/LoadingStateTheater'));

const showcaseItems = [
  { id: 'terminal', title: 'Interactive Terminal', component: InteractiveTerminal },
  { id: 'metrics', title: 'Realtime Metrics', component: RealtimeMetricsDashboard },
  { id: 'drag-drop', title: 'Drag & Drop Builder', component: DragDropTestBuilder },
  { id: 'ai-chat', title: 'AI Chat Interface', component: AIChatInterface },
  { id: 'failure-sim', title: 'Failure Simulator', component: TestFailureSimulator },
  { id: 'code-diff', title: 'Code Diff Visualizer', component: CodeDiffVisualizer },
  { id: 'timeline', title: 'Timeline Journey', component: TimelineJourney },
  { id: 'video-mockups', title: 'Case Study Videos', component: CaseStudyVideoMockups },
  { id: 'problem-flow', title: 'Problem→Solution Flow', component: ProblemSolutionFlow },
  { id: 'loading', title: 'Loading Theater', component: LoadingStateTheater }
];

// Loading component for lazy-loaded components
const ComponentLoader = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl p-12 shadow-xl border border-slate-200 animate-pulse">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-slate-100 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function InteractiveShowcase() {
  const [selectedComponent, setSelectedComponent] = useState(showcaseItems[0].id);

  const CurrentComponent = showcaseItems.find(item => item.id === selectedComponent)?.component;

  return (
    <div className="relative min-h-screen py-20 px-6">
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="relative bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center overflow-hidden">
            <InfoCardMatrix intensity="medium" className="rounded-2xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-midnight mb-4">
                Interactive Testing Showcase
              </h2>
              <p className="text-xl text-slate-600">
                Explore cutting-edge test automation visualizations and AI-powered features
              </p>
            </div>
          </div>
        </motion.div>

        {/* Component Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {showcaseItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedComponent(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedComponent === item.id
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.title}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Component Display Area */}
        <motion.div
          key={selectedComponent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex justify-center group"
        >
          <Suspense fallback={<ComponentLoader />}>
            {CurrentComponent && <CurrentComponent />}
          </Suspense>
          
          {/* Hover Demo Button - Hidden until hover */}
          <motion.div
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="px-3 py-1 bg-slate-900/80 hover:bg-slate-900 text-white text-xs rounded-full backdrop-blur-sm shadow-lg border border-slate-600"
              whileHover={{ scale: 1.05, backgroundColor: '#1e293b' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Trigger demo for specific components
                const demoTriggers: Record<string, () => void> = {
                  'terminal': () => {
                    // Find and trigger demo command in terminal
                    const terminalButtons = document.querySelectorAll('button');
                    const demoButton = Array.from(terminalButtons).find(btn => 
                      btn.textContent?.includes('npm test') || btn.textContent?.includes('playwright test')
                    );
                    demoButton?.click();
                  },
                  'drag-drop': () => {
                    // Trigger test run if steps exist
                    const runButton = document.querySelector('button') as HTMLButtonElement;
                    if (runButton && runButton.textContent?.includes('Run Test')) {
                      runButton.click();
                    }
                  },
                  'failure-sim': () => {
                    // Trigger simulation
                    const simButtons = document.querySelectorAll('button');
                    const simButton = Array.from(simButtons).find(btn => 
                      btn.textContent?.includes('Simulate Healing')
                    );
                    simButton?.click();
                  },
                  'loading': () => {
                    // Trigger play/pause
                    const playButton = document.querySelector('button') as HTMLButtonElement;
                    if (playButton && (playButton.textContent?.includes('Play') || playButton.textContent?.includes('Pause'))) {
                      playButton.click();
                    }
                  },
                  'problem-flow': () => {
                    // Trigger auto tour
                    const tourButton = document.querySelector('button') as HTMLButtonElement;
                    if (tourButton && tourButton.textContent?.includes('Auto Tour')) {
                      tourButton.click();
                    }
                  }
                };
                
                const trigger = demoTriggers[selectedComponent];
                if (trigger) trigger();
              }}
            >
              <Image src="/icons/demo-play.svg" alt="Demo" width={16} height={16} className="inline mr-1" />
              Run Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl px-6 py-4 border border-cyan-200">
            <p className="text-sm text-slate-700">
              <Image src="/icons/lightbulb.svg" alt="Tip" width={16} height={16} className="inline mr-1" />
              <strong>Pro Tip:</strong> Each component showcases different aspects of modern test automation,
              from AI-powered healing to real-time metrics visualization. Interact with them to see the magic!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}