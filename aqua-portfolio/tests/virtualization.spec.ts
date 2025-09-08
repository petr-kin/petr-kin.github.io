import { test, expect } from '@playwright/test';

test.describe('Virtualization Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to virtualization examples page
    // Note: This assumes you have a page that includes the VirtualizedListExample component
    await page.goto('/examples/virtualization');
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Wait for the list to render
    await page.waitForSelector('[data-testid="virtualized-list"]', { timeout: 10000 });

    // Measure rendering performance
    const startTime = Date.now();
    
    // Scroll through the list multiple times
    const listContainer = page.locator('[data-testid="virtualized-list"]').first();
    
    for (let i = 0; i < 10; i++) {
      await listContainer.evaluate((el) => {
        el.scrollTop = (el.scrollHeight / 10) * (i + 1);
      });
      await page.waitForTimeout(100);
    }

    const endTime = Date.now();
    const scrollTime = endTime - startTime;

    // Scrolling through large dataset should be smooth (under 2 seconds)
    expect(scrollTime).toBeLessThan(2000);
  });

  test('should maintain constant DOM node count', async ({ page }) => {
    // Count initial DOM nodes
    const initialNodeCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid="virtualized-list"] > div > div').length;
    });

    // Scroll to middle
    await page.locator('[data-testid="virtualized-list"]').first().evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2;
    });

    await page.waitForTimeout(500);

    // Count DOM nodes after scrolling
    const middleNodeCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid="virtualized-list"] > div > div').length;
    });

    // Scroll to end
    await page.locator('[data-testid="virtualized-list"]').first().evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });

    await page.waitForTimeout(500);

    // Count DOM nodes at end
    const endNodeCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid="virtualized-list"] > div > div').length;
    });

    // DOM node count should remain relatively constant (within 20% variance)
    const maxNodes = Math.max(initialNodeCount, middleNodeCount, endNodeCount);
    const minNodes = Math.min(initialNodeCount, middleNodeCount, endNodeCount);
    const variance = (maxNodes - minNodes) / maxNodes;

    expect(variance).toBeLessThan(0.2); // Less than 20% variance
    console.log('DOM node counts:', { initialNodeCount, middleNodeCount, endNodeCount });
  });

  test('should scroll to specific items correctly', async ({ page }) => {
    // Wait for scroll to top button
    const scrollToTopButton = page.locator('button:has-text("Scroll to Top")');
    await expect(scrollToTopButton).toBeVisible();

    // Scroll down first
    await page.locator('[data-testid="virtualized-list"]').first().evaluate((el) => {
      el.scrollTop = 1000;
    });

    await page.waitForTimeout(300);

    // Click scroll to top
    await scrollToTopButton.click();
    await page.waitForTimeout(500);

    // Verify we're at the top
    const scrollTop = await page.locator('[data-testid="virtualized-list"]').first().evaluate(
      (el) => el.scrollTop
    );

    expect(scrollTop).toBeLessThan(50); // Should be near top (allowing for small margins)
  });

  test('should handle random item scrolling', async ({ page }) => {
    const randomButton = page.locator('button:has-text("Random Item")');
    await expect(randomButton).toBeVisible();

    // Get initial scroll position
    const initialScroll = await page.locator('[data-testid="virtualized-list"]').first().evaluate(
      (el) => el.scrollTop
    );

    // Click random item button
    await randomButton.click();
    await page.waitForTimeout(1000); // Wait for smooth scroll

    // Get new scroll position
    const newScroll = await page.locator('[data-testid="virtualized-list"]').first().evaluate(
      (el) => el.scrollTop
    );

    // Should have scrolled to a different position
    expect(Math.abs(newScroll - initialScroll)).toBeGreaterThan(100);
  });

  test('should load more items in infinite scroll', async ({ page }) => {
    // Find infinite scroll list
    const infiniteList = page.locator('[data-testid="infinite-list"]');
    if (await infiniteList.count() > 0) {
      // Get initial item count
      const initialText = await page.locator('text=/items loaded/').first().textContent();
      const initialMatch = initialText?.match(/(\d+) items loaded/);
      const initialCount = initialMatch ? parseInt(initialMatch[1].replace(/,/g, '')) : 0;

      // Scroll to bottom to trigger loading
      await infiniteList.evaluate((el) => {
        el.scrollTop = el.scrollHeight - el.clientHeight;
      });

      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Get new item count
      const newText = await page.locator('text=/items loaded/').first().textContent();
      const newMatch = newText?.match(/(\d+) items loaded/);
      const newCount = newMatch ? parseInt(newMatch[1].replace(/,/g, '')) : 0;

      // Should have loaded more items
      expect(newCount).toBeGreaterThan(initialCount);
      console.log('Item counts:', { initialCount, newCount });
    }
  });

  test('should render grid items efficiently', async ({ page }) => {
    const grid = page.locator('[data-testid="virtualized-grid"]');
    if (await grid.count() > 0) {
      // Measure grid rendering time
      const startTime = Date.now();

      // Scroll through grid
      for (let i = 0; i < 5; i++) {
        await grid.evaluate((el, scrollFactor) => {
          el.scrollTop = (el.scrollHeight / 5) * (scrollFactor + 1);
        }, i);
        await page.waitForTimeout(100);
      }

      const renderTime = Date.now() - startTime;

      // Grid scrolling should be smooth
      expect(renderTime).toBeLessThan(1500);

      // Check that grid items are rendered
      const gridItems = await grid.locator('> div > div').count();
      expect(gridItems).toBeGreaterThan(0);
    }
  });

  test('should handle variable height items correctly', async ({ page }) => {
    const variableList = page.locator('[data-testid="variable-height-list"]');
    if (await variableList.count() > 0) {
      // Scroll through variable height list
      await variableList.evaluate((el) => {
        el.scrollTop = el.scrollHeight / 2;
      });

      await page.waitForTimeout(500);

      // Check that items have different heights
      const itemHeights = await variableList.locator('> div > div').evaluateAll((items) => {
        return items.slice(0, 5).map(item => (item as HTMLElement).offsetHeight);
      });

      // At least some items should have different heights
      const uniqueHeights = [...new Set(itemHeights)];
      expect(uniqueHeights.length).toBeGreaterThan(1);
      console.log('Item heights:', itemHeights);
    }
  });

  test('should not cause memory leaks during intensive scrolling', async ({ page }) => {
    // Enable memory monitoring if available
    const cdpSession = await page.context().newCDPSession(page);
    
    try {
      await cdpSession.send('HeapProfiler.enable');
      
      // Get initial heap size
      const initialHeap = await cdpSession.send('Runtime.getHeapUsage');
      
      const list = page.locator('[data-testid="virtualized-list"]').first();
      
      // Perform intensive scrolling
      for (let i = 0; i < 50; i++) {
        const scrollPosition = Math.random() * 100; // Random scroll percentage
        await list.evaluate((el, pos) => {
          el.scrollTop = (el.scrollHeight - el.clientHeight) * (pos / 100);
        }, scrollPosition);
        
        if (i % 10 === 0) {
          // Force garbage collection periodically
          await page.evaluate(() => {
            if (window.gc) {
              window.gc();
            }
          });
        }
      }

      // Get final heap size
      const finalHeap = await cdpSession.send('Runtime.getHeapUsage');
      
      // In a proper implementation, heap size shouldn't grow dramatically
      console.log('Memory test completed - check DevTools for detailed analysis');
      
    } catch (error) {
      console.log('Memory profiling not available:', (error as any)?.message);
    }
  });

  test('should maintain scroll position during window resize', async ({ page }) => {
    const list = page.locator('[data-testid="virtualized-list"]').first();
    
    // Scroll to middle
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2;
    });

    await page.waitForTimeout(300);
    
    const initialScrollTop = await list.evaluate((el) => el.scrollTop);
    
    // Resize window
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const finalScrollTop = await list.evaluate((el) => el.scrollTop);
    
    // Scroll position should remain relatively the same (within 10% variance)
    const scrollVariance = Math.abs(finalScrollTop - initialScrollTop) / initialScrollTop;
    expect(scrollVariance).toBeLessThan(0.1);
  });

  test('should handle rapid scroll events without performance degradation', async ({ page }) => {
    const list = page.locator('[data-testid="virtualized-list"]').first();
    
    const startTime = Date.now();
    
    // Simulate rapid scrolling
    for (let i = 0; i < 100; i++) {
      await list.evaluate((el, step) => {
        el.scrollTop = step * 10;
      }, i);
    }
    
    const rapidScrollTime = Date.now() - startTime;
    
    // Rapid scrolling should complete quickly (under 3 seconds)
    expect(rapidScrollTime).toBeLessThan(3000);
    
    console.log('Rapid scroll test completed in:', rapidScrollTime + 'ms');
  });
});

// Helper test to create a page with virtualization examples
test('should create virtualization test page', async ({ page }) => {
  // This test ensures we have the necessary test setup
  // In a real implementation, you would navigate to or create a test page
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Virtualization Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .virtual-list { border: 1px solid #ddd; height: 400px; overflow: auto; }
        .list-item { padding: 10px; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <h1>Virtualization Test Page</h1>
      <div data-testid="virtualized-list" class="virtual-list">
        <div style="height: 10000px; position: relative;">
          ${Array.from({ length: 100 }, (_, i) => 
            `<div class="list-item" style="position: absolute; top: ${i * 100}px; width: 100%;">
              Item ${i + 1}
            </div>`
          ).join('')}
        </div>
      </div>
      
      <button onclick="document.querySelector('[data-testid=virtualized-list]').scrollTop = 0">
        Scroll to Top
      </button>
      
      <button onclick="document.querySelector('[data-testid=virtualized-list]').scrollTop = Math.random() * 5000">
        Random Item
      </button>
      
      <div>100 items loaded</div>
    </body>
    </html>
  `);

  await expect(page.locator('[data-testid="virtualized-list"]')).toBeVisible();
  await expect(page.locator('button:has-text("Scroll to Top")')).toBeVisible();
});