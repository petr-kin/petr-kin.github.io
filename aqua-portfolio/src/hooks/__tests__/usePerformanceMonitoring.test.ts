import { renderHook, act, waitFor } from '@testing-library/react';
import { usePerformanceMonitoring } from '../usePerformanceMonitoring';

// Mock performance APIs
const mockPerformance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(() => [{ startTime: 1000, duration: 100 }]),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 5000000,
    totalJSHeapSize: 10000000,
    jsHeapSizeLimit: 100000000,
  },
};

// Mock Zustand store
const mockPerformanceActions = {
  recordInteraction: jest.fn(),
  updateMemoryInfo: jest.fn(),
  recordMetric: jest.fn(),
};

jest.mock('@/store/appStore', () => ({
  usePerformanceActions: () => mockPerformanceActions,
}));

// Mock web-vitals
const mockWebVitals = {
  getCLS: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'CLS',
      value: 0.05,
      rating: 'good',
      id: 'cls-1',
      delta: 0.05,
    }), 100);
  }),
  getFCP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'FCP',
      value: 1500,
      rating: 'good',
      id: 'fcp-1',
    }), 100);
  }),
  getFID: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'FID',
      value: 80,
      rating: 'good',
      id: 'fid-1',
    }), 100);
  }),
  getLCP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'LCP',
      value: 2200,
      rating: 'good',
      id: 'lcp-1',
    }), 100);
  }),
  getTTFB: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'TTFB',
      value: 400,
      rating: 'good',
      id: 'ttfb-1',
    }), 100);
  }),
  getINP: jest.fn((callback) => {
    setTimeout(() => callback({
      name: 'INP',
      value: 150,
      rating: 'good',
      id: 'inp-1',
    }), 100);
  }),
};

jest.mock('web-vitals', () => mockWebVitals);

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup performance mock
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: mockPerformance,
    });

    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      expect(result.current).toHaveProperty('measureOperation');
      expect(result.current).toHaveProperty('recordMemoryUsage');
      expect(result.current).toHaveProperty('collectResourceTiming');
      expect(result.current).toHaveProperty('generateReport');
      expect(result.current).toHaveProperty('metrics');
    });

    it('should accept custom options', () => {
      const onReport = jest.fn();
      const { result } = renderHook(() => 
        usePerformanceMonitoring({
          enableWebVitals: false,
          enableMemoryTracking: false,
          reportInterval: 5000,
          onReport,
        })
      );

      expect(result.current).toBeTruthy();
    });
  });

  describe('measureOperation', () => {
    it('should measure synchronous operations', () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const operationResult = result.current.measureOperation('test-sync', () => {
        return 'sync-result';
      });

      expect(operationResult).toBe('sync-result');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-sync-start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-sync-end');
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        'test-sync-duration',
        'test-sync-start', 
        'test-sync-end'
      );
    });

    it('should measure asynchronous operations', async () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async-result';
      };

      const promise = result.current.measureOperation('test-async', asyncOperation);
      expect(promise).toBeInstanceOf(Promise);

      const operationResult = await promise;
      expect(operationResult).toBe('async-result');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-async-start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-async-end');
    });

    it('should handle synchronous operation errors', () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      expect(() => {
        result.current.measureOperation('test-error', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(mockPerformance.mark).toHaveBeenCalledWith('test-error-start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-error-end');
    });

    it('should handle asynchronous operation errors', async () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      const failingAsyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Async error');
      };

      await expect(
        result.current.measureOperation('test-async-error', failingAsyncOperation)
      ).rejects.toThrow('Async error');

      expect(mockPerformance.mark).toHaveBeenCalledWith('test-async-error-start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-async-error-end');
    });
  });

  describe('recordMemoryUsage', () => {
    it('should record memory usage when available', () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      act(() => {
        result.current.recordMemoryUsage();
      });

      expect(mockPerformanceActions.updateMemoryInfo).toHaveBeenCalledWith(0.05); // 5MB / 100MB
    });

    it('should handle missing performance.memory gracefully', () => {
      const performanceWithoutMemory = { ...mockPerformance };
      delete (performanceWithoutMemory as any).memory;
      
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: performanceWithoutMemory,
      });

      const { result } = renderHook(() => usePerformanceMonitoring());

      expect(() => {
        result.current.recordMemoryUsage();
      }).not.toThrow();
    });

    it('should not record memory when disabled', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitoring({ enableMemoryTracking: false })
      );

      act(() => {
        result.current.recordMemoryUsage();
      });

      expect(mockPerformanceActions.updateMemoryInfo).not.toHaveBeenCalled();
    });
  });

  describe('Web Vitals integration', () => {
    it('should initialize Web Vitals when enabled', async () => {
      renderHook(() => usePerformanceMonitoring({ enableWebVitals: true }));

      await waitFor(() => {
        expect(mockWebVitals.getCLS).toHaveBeenCalled();
        expect(mockWebVitals.getFCP).toHaveBeenCalled();
        expect(mockWebVitals.getFID).toHaveBeenCalled();
        expect(mockWebVitals.getLCP).toHaveBeenCalled();
        expect(mockWebVitals.getTTFB).toHaveBeenCalled();
        expect(mockWebVitals.getINP).toHaveBeenCalled();
      });
    });

    it('should record Web Vital metrics', async () => {
      renderHook(() => usePerformanceMonitoring({ enableWebVitals: true }));

      await waitFor(() => {
        expect(mockPerformanceActions.recordInteraction).toHaveBeenCalledWith({
          type: 'web-vital-cls',
          duration: 0.05,
          successful: true,
          target: 'core-web-vitals',
        });
      });
    });

    it('should not initialize Web Vitals when disabled', () => {
      renderHook(() => usePerformanceMonitoring({ enableWebVitals: false }));

      expect(mockWebVitals.getCLS).not.toHaveBeenCalled();
      expect(mockWebVitals.getFCP).not.toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    it('should generate a comprehensive performance report', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => usePerformanceMonitoring());

      // Record some metrics
      act(() => {
        result.current.recordMemoryUsage();
      });

      // Wait for Web Vitals
      await waitFor(() => {
        expect(mockPerformanceActions.recordInteraction).toHaveBeenCalled();
      });

      const report = result.current.generateReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('duration');
      expect(report).toHaveProperty('webVitals');
      expect(report).toHaveProperty('memory');
      expect(report).toHaveProperty('resources');
      expect(report).toHaveProperty('userTiming');
      expect(report).toHaveProperty('recommendations');

      expect(typeof report.timestamp).toBe('number');
      expect(typeof report.duration).toBe('number');
      expect(Array.isArray(report.webVitals)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should generate memory recommendations for high usage', () => {
      const { result } = renderHook(() => usePerformanceMonitoring());

      // Mock high memory usage
      const highMemoryMock = {
        ...mockPerformance,
        memory: {
          usedJSHeapSize: 85000000, // 85MB
          totalJSHeapSize: 90000000,
          jsHeapSizeLimit: 100000000,
        },
      };

      Object.defineProperty(window, 'performance', {
        value: highMemoryMock,
      });

      act(() => {
        result.current.recordMemoryUsage();
      });

      const report = result.current.generateReport();
      
      expect(report.recommendations).toContain(
        'High memory usage detected. Consider implementing lazy loading or reducing bundle size.'
      );
    });
  });

  describe('Resource timing', () => {
    it('should collect resource timing data', () => {
      const mockResources = [
        {
          name: 'https://example.com/script.js',
          entryType: 'resource',
          startTime: 1000,
          duration: 500,
        },
        {
          name: 'https://example.com/style.css',
          entryType: 'resource',
          startTime: 1200,
          duration: 300,
        },
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockResources);

      const { result } = renderHook(() => usePerformanceMonitoring());

      act(() => {
        result.current.collectResourceTiming();
      });

      expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('resource');
    });

    it('should not collect resource timing when disabled', () => {
      const { result } = renderHook(() => 
        usePerformanceMonitoring({ enableResourceTiming: false })
      );

      act(() => {
        result.current.collectResourceTiming();
      });

      expect(mockPerformance.getEntriesByType).not.toHaveBeenCalled();
    });
  });

  describe('Periodic reporting', () => {
    it('should set up periodic reporting when enabled', async () => {
      jest.useFakeTimers();
      const onReport = jest.fn();

      renderHook(() => 
        usePerformanceMonitoring({
          reportInterval: 1000,
          onReport,
        })
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onReport).toHaveBeenCalled();
      });

      expect(mockPerformanceActions.recordMetric).toHaveBeenCalled();
    });

    it('should not set up periodic reporting when interval is 0', () => {
      const onReport = jest.fn();

      renderHook(() => 
        usePerformanceMonitoring({
          reportInterval: 0,
          onReport,
        })
      );

      expect(onReport).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up intervals on unmount', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => 
        usePerformanceMonitoring({ reportInterval: 1000 })
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle Web Vitals import errors gracefully', async () => {
      const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      // Mock failed import
      jest.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });

      renderHook(() => usePerformanceMonitoring({ enableWebVitals: true }));

      await waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Web Vitals could not be loaded:',
          expect.any(Error)
        );
      });

      mockConsoleWarn.mockRestore();
    });

    it('should handle performance API unavailability', () => {
      // Remove performance API
      delete (window as any).performance;

      expect(() => {
        renderHook(() => usePerformanceMonitoring());
      }).not.toThrow();
    });
  });
});

describe('Performance Report Interface', () => {
  it('should have correct TypeScript types', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      result.current.recordMemoryUsage();
    });

    const report = result.current.generateReport();

    // Type checks - these should not cause TypeScript errors
    const timestamp: number = report.timestamp;
    const duration: number = report.duration;
    const webVitals: any[] = report.webVitals;
    const memory: any = report.memory;
    const resources: any = report.resources;
    const userTiming: any[] = report.userTiming;
    const recommendations: string[] = report.recommendations;

    expect(typeof timestamp).toBe('number');
    expect(typeof duration).toBe('number');
    expect(Array.isArray(webVitals)).toBe(true);
    expect(Array.isArray(userTiming)).toBe(true);
    expect(Array.isArray(recommendations)).toBe(true);
    expect(typeof memory).toBe('object');
    expect(typeof resources).toBe('object');
  });
});