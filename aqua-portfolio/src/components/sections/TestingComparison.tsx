'use client';

import { motion } from 'framer-motion';
import TestingComparisonChart from '@/components/ui/TestingComparison';

export default function TestingComparisonSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
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
              Performance Analysis
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-cyan-500 to-cyan-400"></div>
          </div>
          
          <h2 className="text-4xl font-bold text-midnight mb-4">
            Testing Approach Comparison
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            See how AI-powered testing outperforms traditional automation frameworks in reliability, 
            speed, and maintenance efficiency across real-world scenarios.
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span>96% Reliability Score</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-aqua-500"></div>
              <span>Pattern Recognition</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Self-Healing Technology</span>
            </div>
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <TestingComparisonChart />
        </motion.div>

        {/* Technical Insights */}
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-6"
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
            <h3 className="text-lg font-semibold text-midnight mb-2">Superior Reliability</h3>
            <p className="text-sm text-slate-600">AI-powered testing achieves 96% reliability through machine learning pattern recognition and adaptive selector strategies.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-aqua-500/10 to-aqua-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-aqua-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Faster Execution</h3>
            <p className="text-sm text-slate-600">94% speed efficiency with intelligent wait strategies, parallel processing, and optimized element detection algorithms.</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-400/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight mb-2">Low Maintenance</h3>
            <p className="text-sm text-slate-600">95% maintenance efficiency with automatic selector healing, reducing manual intervention by 60% compared to traditional tools.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}