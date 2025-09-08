'use client';

import { motion } from 'framer-motion';
import TestingInAction from '@/components/ui/TestingInAction';

export default function TestingInActionSection() {
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
              Interactive Demo
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-cyan-500 to-cyan-400"></div>
          </div>
          
          <h2 className="text-4xl font-bold text-midnight mb-4">
            Testing in Action
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            Experience how AI-powered testing adapts to changing interfaces, heals broken selectors, 
            and maintains test stability through intelligent automation and pattern recognition.
          </p>
          
          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span>Click scenarios to see code</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-aqua-500"></div>
              <span>Watch animated generation</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Real testing scenarios</span>
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
          <TestingInAction />
        </motion.div>

        {/* Technical Benefits */}
        <motion.div
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-cyan-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Resilient Selectors</h3>
            <p className="text-sm text-slate-600">Advanced AI algorithms automatically adapt to UI changes, maintaining test stability with fallback selector strategies.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-aqua-500/10 to-blue-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-aqua-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Performance Monitoring</h3>
            <p className="text-sm text-slate-600">Real-time performance metrics collection during test execution, ensuring optimal user experience validation.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Auto-Healing</h3>
            <p className="text-sm text-slate-600">Machine learning-powered test recovery that automatically fixes broken tests through intelligent DOM analysis.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}