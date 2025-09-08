'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useResponsive';

export interface ViewportOptions {
  preventHorizontalScroll?: boolean;
  fixViewportHeight?: boolean;
  preventZoom?: boolean;
  adjustForKeyboard?: boolean;
  enableSafeArea?: boolean;
}

export const useViewport = (options: ViewportOptions = {}) => {
  const {
    preventHorizontalScroll = true,
    fixViewportHeight = true,
    preventZoom = false,
    adjustForKeyboard = true,
    enableSafeArea = true,
  } = options;

  const { isMobile, viewport, orientation } = useResponsive();
  const initialHeightRef = useRef<number | null>(null);
  const metaViewportRef = useRef<HTMLMetaElement | null>(null);

  // Update viewport meta tag
  const updateViewportMeta = useCallback(() => {
    if (typeof window === 'undefined') return;

    let viewportContent = 'width=device-width, initial-scale=1';
    
    if (preventZoom) {
      viewportContent += ', maximum-scale=1, user-scalable=no';
    }

    if (isMobile) {
      viewportContent += ', viewport-fit=cover';
    }

    // Find or create viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.content = viewportContent;
    metaViewportRef.current = viewportMeta;
  }, [isMobile, preventZoom]);

  // Fix horizontal scroll issues
  const fixHorizontalScroll = useCallback(() => {
    if (!preventHorizontalScroll || typeof window === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    // Prevent horizontal scroll
    body.style.overflowX = 'hidden';
    html.style.overflowX = 'hidden';

    // Ensure max-width doesn't cause issues
    body.style.maxWidth = '100vw';
    html.style.maxWidth = '100vw';

    // Add CSS custom properties for safe calculations
    const setCustomProperty = (name: string, value: string) => {
      html.style.setProperty(name, value);
    };

    setCustomProperty('--viewport-width', `${viewport.width}px`);
    setCustomProperty('--viewport-height', `${viewport.height}px`);

    if (enableSafeArea && isMobile) {
      // Safe area insets for notched devices
      setCustomProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
      setCustomProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
      setCustomProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
      setCustomProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    }

    return () => {
      body.style.overflowX = '';
      html.style.overflowX = '';
      body.style.maxWidth = '';
      html.style.maxWidth = '';
    };
  }, [preventHorizontalScroll, viewport, enableSafeArea, isMobile]);

  // Fix viewport height issues on mobile
  const fixViewportHeight = useCallback(() => {
    if (!fixViewportHeight || !isMobile || typeof window === 'undefined') return;

    // Store initial height
    if (initialHeightRef.current === null) {
      initialHeightRef.current = window.innerHeight;
    }

    const html = document.documentElement;
    const currentHeight = window.innerHeight;

    // Set CSS custom properties for accurate height calculations
    html.style.setProperty('--viewport-height', `${currentHeight}px`);
    html.style.setProperty('--initial-viewport-height', `${initialHeightRef.current}px`);

    // Dynamic viewport height (dvh equivalent)
    html.style.setProperty('--dvh', `${currentHeight / 100}px`);

    // Large viewport height (lvh equivalent) - uses initial height
    html.style.setProperty('--lvh', `${initialHeightRef.current! / 100}px`);

    // Small viewport height (svh equivalent) - conservative estimate
    const smallHeight = Math.min(currentHeight, initialHeightRef.current! * 0.6);
    html.style.setProperty('--svh', `${smallHeight / 100}px`);
  }, [fixViewportHeight, isMobile]);

  // Handle keyboard adjustments
  const handleKeyboard = useCallback(() => {
    if (!adjustForKeyboard || !isMobile || typeof window === 'undefined') return;

    const html = document.documentElement;
    const initialHeight = initialHeightRef.current || window.innerHeight;
    const currentHeight = window.innerHeight;
    const heightDifference = initialHeight - currentHeight;

    // Detect if keyboard is likely open (significant height reduction)
    const isKeyboardOpen = heightDifference > 150; // 150px threshold

    html.style.setProperty('--keyboard-height', `${Math.max(0, heightDifference)}px`);
    html.style.setProperty('--is-keyboard-open', isKeyboardOpen ? '1' : '0');

    // Add classes for CSS targeting
    html.classList.toggle('keyboard-open', isKeyboardOpen);
    html.classList.toggle('keyboard-closed', !isKeyboardOpen);

    if (isKeyboardOpen) {
      // Adjust viewport for keyboard
      html.style.setProperty('--available-height', `${currentHeight}px`);
    } else {
      html.style.setProperty('--available-height', `${initialHeight}px`);
    }
  }, [adjustForKeyboard, isMobile]);

  // Handle orientation changes
  const handleOrientationChange = useCallback(() => {
    if (!isMobile || typeof window === 'undefined') return;

    // Small delay to get accurate dimensions after orientation change
    setTimeout(() => {
      initialHeightRef.current = window.innerHeight;
      fixViewportHeight();
      handleKeyboard();
    }, 100);
  }, [isMobile, fixViewportHeight, handleKeyboard]);

  // Get safe area values
  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined' || !enableSafeArea) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
    };
  }, [enableSafeArea]);

  // Check if content overflows horizontally
  const checkHorizontalOverflow = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    return document.body.scrollWidth > window.innerWidth;
  }, []);

  // Force layout recalculation
  const recalculateLayout = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Trigger reflow
    document.body.offsetHeight;
    
    // Update all calculations
    fixHorizontalScroll();
    fixViewportHeight();
    handleKeyboard();
  }, [fixHorizontalScroll, fixViewportHeight, handleKeyboard]);

  // Initialize and set up event listeners
  useEffect(() => {
    updateViewportMeta();
    
    const cleanupHorizontal = fixHorizontalScroll();
    fixViewportHeight();
    handleKeyboard();

    const handleResize = () => {
      fixViewportHeight();
      handleKeyboard();
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        handleKeyboard();
      }
    };

    // Event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    
    // Visual viewport API for better keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
      
      if (cleanupHorizontal) {
        cleanupHorizontal();
      }
    };
  }, [
    updateViewportMeta,
    fixHorizontalScroll,
    fixViewportHeight,
    handleKeyboard,
    handleOrientationChange,
  ]);

  // Clean up classes on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const html = document.documentElement;
        html.classList.remove('keyboard-open', 'keyboard-closed');
      }
    };
  }, []);

  return {
    // State
    hasHorizontalOverflow: checkHorizontalOverflow(),
    safeAreaInsets: getSafeAreaInsets(),
    
    // Methods
    recalculateLayout,
    checkHorizontalOverflow,
    getSafeAreaInsets,
    
    // Configuration
    options: {
      preventHorizontalScroll,
      fixViewportHeight,
      preventZoom,
      adjustForKeyboard,
      enableSafeArea,
    },
  };
};