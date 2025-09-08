'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

interface ComparisonData {
  name: string;
  icon: React.ReactNode;
  reliability: number;
  speed: number;
  maintenance: number;
  description: string;
  isHighlighted?: boolean;
}

const TestingComparison = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const [isVisible, setIsVisible] = useState(false);

  const testingApproaches: ComparisonData[] = [
    {
      name: "AI-Powered Testing",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      reliability: 96,
      speed: 94,
      maintenance: 95,
      description: "Self-healing with pattern recognition",
      isHighlighted: true
    },
    {
      name: "Playwright",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      reliability: 89,
      speed: 91,
      maintenance: 78,
      description: "Modern browser automation"
    },
    {
      name: "Cypress",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      reliability: 82,
      speed: 85,
      maintenance: 71,
      description: "JavaScript-first testing"
    },
    {
      name: "Selenium",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      reliability: 75,
      speed: 68,
      maintenance: 58,
      description: "Traditional web automation"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-6xl mx-auto" style={{ transform: 'translateZ(0)' }}>
      {/* Optimized SVG Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <Image
          src="/icons/test-flow-bg.svg"
          alt=""
          fill
          className="object-contain text-cyan-500"
          style={{ filter: 'hue-rotate(180deg)' }}
        />
      </div>

      {/* Optimized Floating Particles - Only animate when in view */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: i % 2 === 0 ? '6px' : '8px',
              height: i % 2 === 0 ? '6px' : '8px',
              left: `${15 + (i * 9)}%`,
              top: `${25 + (i % 3) * 15}%`,
              willChange: isInView ? 'transform, opacity' : 'auto'
            }}
            animate={isInView ? {
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.7, 1.2, 0.7]
            } : {}}
            transition={{
              duration: 4 + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      {/* Main Container with Curved Borders */}
      <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl">
        {/* Corner Decorations */}
        <svg className="absolute top-0 left-0 w-3 h-3 text-slate-200/50" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute top-0 right-0 w-3 h-3 text-slate-200/50 rotate-90" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-3 h-3 text-slate-200/50 -rotate-90" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-3 h-3 text-slate-200/50 rotate-180" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>

        {/* Header Section */}
        <div className="relative p-8 lg:p-12 border-b border-slate-200/50">
          <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Testing approaches compared
          </div>
          <div className="text-xl text-midnight-300">
            <span className="font-semibold text-midnight">AI-powered excellence.</span>{' '}
            Covers 96% reliability with intelligent self-healing,{' '}
            <br className="hidden lg:block" />
            reducing maintenance overhead by 60%.
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="relative">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-8 px-8 lg:px-16 py-4 border-b border-slate-200/50 text-sm text-slate-500">
            <div>Tool</div>
            <div>Reliability</div>
            <div>Speed</div>
            <div>Maintenance</div>
          </div>

          {/* Data Rows */}
          <div className="relative">
            {testingApproaches.map((tool, index) => (
              <motion.div
                key={tool.name}
                className={`grid grid-cols-4 gap-8 px-8 lg:px-16 py-6 border-b border-slate-200/50 items-center ${
                  tool.isHighlighted ? 'bg-gradient-to-r from-cyan-50/50 to-transparent' : ''
                }`}
                initial={{ opacity: 0, x: -100 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.3, duration: 0.8 }}
              >
                {/* Tool Info */}
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`p-3 rounded-xl relative overflow-hidden cursor-pointer ${
                      tool.isHighlighted 
                        ? 'bg-gradient-to-br from-cyan-500 to-cyan-400 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {tool.isHighlighted && (
                      <motion.div 
                        className="absolute inset-0 bg-white/30 rounded-xl"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0.1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    <div className="relative z-10">
                      {tool.icon}
                    </div>
                  </motion.div>
                  <div>
                    <div className={`font-medium ${
                      tool.isHighlighted ? 'text-midnight' : 'text-slate-700'
                    }`}>
                      {tool.name}
                    </div>
                    <div className="text-sm text-slate-500">{tool.description}</div>
                  </div>
                </div>

                {/* Reliability Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          tool.isHighlighted 
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' 
                            : 'bg-slate-300'
                        }`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${tool.reliability}%` } : {}}
                        transition={{ delay: index * 0.3 + 1, duration: 2, ease: "easeOut" }}
                      />
                      {tool.isHighlighted && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-cyan-300/50 rounded-full"
                          animate={{ 
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <motion.span 
                      className={`text-sm font-bold tabular-nums min-w-[3rem] ${
                        tool.isHighlighted ? 'text-cyan-600' : 'text-slate-600'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={isVisible ? { opacity: 1 } : {}}
                      transition={{ delay: index * 0.3 + 2, duration: 0.5 }}
                    >
                      {tool.reliability}%
                    </motion.span>
                  </div>
                </div>

                {/* Speed Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          tool.isHighlighted 
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' 
                            : 'bg-slate-300'
                        }`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${tool.speed}%` } : {}}
                        transition={{ delay: index * 0.3 + 1.3, duration: 2, ease: "easeOut" }}
                      />
                      {tool.isHighlighted && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-cyan-300/50 rounded-full"
                          animate={{ 
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 1.7, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <motion.span 
                      className={`text-sm font-bold tabular-nums min-w-[3rem] ${
                        tool.isHighlighted ? 'text-cyan-600' : 'text-slate-600'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={isVisible ? { opacity: 1 } : {}}
                      transition={{ delay: index * 0.3 + 2.3, duration: 0.5 }}
                    >
                      {tool.speed}%
                    </motion.span>
                  </div>
                </div>

                {/* Maintenance Bar */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          tool.isHighlighted 
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' 
                            : 'bg-slate-300'
                        }`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${tool.maintenance}%` } : {}}
                        transition={{ delay: index * 0.3 + 1.6, duration: 2, ease: "easeOut" }}
                      />
                      {tool.isHighlighted && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-cyan-300/50 rounded-full"
                          animate={{ 
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 1.9, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <motion.span 
                      className={`text-sm font-bold tabular-nums min-w-[3rem] ${
                        tool.isHighlighted ? 'text-cyan-600' : 'text-slate-600'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={isVisible ? { opacity: 1 } : {}}
                      transition={{ delay: index * 0.3 + 2.6, duration: 0.5 }}
                    >
                      {tool.maintenance}%
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating Icon */}
          <div className="absolute bottom-8 right-8">
            <motion.div
              className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-200/50"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Bottom Summary with COLOR CHANGING TEXT */}
        <motion.div 
          className="p-8 lg:p-12 bg-gradient-to-r from-slate-50/50 to-transparent border-t border-slate-200/50"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <div className="text-sm text-slate-600 mb-2">Performance Summary</div>
          <div className="text-lg text-midnight-300">
            AI-powered testing delivers superior results with{' '}
            <motion.span 
              className="font-bold text-2xl"
              animate={{ 
                color: ['#0891b2', '#06b6d4', '#67e8f9', '#0891b2'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              96% reliability
            </motion.span>,{' '}
            <motion.span 
              className="font-bold text-2xl"
              animate={{ 
                color: ['#0891b2', '#06b6d4', '#67e8f9', '#0891b2'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            >
              94% speed
            </motion.span>, and{' '}
            <motion.span 
              className="font-bold text-2xl"
              animate={{ 
                color: ['#0891b2', '#06b6d4', '#67e8f9', '#0891b2'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
            >
              95% maintenance efficiency
            </motion.span>{' '}
            through intelligent automation.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestingComparison;