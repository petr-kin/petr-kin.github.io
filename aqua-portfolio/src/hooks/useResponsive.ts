'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ResponsiveState {
  viewport: ViewportSize;
  breakpoint: keyof ResponsiveBreakpoints;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
}

const defaultBreakpoints: ResponsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export const useResponsive = (customBreakpoints?: Partial<ResponsiveBreakpoints>) => {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [state, setState] = useState<ResponsiveState>({
    viewport: { width: 0, height: 0 },
    breakpoint: 'xs',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    orientation: 'landscape',
    devicePixelRatio: 1,
  });

  const getBreakpoint = useCallback((width: number): keyof ResponsiveBreakpoints => {
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [breakpoints]);

  const detectDeviceType = useCallback((width: number) => {
    const isMobile = width < breakpoints.md;
    const isTablet = width >= breakpoints.md && width < breakpoints.lg;
    const isDesktop = width >= breakpoints.lg;

    return { isMobile, isTablet, isDesktop };
  }, [breakpoints]);

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const { isMobile, isTablet, isDesktop } = detectDeviceType(width);
    const orientation = height > width ? 'portrait' : 'landscape';
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Detect touch capability
    const isTouch = 'ontouchstart' in window || 
                   navigator.maxTouchPoints > 0 || 
                   // @ts-ignore - legacy support
                   navigator.msMaxTouchPoints > 0;

    setState({
      viewport: { width, height },
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      orientation,
      devicePixelRatio,
    });
  }, [getBreakpoint, detectDeviceType]);

  useEffect(() => {
    // Initialize on mount
    updateState();

    // Add event listeners
    const handleResize = () => updateState();
    const handleOrientationChange = () => {
      // Small delay to get accurate dimensions after orientation change
      setTimeout(updateState, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateState]);

  // Utility functions
  const isBreakpoint = useCallback((bp: keyof ResponsiveBreakpoints) => {
    return state.breakpoint === bp;
  }, [state.breakpoint]);

  const isAboveBreakpoint = useCallback((bp: keyof ResponsiveBreakpoints) => {
    return state.viewport.width >= breakpoints[bp];
  }, [state.viewport.width, breakpoints]);

  const isBelowBreakpoint = useCallback((bp: keyof ResponsiveBreakpoints) => {
    return state.viewport.width < breakpoints[bp];
  }, [state.viewport.width, breakpoints]);

  const getResponsiveValue = useCallback(<T>(values: Partial<Record<keyof ResponsiveBreakpoints, T>>): T | undefined => {
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([, a], [, b]) => b - a) // Sort descending
      .map(([key]) => key as keyof ResponsiveBreakpoints);

    for (const bp of sortedBreakpoints) {
      if (state.viewport.width >= breakpoints[bp] && values[bp] !== undefined) {
        return values[bp];
      }
    }

    return values.xs;
  }, [state.viewport.width, breakpoints]);

  // CSS media query helpers
  const mediaQuery = useCallback((minWidth?: number, maxWidth?: number) => {
    const queries = [];
    if (minWidth) queries.push(`(min-width: ${minWidth}px)`);
    if (maxWidth) queries.push(`(max-width: ${maxWidth}px)`);
    return queries.join(' and ');
  }, []);

  const mediaQueryForBreakpoint = useCallback((bp: keyof ResponsiveBreakpoints) => {
    return `(min-width: ${breakpoints[bp]}px)`;
  }, [breakpoints]);

  // Responsive classes helper
  const getResponsiveClasses = useCallback((baseClass: string) => {
    return {
      [`${baseClass}--xs`]: state.breakpoint === 'xs',
      [`${baseClass}--sm`]: state.breakpoint === 'sm',
      [`${baseClass}--md`]: state.breakpoint === 'md',
      [`${baseClass}--lg`]: state.breakpoint === 'lg',
      [`${baseClass}--xl`]: state.breakpoint === 'xl',
      [`${baseClass}--xxl`]: state.breakpoint === 'xxl',
      [`${baseClass}--mobile`]: state.isMobile,
      [`${baseClass}--tablet`]: state.isTablet,
      [`${baseClass}--desktop`]: state.isDesktop,
      [`${baseClass}--touch`]: state.isTouch,
      [`${baseClass}--portrait`]: state.orientation === 'portrait',
      [`${baseClass}--landscape`]: state.orientation === 'landscape',
    };
  }, [state]);

  return {
    // State
    ...state,
    breakpoints,

    // Utility functions
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
    getResponsiveValue,
    getResponsiveClasses,

    // CSS helpers
    mediaQuery,
    mediaQueryForBreakpoint,

    // Manual update
    updateState,
  };
};

// Hook for specific breakpoint detection
export const useBreakpoint = (breakpoint: keyof ResponsiveBreakpoints) => {
  const { isBreakpoint, isAboveBreakpoint, isBelowBreakpoint } = useResponsive();
  
  return {
    isExact: isBreakpoint(breakpoint),
    isAbove: isAboveBreakpoint(breakpoint),
    isBelow: isBelowBreakpoint(breakpoint),
  };
};

// Hook for mobile-specific functionality
export const useMobile = () => {
  const { isMobile, isTouch, orientation, viewport } = useResponsive();
  
  const isSmallMobile = viewport.width < 375;
  const isLargeMobile = viewport.width >= 375 && viewport.width < 768;
  
  return {
    isMobile,
    isTouch,
    orientation,
    isSmallMobile,
    isLargeMobile,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};