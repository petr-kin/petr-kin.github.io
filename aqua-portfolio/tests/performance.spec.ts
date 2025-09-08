import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Start monitoring performance
    const performanceMetrics: any[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Web Vital')) {
        performanceMetrics.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for the page to fully load and collect metrics
    await page.waitForTimeout(3000);

    // Test page load time
    const navigationEntry = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    });

    const loadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

    // Test Time to First Byte
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    expect(ttfb).toBeLessThan(800); // Should be under 800ms

    // Test First Contentful Paint
    const paintEntries = await page.evaluate(() => {
      return performance.getEntriesByType('paint');
    });

    const fcp = paintEntries.find((entry: any) => entry.name === 'first-contentful-paint');
    if (fcp) {
      expect(fcp.startTime).toBeLessThan(1800); // Good FCP threshold
    }

    console.log('Performance Metrics:', {
      loadTime,
      ttfb,
      fcp: fcp?.startTime,
    });
  });

  test('should not have layout shifts', async ({ page }) => {
    let clsValue = 0;

    // Monitor layout shifts
    await page.addInitScript(() => {
      let cumulativeLayoutShiftScore = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShiftScore += (entry as any).value;
          }
        }
        (window as any).cumulativeLayoutShiftScore = cumulativeLayoutShiftScore;
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    clsValue = await page.evaluate(() => (window as any).cumulativeLayoutShiftScore || 0);
    
    // Good CLS score is less than 0.1
    expect(clsValue).toBeLessThan(0.1);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');

    // Check for images without proper attributes
    const images = await page.$$('img');
    
    for (const img of images) {
      const hasAlt = await img.getAttribute('alt');
      const hasLoading = await img.getAttribute('loading');
      
      expect(hasAlt).not.toBeNull(); // All images should have alt text
      
      // Images below the fold should have lazy loading
      const rect = await img.boundingBox();
      if (rect && rect.y > 800) {
        expect(hasLoading).toBe('lazy');
      }
    }
  });

  test('should not block main thread for long periods', async ({ page }) => {
    await page.goto('/');

    // Measure long tasks
    const longTasks = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const tasks: any[] = [];
        
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            tasks.push(...list.getEntries());
          });
          
          observer.observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(tasks);
          }, 5000);
        } else {
          resolve([]);
        }
      });
    });

    // Should not have tasks longer than 50ms
    const longTasksOver50ms = (longTasks as any[]).filter(task => task.duration > 50);
    expect(longTasksOver50ms.length).toBeLessThanOrEqual(2);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    
    const response = await page.goto('/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    }).catch(() => null);
    
    if (!response) {
      // Should show offline message or cached content
      const offlineIndicator = await page.locator('text=offline').first().isVisible()
        .catch(() => false);
      
      expect(offlineIndicator).toBeTruthy();
    }
    
    // Restore online
    await page.context().setOffline(false);
  });

  test('should have good accessibility performance', async ({ page }) => {
    await page.goto('/');

    // Check for focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    
    const focusOutline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    
    expect(focusOutline).toBeTruthy();

    // Test keyboard navigation
    let tabCount = 0;
    const maxTabs = 20;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      if (!activeElement) break;
    }
    
    expect(tabCount).toBeGreaterThan(5); // Should have multiple focusable elements
  });
});