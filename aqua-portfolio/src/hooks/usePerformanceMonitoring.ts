'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceActions } from '@/store/appStore';

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta?: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const usePerformanceMonitoring = (options: {
  enableWebVitals?: boolean;
  enableMemoryTracking?: boolean;
  enableResourceTiming?: boolean;
  enableUserTiming?: boolean;
  reportInterval?: number;
  onReport?: (report: PerformanceReport) => void;
} = {}) => {
  const {
    enableWebVitals = true,
    enableMemoryTracking = true,
    enableResourceTiming = true,
    enableUserTiming = true,
    reportInterval = 30000, // 30 seconds
    onReport,
  } = options;

  const performanceActions = usePerformanceActions();
  const metricsRef = useRef<{
    webVitals: WebVitalMetric[];
    memory: MemoryInfo[];
    resources: PerformanceEntry[];
    userTiming: PerformanceEntry[];
    startTime: number;
  }>({
    webVitals: [],
    memory: [],
    resources: [],
    userTiming: [],
    startTime: performance.now(),
  });

  const reportIntervalRef = useRef<NodeJS.Timeout>();

  // Measure operation timing
  const measureOperation = useCallback(<T>(
    name: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> => {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;

    performance.mark(startMark);

    const handleResult = (result: T) => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      if (enableUserTiming) {
        const measure = performance.getEntriesByName(measureName)[0];
        metricsRef.current.userTiming.push({
          name: measureName,
          entryType: 'measure',
          startTime: measure.startTime,
          duration: measure.duration,
        });
      }

      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);

      return result;
    };

    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.then(handleResult).catch((error) => {
          performance.mark(endMark);
          performance.measure(measureName, startMark, endMark);
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(measureName);
          throw error;
        }) as T;
      } else {
        return handleResult(result);
      }
    } catch (error) {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
      throw error;
    }
  }, [enableUserTiming]);

  // Record memory usage
  const recordMemoryUsage = useCallback(() => {
    if (!enableMemoryTracking || typeof window === 'undefined') return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memory.push({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });

      // Update store with current memory usage
      performanceActions.updateMemoryInfo(
        memory.usedJSHeapSize / memory.jsHeapSizeLimit
      );
    }
  }, [enableMemoryTracking, performanceActions]);

  // Record Web Vital
  const recordWebVital = useCallback((metric: WebVitalMetric) => {
    if (!enableWebVitals) return;

    metricsRef.current.webVitals.push(metric);
    
    // Update store with web vital
    performanceActions.recordInteraction({
      type: `web-vital-${metric.name.toLowerCase()}`,
      duration: metric.value,
      successful: metric.rating === 'good',
      target: 'core-web-vitals',
    });

    console.log(`📈 Web Vital: ${metric.name} = ${metric.value} (${metric.rating})`);
  }, [enableWebVitals, performanceActions]);

  // Collect resource timing data
  const collectResourceTiming = useCallback(() => {
    if (!enableResourceTiming) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const newResources = resources.filter(
      resource => resource.startTime > metricsRef.current.startTime
    );

    metricsRef.current.resources.push(
      ...newResources.map(resource => ({
        name: resource.name,
        entryType: resource.entryType,
        startTime: resource.startTime,
        duration: resource.duration,
      }))
    );

    // Update start time to avoid duplicate entries
    if (newResources.length > 0) {
      metricsRef.current.startTime = Math.max(
        ...newResources.map(r => r.startTime + r.duration)
      );
    }
  }, [enableResourceTiming]);

  // Generate performance report
  const generateReport = useCallback((): PerformanceReport => {
    const now = performance.now();
    const duration = now - metricsRef.current.startTime;

    const report: PerformanceReport = {
      timestamp: Date.now(),
      duration,
      webVitals: [...metricsRef.current.webVitals],
      memory: {
        current: metricsRef.current.memory[metricsRef.current.memory.length - 1],
        peak: metricsRef.current.memory.reduce((peak, current) => 
          current.usedJSHeapSize > peak.usedJSHeapSize ? current : peak,
          metricsRef.current.memory[0] || { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 }
        ),
        samples: metricsRef.current.memory.length,
      },
      resources: {
        total: metricsRef.current.resources.length,
        totalSize: metricsRef.current.resources.reduce((sum, r) => sum + (r.duration || 0), 0),
        slowestResource: metricsRef.current.resources.reduce((slowest, current) =>
          current.duration > slowest.duration ? current : slowest,
          { name: '', duration: 0 } as PerformanceEntry
        ),
      },
      userTiming: [...metricsRef.current.userTiming],
      recommendations: generateRecommendations(),
    };

    return report;
  }, []);

  const generateRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    const metrics = metricsRef.current;

    // Memory recommendations
    if (metrics.memory.length > 0) {
      const latestMemory = metrics.memory[metrics.memory.length - 1];
      const memoryUsagePercent = (latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit) * 100;
      
      if (memoryUsagePercent > 80) {
        recommendations.push('High memory usage detected. Consider implementing lazy loading or reducing bundle size.');
      }
    }

    // Web Vitals recommendations
    const poorVitals = metrics.webVitals.filter(v => v.rating === 'poor');
    if (poorVitals.length > 0) {
      recommendations.push(`${poorVitals.length} Core Web Vitals metrics need improvement.`);
    }

    // Resource timing recommendations
    const slowResources = metrics.resources.filter(r => r.duration > 1000); // > 1s
    if (slowResources.length > 0) {
      recommendations.push(`${slowResources.length} slow resources detected. Consider optimization or caching.`);
    }

    return recommendations;
  }, []);

  // Initialize Web Vitals monitoring
  useEffect(() => {
    if (!enableWebVitals || typeof window === 'undefined') return;

    let webVitalsModule: any;

    const initWebVitals = async () => {
      try {
        // Dynamically import web-vitals to avoid SSR issues
        webVitalsModule = await import('web-vitals');
        
        const onVital = (metric: any) => {
          recordWebVital({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            delta: metric.delta,
          });
        };

        // Initialize all Web Vitals
        webVitalsModule.getCLS(onVital, { reportAllChanges: false });
        webVitalsModule.getFCP(onVital);
        webVitalsModule.getFID(onVital);
        webVitalsModule.getLCP(onVital, { reportAllChanges: false });
        webVitalsModule.getTTFB(onVital);
        
        if (webVitalsModule.getINP) {
          webVitalsModule.getINP(onVital, { reportAllChanges: false });
        }
      } catch (error) {
        console.warn('Web Vitals could not be loaded:', error);
      }
    };

    initWebVitals();
  }, [enableWebVitals, recordWebVital]);

  // Set up periodic reporting
  useEffect(() => {
    if (!reportInterval || reportInterval <= 0) return;

    reportIntervalRef.current = setInterval(() => {
      recordMemoryUsage();
      collectResourceTiming();
      
      const report = generateReport();
      onReport?.(report);
      
      // Update performance store with latest metrics
      performanceActions.recordMetric({
        name: 'memory-usage',
        value: report.memory.current?.usedJSHeapSize || 0,
        category: 'memory',
        timestamp: Date.now(),
      });
    }, reportInterval);

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [reportInterval, onReport, recordMemoryUsage, collectResourceTiming, generateReport, performanceActions]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, []);

  return {
    measureOperation,
    recordMemoryUsage,
    collectResourceTiming,
    generateReport,
    metrics: metricsRef.current,
  };
};

export interface PerformanceReport {
  timestamp: number;
  duration: number;
  webVitals: WebVitalMetric[];
  memory: {
    current?: MemoryInfo;
    peak: MemoryInfo;
    samples: number;
  };
  resources: {
    total: number;
    totalSize: number;
    slowestResource: PerformanceEntry;
  };
  userTiming: PerformanceEntry[];
  recommendations: string[];
}