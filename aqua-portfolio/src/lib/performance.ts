// Performance utilities for lazy loading and optimization

export const loadComponentWithFallback = async <T>(
  importFn: () => Promise<{ default: T }>,
  timeout = 5000
): Promise<{ default: T }> => {
  return Promise.race([
    importFn(),
    new Promise<{ default: T }>((_, reject) =>
      setTimeout(() => reject(new Error('Component loading timeout')), timeout)
    )
  ]);
};

export const preloadComponent = (importFn: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on interaction or when browser is idle
    const load = () => {
      importFn().catch(() => {
        // Silently fail preload attempts
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load);
    } else {
      setTimeout(load, 1);
    }
  }
};

export const createIntersectionLoader = (
  element: HTMLElement | null,
  loadFn: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) => {
  if (!element || typeof IntersectionObserver === 'undefined') {
    loadFn();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadFn();
        observer.disconnect();
      }
    });
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
};

// Bundle size analysis helpers
export const getBundleInfo = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');
    
    return {
      totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      jsResources: resources.filter(r => r.name.endsWith('.js')),
      cssResources: resources.filter(r => r.name.endsWith('.css')),
      imageResources: resources.filter(r => 
        r.name.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)(\?|$)/i)
      ),
    };
  }
  
  return null;
};