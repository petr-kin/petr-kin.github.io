'use client';

import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface WebVitals {
  FCP?: number;  // First Contentful Paint
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const webVitalsRef = useRef<WebVitals>({});

  // Track custom metric
  const trackMetric = useCallback((name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    
    metricsRef.current.push(metric);
    
    console.log(`Performance Metric: ${name} = ${value}ms`);
    
    // Could send to analytics service
    // analytics.track('performance_metric', metric);
  }, []);

  // Measure function execution time
  const measureFunction = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => R,
    name: string
  ) => {
    return (...args: T): R => {
      const start = performance.now();
      const result = fn(...args);
      const duration = performance.now() - start;
      
      trackMetric(`function_${name}`, duration);
      
      return result;
    };
  }, [trackMetric]);

  // Measure async function execution time
  const measureAsyncFunction = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    name: string
  ) => {
    return async (...args: T): Promise<R> => {
      const start = performance.now();
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      trackMetric(`async_function_${name}`, duration);
      
      return result;
    };
  }, [trackMetric]);

  // Track page load metrics
  const trackPageLoad = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Use PerformanceObserver for Web Vitals if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        const lcp = lastEntry.startTime;
        webVitalsRef.current.LCP = lcp;
        trackMetric('LCP', lcp);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number; startTime: number }) => {
          const fid = (entry.processingStart || 0) - entry.startTime;
          webVitalsRef.current.FID = fid;
          trackMetric('FID', fid);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
          }
        });
        webVitalsRef.current.CLS = clsValue;
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }

    // Fallback to Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.fetchStart;
          const fcp = navigation.loadEventEnd - navigation.fetchStart;
          
          webVitalsRef.current.TTFB = ttfb;
          webVitalsRef.current.FCP = fcp;
          
          trackMetric('TTFB', ttfb);
          trackMetric('FCP', fcp);
          trackMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          trackMetric('Load', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }, [trackMetric]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return {
      metrics: [...metricsRef.current],
      webVitals: { ...webVitalsRef.current },
      totalMetrics: metricsRef.current.length,
    };
  }, []);

  // Resource timing tracking
  const trackResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      if (resource.duration > 100) { // Only track slow resources
        trackMetric(`resource_${resource.name.split('/').pop()}`, resource.duration);
      }
    });
  }, [trackMetric]);

  // Memory usage (if supported)
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }).memory;
      trackMetric('memory_used', memory?.usedJSHeapSize / 1024 / 1024 || 0); // MB
      trackMetric('memory_total', memory?.totalJSHeapSize / 1024 / 1024 || 0); // MB
    }
  }, [trackMetric]);

  // Initialize performance tracking
  useEffect(() => {
    trackPageLoad();
    
    // Track resource timing after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        trackResourceTiming();
        trackMemoryUsage();
      }, 1000);
    });

    // Track memory usage periodically
    const memoryInterval = setInterval(trackMemoryUsage, 30000); // Every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, [trackPageLoad, trackResourceTiming, trackMemoryUsage]);

  return {
    trackMetric,
    measureFunction,
    measureAsyncFunction,
    getPerformanceSummary,
    trackResourceTiming,
    trackMemoryUsage,
  };
};

export default usePerformance;