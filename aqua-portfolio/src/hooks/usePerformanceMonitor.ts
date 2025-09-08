'use client';

import { useEffect, useState } from 'react';
import { getBundleInfo } from '@/lib/performance';

interface PerformanceMetrics {
  totalLoadTime?: number;
  jsResourcesCount: number;
  cssResourcesCount: number;
  imageResourcesCount: number;
  memoryUsage?: number;
  renderTime?: number;
}

export const usePerformanceMonitor = (componentName?: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    jsResourcesCount: 0,
    cssResourcesCount: 0,
    imageResourcesCount: 0,
  });

  const [renderStart] = useState(() => performance.now());

  useEffect(() => {
    const updateMetrics = () => {
      const bundleInfo = getBundleInfo();
      const renderTime = performance.now() - renderStart;
      
      const newMetrics: PerformanceMetrics = {
        totalLoadTime: bundleInfo?.totalLoadTime,
        jsResourcesCount: bundleInfo?.jsResources.length || 0,
        cssResourcesCount: bundleInfo?.cssResources.length || 0,
        imageResourcesCount: bundleInfo?.imageResources.length || 0,
        renderTime,
      };

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = memory.usedJSHeapSize;
      }

      setMetrics(newMetrics);

      // Log performance data in development
      if (process.env.NODE_ENV === 'development' && componentName) {
        console.group(`Performance: ${componentName}`);
        console.log('Render time:', `${renderTime.toFixed(2)}ms`);
        console.log('JS resources:', newMetrics.jsResourcesCount);
        console.log('CSS resources:', newMetrics.cssResourcesCount);
        if (newMetrics.memoryUsage) {
          console.log('Memory usage:', `${(newMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        }
        console.groupEnd();
      }
    };

    // Wait for resources to load
    if (document.readyState === 'complete') {
      updateMetrics();
    } else {
      window.addEventListener('load', updateMetrics);
      return () => window.removeEventListener('load', updateMetrics);
    }
  }, [renderStart, componentName]);

  return metrics;
};