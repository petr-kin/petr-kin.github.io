'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingAnimation {
  id: string;
  title: string;
  description: string;
  duration: number;
  component: React.ReactNode;
}

const LoadingStateTheater = () => {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect mobile and reduced motion preferences
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkMobile();
    checkReducedMotion();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized animation variants based on device capabilities
  const animationVariants = useMemo(() => ({
    desktop: {
      rotate: 360,
      duration: 2,
      ease: "linear",
      repeat: Infinity
    },
    mobile: {
      rotate: 360,
      duration: 3, // Slower on mobile
      ease: "linear",
      repeat: Infinity
    },
    reduced: {
      rotate: 0, // No rotation for reduced motion
      duration: 1,
      ease: "linear",
      repeat: 0
    }
  }), []);

  // Get appropriate animation settings
  const getAnimationSettings = () => {
    if (reducedMotion) return animationVariants.reduced;
    return isMobile ? animationVariants.mobile : animationVariants.desktop;
  };

  const animations: LoadingAnimation[] = useMemo(() => [
    {
      id: 'test-runner',
      title: 'Test Suite Execution',
      description: 'Running comprehensive test suite across browsers',
      duration: 4000,
      component: (
        <div className="relative w-64 h-64">
          {/* Simplified central spinner - use CSS animation instead of Framer Motion for better performance */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-200">
              <div 
                className="w-full h-full rounded-full border-4 border-cyan-500 border-t-transparent" 
                style={{
                  animation: reducedMotion ? 'none' : `spin ${getAnimationSettings().duration}s linear infinite`
                }}
              />
            </div>
          </div>

          {/* Reduced orbiting icons - only show 2 on mobile, 4 on desktop */}
          {(isMobile ? ['✓', '⚡'] : ['✓', '⚡', '🔍', '📊']).map((icon, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={reducedMotion ? {} : {
                duration: 4 + index,
                repeat: Infinity,
                ease: "linear",
                delay: index * (isMobile ? 0.5 : 0.25)
              }}
            >
              <div
                className="absolute w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-sm text-sm"
                style={{ top: '20%', transform: `translateX(${isMobile ? 60 : 80}px)` }}
              >
                {icon}
              </div>
            </motion.div>
          ))}

          {/* Progress text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600">
                {Math.floor(progress * 100)}%
              </div>
              <div className="text-sm text-slate-600">Running Tests</div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'ai-healing',
      title: 'AI Healing Process',
      description: 'Intelligent selector healing in progress',
      duration: 5000,
      component: (
        <div className="relative w-64 h-64">
          {/* DNA Helix Animation */}
          <svg className="w-full h-full" viewBox="0 0 256 256">
            {[...Array(20)].map((_, i) => {
              const y = i * 12 + 10;
              return (
                <motion.g key={i}>
                  <motion.circle
                    cx={128 + Math.sin(i * 0.5) * 40}
                    cy={y}
                    r="4"
                    fill="#8b5cf6"
                    animate={{
                      cx: [128 + Math.sin(i * 0.5) * 40, 128 - Math.sin(i * 0.5) * 40, 128 + Math.sin(i * 0.5) * 40],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                  <motion.circle
                    cx={128 - Math.sin(i * 0.5) * 40}
                    cy={y}
                    r="4"
                    fill="#06b6d4"
                    animate={{
                      cx: [128 - Math.sin(i * 0.5) * 40, 128 + Math.sin(i * 0.5) * 40, 128 - Math.sin(i * 0.5) * 40],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                  <motion.line
                    x1={128 + Math.sin(i * 0.5) * 40}
                    y1={y}
                    x2={128 - Math.sin(i * 0.5) * 40}
                    y2={y}
                    stroke="#10b981"
                    strokeWidth="1"
                    opacity="0.3"
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.05
                    }}
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* Healing particles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-aqua-400 rounded-full"
              initial={{
                x: Math.random() * 256,
                y: 256,
                opacity: 0
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}

          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-sm font-medium text-purple-600">Healing Selectors</div>
            <div className="text-xs text-slate-500">AI analyzing DOM patterns...</div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'code-generation',
      title: 'Test Code Generation',
      description: 'AI generating optimized test scenarios',
      duration: 4500,
      component: (
        <div className="relative w-64 h-64 bg-slate-900 rounded-lg p-4 overflow-hidden">
          {/* Code lines animation */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * 0.2,
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 text-slate-500 text-xs"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                >
                  {i + 1}
                </motion.div>
                <motion.div
                  className="h-3 rounded"
                  style={{
                    width: `${60 + Math.random() * 40}%`,
                    backgroundColor: ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'][i % 4]
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scaleX: [0, 1, 1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.15
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* Cursor animation */}
          <motion.div
            className="absolute w-1 h-4 bg-cyan-400"
            animate={{
              x: [20, 200, 20],
              y: [20, 20, 40, 40, 60, 60, 80, 80, 100, 100, 120, 120, 20]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Status text */}
          <motion.div
            className="absolute bottom-2 left-4 right-4 text-xs text-aqua-400 font-mono"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Generating test code...
          </motion.div>
        </div>
      )
    },
    {
      id: 'browser-matrix',
      title: 'Cross-Browser Testing',
      description: 'Executing tests across all major browsers',
      duration: 5500,
      component: (
        <div className="relative w-64 h-64">
          {/* Browser grid */}
          <div className="grid grid-cols-2 gap-4 p-8">
            {[
              { name: 'Chrome', color: '#4285F4', icon: '🌐' },
              { name: 'Firefox', color: '#FF7139', icon: '🦊' },
              { name: 'Safari', color: '#006CFF', icon: '🧭' },
              { name: 'Edge', color: '#0078D4', icon: '🌊' }
            ].map((browser, index) => (
              <motion.div
                key={browser.name}
                className="relative w-24 h-24 rounded-lg flex flex-col items-center justify-center"
                style={{ backgroundColor: `${browser.color}20`, border: `2px solid ${browser.color}` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1, 1, 0],
                  rotate: [- 180, 0, 0, 180]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                <motion.div
                  className="text-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.25 }}
                >
                  {browser.icon}
                </motion.div>
                <div className="text-xs mt-2" style={{ color: browser.color }}>
                  {browser.name}
                </div>
                
                {/* Success indicator */}
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-aqua-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.5 + 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {[0, 1, 2, 3].map(i => (
              <motion.line
                key={`line-${i}`}
                x1="128"
                y1="128"
                x2={128 + Math.cos(i * Math.PI / 2) * 80}
                y2={128 + Math.sin(i * Math.PI / 2) * 80}
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.3"
                animate={{
                  strokeDashoffset: [0, -10]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </svg>
        </div>
      )
    },
    {
      id: 'performance-pulse',
      title: 'Performance Monitoring',
      description: 'Real-time test performance analysis',
      duration: 4000,
      component: (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Pulse rings */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                width: 50 + i * 40,
                height: 50 + i * 40,
                borderColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'][i]
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}

          {/* Central metrics */}
          <div className="relative z-10 text-center">
            <motion.div
              className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.floor(progress * 100)}%
            </motion.div>
            <div className="text-xs text-slate-600 mt-1">Performance Score</div>
          </div>

          {/* Orbiting metrics */}
          {['CPU', 'RAM', 'FPS', 'MS'].map((metric, i) => (
            <motion.div
              key={metric}
              className="absolute"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                width: '100%',
                height: '100%'
              }}
            >
              <div
                className="absolute w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold"
                style={{
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'][i]
                }}
              >
                {metric}
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'quantum-loading',
      title: 'Quantum Test Analysis',
      description: 'Advanced AI processing test patterns',
      duration: 6000,
      component: (
        <div className="relative w-64 h-64">
          {/* Quantum particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const radius = 80;
              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: 128 + Math.cos(angle) * radius,
                    top: 128 + Math.sin(angle) * radius,
                    background: `radial-gradient(circle, ${['#06b6d4', '#8b5cf6', '#10b981'][i % 3]} 0%, transparent 70%)`
                  }}
                  animate={{
                    x: [0, Math.cos(angle + Math.PI) * 40, 0],
                    y: [0, Math.sin(angle + Math.PI) * 40, 0],
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              );
            })}
          </div>

          {/* Central quantum core */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-cyan-500 to-blue-500"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [-360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-slate-900"
                animate={{
                  scale: [1, 0.8, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                AI
              </div>
            </div>
          </motion.div>

          {/* Quantum connections */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(8)].map((_, i) => {
              const angle1 = (i / 8) * Math.PI * 2;
              const angle2 = ((i + 1) / 8) * Math.PI * 2;
              return (
                <motion.path
                  key={`path-${i}`}
                  d={`M ${128 + Math.cos(angle1) * 80} ${128 + Math.sin(angle1) * 80} Q 128 128 ${128 + Math.cos(angle2) * 80} ${128 + Math.sin(angle2) * 80}`}
                  fill="none"
                  stroke={['#06b6d4', '#8b5cf6', '#10b981'][i % 3]}
                  strokeWidth="1"
                  opacity="0.3"
                  animate={{
                    strokeDasharray: ['0 100', '100 0'],
                    opacity: [0.1, 0.5, 0.1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              );
            })}
          </svg>
        </div>
      )
    }
  ], [isMobile, reducedMotion, animationVariants, getAnimationSettings]);

  const currentAnimationData = animations[currentAnimation];

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    // Optimized progress animation - reduce update frequency on mobile
    const updateInterval = isMobile ? 200 : 100;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          // Move to next animation
          setCurrentAnimation(current => (current + 1) % animations.length);
          return 0;
        }
        return prev + (updateInterval / currentAnimationData.duration);
      });
    }, updateInterval);

    return () => clearInterval(progressInterval);
  }, [isPlaying, currentAnimationData.duration, animations.length, isMobile, reducedMotion]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-midnight mb-2">Loading State Theater</h3>
          <p className="text-slate-600">Beautiful animations for every testing process</p>
        </div>

        <div className="p-8">
          {/* Animation Stage */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 mb-8">
            <div className="flex flex-col items-center">
              {/* Current Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAnimationData.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  {currentAnimationData.component}
                </motion.div>
              </AnimatePresence>

              {/* Animation Info */}
              <motion.div
                className="text-center mb-6"
                key={currentAnimationData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-midnight mb-2">
                  {currentAnimationData.title}
                </h4>
                <p className="text-sm text-slate-600">
                  {currentAnimationData.description}
                </p>
              </motion.div>

              {/* Progress Bar */}
              <div className="w-full max-w-md">
                <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>0%</span>
                  <span>{Math.floor(progress * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Gallery */}
          <div>
            <h4 className="text-lg font-semibold text-midnight mb-4">Animation Gallery</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {animations.map((animation, index) => (
                <motion.button
                  key={animation.id}
                  onClick={() => {
                    setCurrentAnimation(index);
                    setProgress(0);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentAnimation === index
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-sm font-medium text-midnight mb-1">
                    {animation.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Duration: {animation.duration / 1000}s
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              onClick={() => setCurrentAnimation(prev => prev > 0 ? prev - 1 : animations.length - 1)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </motion.button>

            <motion.button
              onClick={() => setCurrentAnimation(prev => (prev + 1) % animations.length)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingStateTheater;