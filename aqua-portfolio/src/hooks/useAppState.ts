'use client';

import { useCallback, useEffect } from 'react';
import { 
  useAppStore,
  useUIState,
  useUIActions,
  useThemeState,
  useThemeActions,
  useNavigationState,
  useNavigationActions,
  usePerformanceState,
  usePerformanceActions,
  useAccessibilityState,
  useAccessibilityActions,
  useStoreSubscription
} from '@/store/appStore';

// Convenience hook for complete app state access
export const useAppState = () => {
  const ui = useUIState();
  const theme = useThemeState();
  const navigation = useNavigationState();
  const performance = usePerformanceState();
  const accessibility = useAccessibilityState();

  const uiActions = useUIActions();
  const themeActions = useThemeActions();
  const navigationActions = useNavigationActions();
  const performanceActions = usePerformanceActions();
  const accessibilityActions = useAccessibilityActions();

  return {
    // State
    ui,
    theme,
    navigation,
    performance,
    accessibility,
    
    // Actions
    ...uiActions,
    ...themeActions,
    ...navigationActions,
    ...performanceActions,
    ...accessibilityActions,
  };
};

// Hook for toast notifications with predefined types
export const useToast = () => {
  const { setToast } = useUIActions();

  return {
    toast: setToast,
    success: useCallback((message: string, options?: { action?: { label: string; onClick: () => void } }) => {
      setToast({ message, type: 'success', ...options });
    }, [setToast]),
    error: useCallback((message: string, options?: { action?: { label: string; onClick: () => void } }) => {
      setToast({ message, type: 'error', ...options });
    }, [setToast]),
    warning: useCallback((message: string, options?: { action?: { label: string; onClick: () => void } }) => {
      setToast({ message, type: 'warning', ...options });
    }, [setToast]),
    info: useCallback((message: string, options?: { action?: { label: string; onClick: () => void } }) => {
      setToast({ message, type: 'info', ...options });
    }, [setToast]),
  };
};

// Hook for modal management
export const useModal = () => {
  const { modal } = useUIState();
  const { openModal, closeModal, closeAllModals } = useUIActions();

  return {
    activeModal: modal.activeModal,
    modalStack: modal.modalStack,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen: modal.activeModal !== null,
  };
};

// Hook for loading states
export const useLoading = () => {
  const { loading } = useUIState();
  const { setLoading, setLoadingProgress, setLoadingMessage, addLoadingTask, removeLoadingTask } = useUIActions();

  const withLoading = useCallback(async <T>(
    promise: Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      setLoading({ isLoading: true, message });
      const result = await promise;
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  return {
    loading,
    isLoading: loading.isLoading,
    setLoading,
    setLoadingProgress,
    setLoadingMessage,
    addLoadingTask,
    removeLoadingTask,
    withLoading,
  };
};

// Hook for theme management with computed values
export const useTheme = () => {
  const theme = useThemeState();
  const { setTheme, toggleTheme, setAccentColor, setFontSize, getComputedTheme } = useThemeActions();

  const computedTheme = getComputedTheme();

  return {
    ...theme,
    computedTheme,
    isDark: computedTheme === 'dark',
    isLight: computedTheme === 'light',
    setTheme,
    toggleTheme,
    setAccentColor,
    setFontSize,
  };
};

// Hook for navigation with breadcrumb helpers
export const useNavigation = () => {
  const navigation = useNavigationState();
  const actions = useNavigationActions();

  const addBreadcrumbPath = useCallback((path: string, label?: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => ({
      label: label || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + segments.slice(0, index + 1).join('/'),
    }));
    
    actions.setBreadcrumbs(breadcrumbs);
  }, [actions]);

  return {
    ...navigation,
    ...actions,
    addBreadcrumbPath,
    isMenuOpen: navigation.mobileMenuOpen,
  };
};

// Hook for performance monitoring with helpers
export const usePerformance = () => {
  const performance = usePerformanceState();
  const actions = usePerformanceActions();

  const recordPageView = useCallback((url?: string) => {
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      actions.recordPageLoad(url || window.location.href, loadTime);
    };
  }, [actions]);

  const measureInteraction = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    type: string,
    target?: string
  ) => {
    return (...args: T): R => {
      const startTime = Date.now();
      try {
        const result = fn(...args);
        const endTime = Date.now();
        
        actions.recordInteraction({
          type,
          duration: endTime - startTime,
          target,
          successful: true,
        });
        
        return result;
      } catch (error) {
        const endTime = Date.now();
        
        actions.recordInteraction({
          type,
          duration: endTime - startTime,
          target,
          successful: false,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    };
  }, [actions]);

  return {
    ...performance,
    ...actions,
    recordPageView,
    measureInteraction,
    score: actions.getPerformanceScore(),
  };
};

// Hook for accessibility with helpers
export const useAccessibility = () => {
  const accessibility = useAccessibilityState();
  const actions = useAccessibilityActions();

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (accessibility.screenReaderMode) {
      actions.announce(message, priority);
    }
  }, [accessibility.screenReaderMode, actions]);

  return {
    ...accessibility,
    ...actions,
    announceToScreenReader,
  };
};

// Hook for responsive design integration
export const useResponsiveState = () => {
  const { viewport, setViewport } = useUIActions();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      let breakpoint = 'xs';
      if (width >= 1400) breakpoint = 'xxl';
      else if (width >= 1200) breakpoint = 'xl';
      else if (width >= 992) breakpoint = 'lg';
      else if (width >= 768) breakpoint = 'md';
      else if (width >= 576) breakpoint = 'sm';
      
      setViewport({
        width,
        height,
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    
    return () => window.removeEventListener('resize', updateViewport);
  }, [setViewport]);

  return viewport;
};

// Hook for subscribing to specific store changes
export const useStoreListener = <T>(
  selector: (state: any) => T,
  listener: (value: T, previousValue: T) => void
) => {
  useEffect(() => {
    return useStoreSubscription(selector, listener);
  }, [selector, listener]);
};

// Hook for development debugging
export const useStoreDebug = () => {
  const store = useAppStore.getState();
  
  return {
    store,
    logState: () => console.log('Store State:', store),
    logUI: () => console.log('UI State:', store.ui),
    logTheme: () => console.log('Theme State:', store.theme),
    logNavigation: () => console.log('Navigation State:', store.navigation),
    logPerformance: () => console.log('Performance State:', store.performance),
    logAccessibility: () => console.log('Accessibility State:', store.accessibility),
  };
};