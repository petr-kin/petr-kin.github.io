import { StateCreator } from 'zustand';

export interface PerformanceMetrics {
  timestamp: number;
  url: string;
  loadTime?: number;
  renderTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
  networkLatency?: number;
  fps?: number;
  bundleSize?: number;
  cacheHitRate?: number;
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface InteractionEvent {
  id: string;
  type: string;
  timestamp: number;
  duration: number;
  target?: string;
  successful: boolean;
  errorMessage?: string;
}

export type PerformanceMode = 'auto' | 'high' | 'balanced' | 'eco';

export interface PerformanceState {
  mode: PerformanceMode;
  metrics: PerformanceMetrics[];
  webVitals: WebVitals;
  interactions: InteractionEvent[];
  isMonitoring: boolean;
  batteryLevel?: number;
  connectionType?: string;
  connectionSpeed?: 'slow' | 'fast' | 'unknown';
  memoryInfo?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  optimizations: {
    lazyLoading: boolean;
    imageOptimization: boolean;
    codesplitting: boolean;
    prefetching: boolean;
    serviceWorker: boolean;
  };
}

export interface PerformanceActions {
  setPerformanceMode: (mode: PerformanceMode) => void;
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  recordPageLoad: (url: string, loadTime: number) => void;
  recordInteraction: (event: Omit<InteractionEvent, 'id' | 'timestamp'>) => void;
  updateWebVitals: (vitals: Partial<WebVitals>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearMetrics: () => void;
  updateBatteryInfo: (level: number) => void;
  updateConnectionInfo: (type: string, speed: PerformanceState['connectionSpeed']) => void;
  updateMemoryInfo: () => void;
  setOptimization: (key: keyof PerformanceState['optimizations'], enabled: boolean) => void;
  getAverageMetric: (metric: keyof PerformanceMetrics) => number;
  getPerformanceScore: () => number;
  shouldEnableOptimization: (optimization: keyof PerformanceState['optimizations']) => boolean;
}

export type PerformanceSlice = {
  performance: PerformanceState;
} & PerformanceActions;

const initialPerformanceState: PerformanceState = {
  mode: 'auto',
  metrics: [],
  webVitals: {},
  interactions: [],
  isMonitoring: false,
  batteryLevel: undefined,
  connectionType: 'unknown',
  connectionSpeed: 'unknown',
  memoryInfo: undefined,
  optimizations: {
    lazyLoading: true,
    imageOptimization: true,
    codeSplitting: true,
    prefetching: true,
    serviceWorker: true,
  },
};

export const createPerformanceSlice: StateCreator<PerformanceSlice, [['zustand/immer', never]], [], PerformanceSlice> = (set, get) => ({
  performance: initialPerformanceState,

  setPerformanceMode: (mode) =>
    set((state) => {
      state.performance.mode = mode;
      
      // Adjust optimizations based on mode
      const { optimizations } = state.performance;
      switch (mode) {
        case 'high':
          Object.assign(optimizations, {
            lazyLoading: true,
            imageOptimization: true,
            codeSplitting: true,
            prefetching: true,
            serviceWorker: true,
          });
          break;
        case 'balanced':
          Object.assign(optimizations, {
            lazyLoading: true,
            imageOptimization: true,
            codeSplitting: true,
            prefetching: false,
            serviceWorker: true,
          });
          break;
        case 'eco':
          Object.assign(optimizations, {
            lazyLoading: true,
            imageOptimization: true,
            codeSplitting: false,
            prefetching: false,
            serviceWorker: false,
          });
          break;
        case 'auto':
          // Auto mode adjusts based on device capabilities
          get().shouldEnableOptimization('lazyLoading');
          break;
      }
    }),

  updateMetrics: (metricsData) =>
    set((state) => {
      const metrics: PerformanceMetrics = {
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        ...metricsData,
      };
      
      state.performance.metrics.push(metrics);
      
      // Limit metrics history to prevent memory issues
      if (state.performance.metrics.length > 100) {
        state.performance.metrics = state.performance.metrics.slice(-100);
      }
    }),

  recordPageLoad: (url, loadTime) =>
    set((state) => {
      get().updateMetrics({ url, loadTime, renderTime: loadTime });
    }),

  recordInteraction: (eventData) =>
    set((state) => {
      const interaction: InteractionEvent = {
        id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...eventData,
      };
      
      state.performance.interactions.push(interaction);
      
      // Update metrics with interaction time
      get().updateMetrics({ interactionTime: eventData.duration });
      
      // Limit interactions history
      if (state.performance.interactions.length > 50) {
        state.performance.interactions = state.performance.interactions.slice(-50);
      }
    }),

  updateWebVitals: (vitals) =>
    set((state) => {
      Object.assign(state.performance.webVitals, vitals);
    }),

  startMonitoring: () =>
    set((state) => {
      state.performance.isMonitoring = true;
      
      if (typeof window !== 'undefined') {
        // Start performance observation
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'paint') {
                if (entry.name === 'first-contentful-paint') {
                  get().updateWebVitals({ fcp: entry.startTime });
                }
              } else if (entry.entryType === 'largest-contentful-paint') {
                get().updateWebVitals({ lcp: entry.startTime });
              } else if (entry.entryType === 'first-input') {
                get().updateWebVitals({ fid: (entry as any).processingStart - entry.startTime });
              } else if (entry.entryType === 'layout-shift') {
                const currentCLS = get().performance.webVitals.cls || 0;
                get().updateWebVitals({ cls: currentCLS + (entry as any).value });
              }
            });
          });
          
          try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
          } catch (e) {
            console.warn('Performance observer not fully supported:', e);
          }
        }
        
        // Monitor memory usage
        setInterval(() => {
          get().updateMemoryInfo();
        }, 30000); // Every 30 seconds
      }
    }),

  stopMonitoring: () =>
    set((state) => {
      state.performance.isMonitoring = false;
    }),

  clearMetrics: () =>
    set((state) => {
      state.performance.metrics = [];
      state.performance.interactions = [];
      state.performance.webVitals = {};
    }),

  updateBatteryInfo: (level) =>
    set((state) => {
      state.performance.batteryLevel = level;
      
      // Auto-adjust performance mode based on battery
      if (state.performance.mode === 'auto') {
        if (level < 0.2) {
          get().setPerformanceMode('eco');
        } else if (level > 0.8) {
          get().setPerformanceMode('high');
        } else {
          get().setPerformanceMode('balanced');
        }
      }
    }),

  updateConnectionInfo: (type, speed) =>
    set((state) => {
      state.performance.connectionType = type;
      state.performance.connectionSpeed = speed;
      
      // Adjust optimizations based on connection
      if (speed === 'slow') {
        state.performance.optimizations.prefetching = false;
        state.performance.optimizations.imageOptimization = true;
      }
    }),

  updateMemoryInfo: () =>
    set((state) => {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window as any).performance) {
        const memory = (window as any).performance.memory;
        state.performance.memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
        
        // Update metrics with memory usage
        get().updateMetrics({ memoryUsage: memory.usedJSHeapSize });
      }
    }),

  setOptimization: (key, enabled) =>
    set((state) => {
      state.performance.optimizations[key] = enabled;
    }),

  getAverageMetric: (metric) => {
    const state = get();
    const values = state.performance.metrics
      .map(m => m[metric])
      .filter(v => v !== undefined) as number[];
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  },

  getPerformanceScore: () => {
    const state = get();
    const { webVitals } = state.performance;
    
    let score = 100;
    
    // FCP penalty (target: <2.5s)
    if (webVitals.fcp) {
      if (webVitals.fcp > 2500) score -= 20;
      else if (webVitals.fcp > 1800) score -= 10;
    }
    
    // LCP penalty (target: <2.5s)
    if (webVitals.lcp) {
      if (webVitals.lcp > 2500) score -= 25;
      else if (webVitals.lcp > 1200) score -= 15;
    }
    
    // FID penalty (target: <100ms)
    if (webVitals.fid) {
      if (webVitals.fid > 100) score -= 20;
      else if (webVitals.fid > 50) score -= 10;
    }
    
    // CLS penalty (target: <0.1)
    if (webVitals.cls) {
      if (webVitals.cls > 0.25) score -= 20;
      else if (webVitals.cls > 0.1) score -= 10;
    }
    
    return Math.max(0, score);
  },

  shouldEnableOptimization: (optimization) => {
    const state = get();
    
    if (state.performance.mode !== 'auto') {
      return state.performance.optimizations[optimization];
    }
    
    // Auto mode logic
    const batteryLevel = state.performance.batteryLevel || 1;
    const connectionSpeed = state.performance.connectionSpeed;
    const memoryUsage = state.performance.memoryInfo?.usedJSHeapSize || 0;
    const memoryLimit = state.performance.memoryInfo?.jsHeapSizeLimit || Infinity;
    const memoryRatio = memoryUsage / memoryLimit;
    
    switch (optimization) {
      case 'lazyLoading':
        return connectionSpeed === 'slow' || memoryRatio > 0.7;
      case 'imageOptimization':
        return connectionSpeed === 'slow' || batteryLevel < 0.5;
      case 'codeSplitting':
        return memoryRatio > 0.6;
      case 'prefetching':
        return connectionSpeed === 'fast' && batteryLevel > 0.5 && memoryRatio < 0.5;
      case 'serviceWorker':
        return batteryLevel > 0.3;
      default:
        return true;
    }
  },
});