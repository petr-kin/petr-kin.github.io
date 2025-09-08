import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Store slices
import { UISlice, createUISlice } from './slices/uiSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';
import { NavigationSlice, createNavigationSlice } from './slices/navigationSlice';
import { PerformanceSlice, createPerformanceSlice } from './slices/performanceSlice';
import { AccessibilitySlice, createAccessibilitySlice } from './slices/accessibilitySlice';

// Combined store type
export type AppStore = UISlice & ThemeSlice & NavigationSlice & PerformanceSlice & AccessibilitySlice;

// Create the main store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createUISlice(...a),
          ...createThemeSlice(...a),
          ...createNavigationSlice(...a),
          ...createPerformanceSlice(...a),
          ...createAccessibilitySlice(...a),
        }))
      ),
      {
        name: 'aqua-portfolio-store',
        // Only persist certain slices
        partialize: (state) => ({
          theme: state.theme,
          accessibility: state.accessibility,
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            preferredLayout: state.ui.preferredLayout,
          },
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle store migrations if needed
          if (version === 0) {
            // Migration logic for version 0 -> 1
            return persistedState;
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'AquaPortfolioStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Computed selectors
export const useUIState = () => useAppStore((state) => state.ui);
export const useThemeState = () => useAppStore((state) => state.theme);
export const useNavigationState = () => useAppStore((state) => state.navigation);
export const usePerformanceState = () => useAppStore((state) => state.performance);
export const useAccessibilityState = () => useAppStore((state) => state.accessibility);

// Action selectors
export const useUIActions = () => useAppStore((state) => ({
  setLoading: state.setLoading,
  setModal: state.setModal,
  closeModal: state.closeModal,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setToast: state.setToast,
  removeToast: state.removeToast,
  setPreferredLayout: state.setPreferredLayout,
}));

export const useThemeActions = () => useAppStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setAccentColor: state.setAccentColor,
  setFontSize: state.setFontSize,
  setMotionPreference: state.setMotionPreference,
}));

export const useNavigationActions = () => useAppStore((state) => ({
  setActiveSection: state.setActiveSection,
  addBreadcrumb: state.addBreadcrumb,
  setBreadcrumbs: state.setBreadcrumbs,
  setMobileMenuOpen: state.setMobileMenuOpen,
  addRecentPage: state.addRecentPage,
}));

export const usePerformanceActions = () => useAppStore((state) => ({
  updateMetrics: state.updateMetrics,
  recordPageLoad: state.recordPageLoad,
  recordInteraction: state.recordInteraction,
  setPerformanceMode: state.setPerformanceMode,
}));

export const useAccessibilityActions = () => useAppStore((state) => ({
  setHighContrast: state.setHighContrast,
  setScreenReaderMode: state.setScreenReaderMode,
  setKeyboardNavigation: state.setKeyboardNavigation,
  setFocusVisible: state.setFocusVisible,
}));

// Reactive selectors with computed values
export const useIsLoading = () => useAppStore((state) => state.ui.loading.isLoading);
export const useActiveModal = () => useAppStore((state) => state.ui.modal.activeModal);
export const useCurrentTheme = () => useAppStore((state) => state.theme.currentTheme);
export const useIsHighPerformanceMode = () => useAppStore((state) => state.performance.mode === 'high');

// Subscription hooks for side effects
export const useStoreSubscription = (
  selector: (state: AppStore) => any,
  listener: (selectedState: any, previousSelectedState: any) => void
) => {
  return useAppStore.subscribe(selector, listener);
};

// Store initialization
export const initializeStore = () => {
  const store = useAppStore.getState();
  
  // Initialize performance monitoring
  if (typeof window !== 'undefined') {
    store.updateMetrics({
      timestamp: Date.now(),
      url: window.location.href,
    });
    
    // Set initial theme based on system preference
    if (store.theme.currentTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      store.setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Set initial accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      store.setMotionPreference('reduce');
    }
    
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      store.setHighContrast(true);
    }
  }
};

// Store cleanup
export const cleanupStore = () => {
  // Cleanup subscriptions and timers if needed
  const store = useAppStore.getState();
  
  // Clear any active intervals or timeouts
  if (store.ui.toasts.length > 0) {
    store.ui.toasts.forEach(toast => {
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }
    });
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Expose store to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).appStore = useAppStore;
  }
}