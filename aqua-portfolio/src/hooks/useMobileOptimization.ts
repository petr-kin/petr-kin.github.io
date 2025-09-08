'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  connectionType: 'fast' | 'slow' | 'offline' | 'unknown';
}

export interface MobileOptimizations {
  reduceAnimations: boolean;
  reducedParticleCount: number;
  lowQualityImages: boolean;
  prefetchDisabled: boolean;
  lazyLoadingAggressive: boolean;
}

export const useMobileOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: 1920,
    screenHeight: 1080,
    pixelRatio: 1,
    orientation: 'landscape',
    connectionType: 'unknown',
  });

  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    reduceAnimations: false,
    reducedParticleCount: 100,
    lowQualityImages: false,
    prefetchDisabled: false,
    lazyLoadingAggressive: false,
  });

  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    const isMobile = screenWidth <= 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = screenWidth > 768 && screenWidth <= 1024 && /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

    // Detect connection quality
    let connectionType: DeviceInfo['connectionType'] = 'unknown';
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          connectionType = 'slow';
        } else if (effectiveType === '3g' || effectiveType === '4g') {
          connectionType = 'fast';
        }
      }
    }

    if (!navigator.onLine) {
      connectionType = 'offline';
    }

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      isIOS,
      isAndroid,
      screenWidth,
      screenHeight,
      pixelRatio,
      orientation,
      connectionType,
    };
  }, []);

  const calculateOptimizations = useCallback((device: DeviceInfo): MobileOptimizations => {
    const isLowPower = device.isMobile || device.connectionType === 'slow';
    const isVeryLowPower = device.connectionType === 'slow' || (device.isMobile && device.pixelRatio > 2);

    return {
      reduceAnimations: isLowPower,
      reducedParticleCount: device.isMobile ? 30 : device.isTablet ? 60 : 100,
      lowQualityImages: isVeryLowPower,
      prefetchDisabled: device.connectionType === 'slow',
      lazyLoadingAggressive: isLowPower,
    };
  }, []);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const newDeviceInfo = detectDevice();
      if (newDeviceInfo) {
        setDeviceInfo(newDeviceInfo);
        setOptimizations(calculateOptimizations(newDeviceInfo));
      }
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for orientation changes
    const handleResize = () => {
      updateDeviceInfo();
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateDeviceInfo();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [detectDevice, calculateOptimizations]);

  // Utility functions for mobile optimization
  const getImageQuality = useCallback(() => {
    if (optimizations.lowQualityImages) return 60;
    if (deviceInfo.isMobile) return 80;
    return 95;
  }, [optimizations.lowQualityImages, deviceInfo.isMobile]);

  const getAnimationDuration = useCallback((defaultDuration: number) => {
    if (optimizations.reduceAnimations) return defaultDuration * 0.5;
    return defaultDuration;
  }, [optimizations.reduceAnimations]);

  const shouldPreload = useCallback((resourceType: 'image' | 'component' | 'font') => {
    if (optimizations.prefetchDisabled) return false;
    if (deviceInfo.connectionType === 'slow') return false;
    if (deviceInfo.isMobile && resourceType === 'component') return false;
    return true;
  }, [optimizations.prefetchDisabled, deviceInfo.connectionType, deviceInfo.isMobile]);

  const getParticleCount = useCallback((baseCount: number) => {
    return Math.min(baseCount, optimizations.reducedParticleCount);
  }, [optimizations.reducedParticleCount]);

  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined' || !deviceInfo.isIOS) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    };
  }, [deviceInfo.isIOS]);

  return {
    deviceInfo,
    optimizations,
    
    // Utility functions
    getImageQuality,
    getAnimationDuration,
    shouldPreload,
    getParticleCount,
    getSafeAreaInsets,
    
    // Convenience flags
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isTouchDevice: deviceInfo.isTouchDevice,
    isSlowConnection: deviceInfo.connectionType === 'slow',
    shouldReduceMotion: optimizations.reduceAnimations,
  };
};

// Hook for touch gesture detection
export const useTouchGestures = () => {
  const [isSupported] = useState(() => 
    typeof window !== 'undefined' && 'ontouchstart' in window
  );

  const createGestureHandler = useCallback((
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void,
    threshold = 50
  ) => {
    if (!isSupported) return {};

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    };

    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    };
  }, [isSupported]);

  return {
    isSupported,
    createGestureHandler,
  };
};