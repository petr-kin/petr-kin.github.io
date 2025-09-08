'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's preference for reduced motion
 * Respects the prefers-reduced-motion CSS media query
 * 
 * @returns boolean - true if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    // Get initial value
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Enhanced hook that provides both reduced motion detection and animation helpers
 */
export const useMotionPreferences = () => {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Helper to conditionally apply animation classes
    animationClass: (normalClass: string, reducedClass = '') => 
      prefersReducedMotion ? reducedClass : normalClass,
    // Helper to get animation duration
    duration: (normalDuration: number, reducedDuration = 0) =>
      prefersReducedMotion ? reducedDuration : normalDuration,
    // Helper to get transition properties
    transition: (normal: Record<string, unknown>, reduced?: Record<string, unknown>) =>
      prefersReducedMotion && reduced ? reduced : normal,
    // Helper to conditionally enable/disable animations
    shouldAnimate: !prefersReducedMotion,
  };
};

/**
 * Hook specifically for Framer Motion animations
 * Returns animation variants that respect user preferences
 */
export const useMotionVariants = () => {
  const { prefersReducedMotion } = useMotionPreferences();

  const getVariants = (variants: Record<string, unknown>) => {
    if (prefersReducedMotion) {
      // Return static variants for reduced motion
      const reducedVariants: Record<string, unknown> = {};
      Object.keys(variants).forEach(key => {
        if (typeof variants[key] === 'object' && variants[key] !== null) {
          const variant = variants[key] as Record<string, unknown>;
          reducedVariants[key] = {
            ...variant,
            transition: { duration: 0 },
          };
        } else {
          reducedVariants[key] = variants[key];
        }
      });
      return reducedVariants;
    }
    return variants;
  };

  const getTransition = (transition: Record<string, unknown> = {}) => ({
    ...transition,
    duration: prefersReducedMotion ? 0 : transition.duration || 0.3,
  });

  return {
    prefersReducedMotion,
    getVariants,
    getTransition,
    // Common reduced motion variants
    fadeInVariants: getVariants({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    slideInVariants: getVariants({
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    }),
    scaleInVariants: getVariants({
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    }),
  };
};

export default useReducedMotion;