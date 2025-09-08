'use client';

import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';

// Dynamic import for heavy component
const TestAutomationDemo = lazy(() => import('@/components/ui/TestAutomationDemo'));

// Loading component
const DemoLoader = () => (
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

export default function TestDemo() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
            <span className="text-sm font-medium text-cyan-600 tracking-wider uppercase">
              Live Demo
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-cyan-500 to-cyan-400"></div>
          </div>
          
          <h2 className="text-4xl font-bold text-midnight mb-4">
            AI-Powered Test Automation
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            Experience how our intelligent testing system automatically detects page elements, 
            runs comprehensive tests, and self-heals broken selectors using advanced AI pattern recognition.
          </p>
          
          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-aqua-500"></div>
              <span>95% Auto-healing Success</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span>60% Less Maintenance</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Real-time Element Detection</span>
            </div>
          </div>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Suspense fallback={<DemoLoader />}>
            <TestAutomationDemo />
          </Suspense>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-cyan-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Smart Detection</h3>
            <p className="text-sm text-slate-600">AI-powered element detection with machine learning pattern recognition for robust selector generation.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-aqua-500/10 to-aqua-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-aqua-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Self-Healing</h3>
            <p className="text-sm text-slate-600">Automatic selector repair when elements change, maintaining test stability with zero manual intervention.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Fast Execution</h3>
            <p className="text-sm text-slate-600">Optimized test execution with parallel processing and intelligent wait strategies for maximum speed.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Analytics</h3>
            <p className="text-sm text-slate-600">Comprehensive reporting with success rates, performance metrics, and actionable insights for continuous improvement.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}