'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TechTool {
  id: string;
  name: string;
  color: string;
  paths: string[];
  description: string;
}

const MorphingTechIcons = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })
  const prefersReducedMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const techTools: TechTool[] = [
    {
      id: 'playwright',
      name: 'Playwright',
      color: '#2D8A3E',
      description: 'End-to-end testing for modern apps',
      paths: [
        'M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L10.91 8.26L12 2Z',
        'M12 6V18M6 12H18',
        'M9 12L12 15L22 5'
      ]
    },
    {
      id: 'cypress',
      name: 'Cypress',
      color: '#17202C',
      description: 'JavaScript end-to-end testing framework',
      paths: [
        'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z',
        'M12 8C8.13 8 5 11.13 5 15C5 18.87 8.13 22 12 22C15.87 22 19 18.87 19 15C19 11.13 15.87 8 12 8Z',
        'M12 11C13.66 11 15 12.34 15 14C15 15.66 13.66 17 12 17C10.34 17 9 15.66 9 14C9 12.34 10.34 11 12 11Z'
      ]
    },
    {
      id: 'selenium',
      name: 'Selenium',
      color: '#43B02A',
      description: 'Automated testing for web applications',
      paths: [
        'M12 2L2 7L12 12L22 7L12 2Z',
        'M2 17L12 22L22 17',
        'M2 12L12 17L22 12'
      ]
    },
    {
      id: 'jest',
      name: 'Jest',
      color: '#C21325',
      description: 'JavaScript testing framework',
      paths: [
        'M22 12C22 17.52 17.52 22 12 22S2 17.52 2 12S6.48 2 12 2S22 6.48 22 12Z',
        'M12 6V12L16 14',
        'M8 12H16M8 8H16M8 16H16'
      ]
    }
  ];

  const currentTool = techTools[currentIndex];

  useEffect(() => {
    if (isHovered || !isInView || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % techTools.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, isInView, prefersReducedMotion, techTools.length]);

  return (
    <div ref={ref} className="flex items-center justify-center" style={{ transform: 'translateZ(0)' }}>
      <motion.div 
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Main Icon Container */}
        <motion.div
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ backgroundColor: `${currentTool.color}20`, willChange: isInView ? 'transform' : 'auto' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentIndex(prev => (prev + 1) % techTools.length)}
        >
          {/* Background Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-20"
            style={{ backgroundColor: currentTool.color, willChange: isInView ? 'transform, opacity' : 'auto' }}
            animate={isInView && !prefersReducedMotion ? {
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            } : {}}
            transition={{ 
              duration: prefersReducedMotion ? 0.1 : 2, 
              repeat: prefersReducedMotion ? 0 : Infinity 
            }}
          />

          {/* Icon SVG */}
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill={currentTool.color}
            className="relative z-10"
            initial={false}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            key={currentTool.id}
          >
            <AnimatePresence>
              {currentTool.paths.map((path, index) => (
                <motion.path
                  key={`${currentTool.id}-${index}`}
                  d={path}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.svg>

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 opacity-50"
            style={{ borderColor: currentTool.color, willChange: isInView ? 'transform' : 'auto' }}
            animate={isInView && !prefersReducedMotion ? {
              rotate: [0, 360],
              scale: [1, 1.02, 1]
            } : {}}
            transition={{
              rotate: { 
                duration: prefersReducedMotion ? 0.1 : 8, 
                repeat: prefersReducedMotion ? 0 : Infinity, 
                ease: "linear" 
              },
              scale: { 
                duration: prefersReducedMotion ? 0.1 : 2, 
                repeat: prefersReducedMotion ? 0 : Infinity 
              }
            }}
          />
        </motion.div>

        {/* Tool Name & Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTool.id}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="font-bold text-lg"
              style={{ color: currentTool.color }}
            >
              {currentTool.name}
            </div>
            <div className="text-slate-600 text-sm mt-1 max-w-48">
              {currentTool.description}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2">
          {techTools.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full cursor-pointer"
              style={{
                backgroundColor: index === currentIndex ? currentTool.color : '#cbd5e1'
              }}
              onClick={() => setCurrentIndex(index)}
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
                opacity: index === currentIndex ? 1 : 0.5
              }}
              whileHover={{ scale: 1.3 }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${currentTool.id}-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: currentTool.color,
                left: `${20 + (i * 12)}%`,
                top: `${30 + (i % 2) * 40}%`
              }}
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + (i * 0.3),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Morphing Animation Indicator */}
        {!isHovered && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="white"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" />
            </motion.svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MorphingTechIcons;