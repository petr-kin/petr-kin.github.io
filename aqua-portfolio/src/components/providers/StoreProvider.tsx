'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAppStore, initializeStore, cleanupStore } from '@/store/appStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

// Create context for store access
const StoreContext = createContext<typeof useAppStore | null>(null);

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const initRef = useRef(false);

  useEffect(() => {
    // Initialize store only once
    if (!initRef.current) {
      initRef.current = true;
      initializeStore();

      // Set up system preference listeners
      if (typeof window !== 'undefined') {
        const themeActions = useAppStore.getState();
        const accessibilityActions = useAppStore.getState();
        
        // Theme preference listener
        const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e: MediaQueryListEvent) => {
          themeActions.setSystemTheme(e.matches ? 'dark' : 'light');
        };
        themeMediaQuery.addEventListener('change', handleThemeChange);

        // Motion preference listener
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = (e: MediaQueryListEvent) => {
          themeActions.setMotionPreference(e.matches ? 'reduce' : 'auto');
        };
        motionMediaQuery.addEventListener('change', handleMotionChange);

        // Contrast preference listener
        const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
        const handleContrastChange = (e: MediaQueryListEvent) => {
          accessibilityActions.setHighContrast(e.matches);
        };
        contrastMediaQuery.addEventListener('change', handleContrastChange);

        // Performance monitoring
        const performanceActions = useAppStore.getState();
        
        // Battery API
        if ('getBattery' in navigator) {
          (navigator as any).getBattery().then((battery: any) => {
            performanceActions.updateBatteryInfo(battery.level);
            
            battery.addEventListener('levelchange', () => {
              performanceActions.updateBatteryInfo(battery.level);
            });
          });
        }

        // Network Information API
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          performanceActions.updateConnectionInfo(
            connection.effectiveType,
            connection.downlink > 10 ? 'fast' : connection.downlink > 1.5 ? 'fast' : 'slow'
          );
          
          connection.addEventListener('change', () => {
            performanceActions.updateConnectionInfo(
              connection.effectiveType,
              connection.downlink > 10 ? 'fast' : connection.downlink > 1.5 ? 'fast' : 'slow'
            );
          });
        }

        // Page visibility API for performance optimization
        const handleVisibilityChange = () => {
          if (document.hidden) {
            performanceActions.stopMonitoring();
          } else {
            performanceActions.startMonitoring();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start performance monitoring
        performanceActions.startMonitoring();

        // Detect accessibility preferences
        accessibilityActions.detectAccessibilityPreferences();

        // Cleanup function
        return () => {
          themeMediaQuery.removeEventListener('change', handleThemeChange);
          motionMediaQuery.removeEventListener('change', handleMotionChange);
          contrastMediaQuery.removeEventListener('change', handleContrastChange);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          cleanupStore();
        };
      }
    }
  }, []);

  // Handle idle detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let idleTimer: NodeJS.Timeout;
    const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

    const resetIdleTimer = () => {
      const uiActions = useAppStore.getState();
      uiActions.updateLastInteraction();
      
      if (uiActions.ui.isIdle) {
        uiActions.setIdle(false);
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        uiActions.setIdle(true);
      }, IDLE_TIME);
    };

    // Events that reset idle timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Initial timer setup
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <StoreContext.Provider value={useAppStore}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store context
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};

// HOC for components that need store access
export function withStore<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <StoreProvider>
        <Component {...props} />
      </StoreProvider>
    );
  };
}