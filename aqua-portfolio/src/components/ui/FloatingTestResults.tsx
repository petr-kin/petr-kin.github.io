'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface TestResult {
  id: number;
  type: 'passed' | 'healed' | 'success';
  text: string;
  icon: string;
  color: string;
  x: number;
  y: number;
}

// Reduced complexity - no particles, simplified animation

const FloatingTestResults = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 }); // Only trigger once
  const { isMobile, reducedAnimations } = useMobileOptimization();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resultIdCounter = useRef(0);

  // Static result types - moved inside useCallback to fix dependency warning

  // Simplified - use viewport dimensions directly

  // Simplified result generation
  const generateResult = useCallback(() => {
    if (!isInView || reducedAnimations) return;
    
    // Define result types inside callback to fix dependency warning
    const resultTypes = [
      { type: 'passed' as const, text: 'Test Passed', icon: '✓', color: 'from-emerald-500 to-emerald-400' },
      { type: 'healed' as const, text: 'Auto-healed', icon: '⚡', color: 'from-cyan-500 to-cyan-400' },
      { type: 'success' as const, text: '97% Success', icon: '🎯', color: 'from-blue-500 to-blue-400' }
    ];
    
    const resultType = resultTypes[Math.floor(Math.random() * resultTypes.length)];
    
    // Fixed positioning for better performance
    const positions = [
      { x: 100, y: 100 },
      { x: 300, y: 150 },
      { x: 150, y: 300 },
      { x: 250, y: 80 }
    ];
    
    const position = positions[resultIdCounter.current % positions.length];
    
    const newResult: TestResult = {
      id: resultIdCounter.current++,
      ...resultType,
      x: position.x + (Math.random() - 0.5) * 50,
      y: position.y + (Math.random() - 0.5) * 50
    };

    setTestResults(prev => {
      const updated = [...prev, newResult];
      return updated.slice(-3); // Keep only 3 results
    });
  }, [isInView, reducedAnimations]);

  // Single interval for result generation
  useEffect(() => {
    if (!isInView) return;
    
    // Generate initial result
    generateResult();
    
    // Set up interval
    intervalRef.current = setInterval(generateResult, isMobile ? 8000 : 6000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isInView, generateResult, isMobile]);

  if (reducedAnimations) return null;

  return (
    <div 
      ref={ref} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: isInView ? 'transform' : 'auto' }}
      aria-hidden="true"
    >
      {/* Simplified Floating Test Results */}
      {testResults.map((result) => (
        <motion.div
          key={result.id}
          className="absolute pointer-events-none"
          style={{
            left: result.x,
            top: result.y
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 0.8, 0],
            scale: [0.8, 1, 1, 0.8],
            y: [0, -30]
          }}
          transition={{
            duration: 6,
            ease: "easeOut"
          }}
        >
          <div className={`bg-gradient-to-r ${result.color} text-white px-3 py-2 rounded-lg shadow-lg`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{result.icon}</span>
              <span className="font-medium text-sm whitespace-nowrap">
                {result.text}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(FloatingTestResults);