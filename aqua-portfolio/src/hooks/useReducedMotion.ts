'use client';

import { useState, useEffect } from 'react';

export interface MotionPreferences {
  prefersReducedMotion: boolean;
  prefersReducedTransparency: boolean;
  prefersHighContrast: boolean;
}

export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

export const useMotionPreferences = (): MotionPreferences => {
  const [preferences, setPreferences] = useState<MotionPreferences>({
    prefersReducedMotion: false,
    prefersReducedTransparency: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: mediaQueries.reducedMotion.matches,
        prefersReducedTransparency: mediaQueries.reducedTransparency.matches,
        prefersHighContrast: mediaQueries.highContrast.matches,
      });
    };

    // Set initial values
    updatePreferences();

    // Add listeners
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
};

// Hook for creating motion-safe variants
export const useMotionSafeVariants = <T extends Record<string, any>>(
  variants: T,
  reducedVariants?: Partial<T>
): T => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedVariants) {
    return { ...variants, ...reducedVariants };
  }

  return variants;
};

// Hook for conditional animation configuration
export const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Framer Motion transition configs
    transition: prefersReducedMotion 
      ? { duration: 0 }
      : { type: 'spring', damping: 20, stiffness: 300 },
    
    // Reduced motion variants
    getVariant: <T>(normal: T, reduced?: T) => 
      prefersReducedMotion && reduced ? reduced : normal,
    
    // Animation duration
    duration: prefersReducedMotion ? 0 : 300,
    
    // Easing
    ease: prefersReducedMotion ? 'linear' : 'easeInOut',
  };
};

// CSS-in-JS helper for reduced motion
export const useMotionCSS = () => {
  const prefersReducedMotion = useReducedMotion();

  return {
    transition: prefersReducedMotion ? 'none' : undefined,
    animationDuration: prefersReducedMotion ? '0ms' : undefined,
    animationIterationCount: prefersReducedMotion ? '1' : undefined,
  };
};