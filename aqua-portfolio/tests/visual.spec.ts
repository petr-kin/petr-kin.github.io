import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to be fully loaded
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('homepage should match visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('homepage mobile should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('homepage tablet should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('homepage-tablet.png');
  });

  test('dark mode should match baseline', async ({ page }) => {
    await page.click('[data-theme-toggle]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });
});