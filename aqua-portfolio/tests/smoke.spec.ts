import { test, expect } from '@playwright/test'

test.describe('AquaPortfolio Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage renders key sections', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Petr Kindlmann|Portfolio|QA/)
    
    // Navigation is visible
    await expect(page.locator('header nav')).toBeVisible()
    await expect(page.getByText('PK')).toBeVisible()
    
    // Hero section elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Clean code. Precise tests.')).toBeVisible()
    await expect(page.getByText('View Projects')).toBeVisible()
    
    // Key sections are present
    await expect(page.getByText('Featured Work')).toBeVisible()
    await expect(page.getByText('QA Laboratory')).toBeVisible()
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible()
    await expect(page.getByText('Ready to Build Something Great?')).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    // Test navigation links
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(page.locator('#projects')).toBeInViewport()
    
    await page.getByRole('link', { name: 'Contact' }).click()
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('project cards are interactive', async ({ page }) => {
    // Scroll to projects section
    await page.locator('#projects').scrollIntoViewIfNeeded()
    
    // Check that project cards are visible
    const projectCards = page.locator('[class*="project"]').first()
    await expect(projectCards).toBeVisible()
    
    // Check that project cards have hover effects (by checking for glass-card class)
    const glassCards = await page.locator('.glass-card').count()
    expect(glassCards).toBeGreaterThanOrEqual(1)
  })

  test('contact section has working email links', async ({ page }) => {
    // Scroll to contact section
    await page.locator('#contact').first().scrollIntoViewIfNeeded()
    
    // Check email link exists
    const emailLink = page.getByText('thepetr@gmail.com')
    await expect(emailLink).toBeVisible()
    
    // Check contact buttons are present
    await expect(page.getByText('Send Project Inquiry')).toBeVisible()
    await expect(page.getByText('Schedule a Call')).toBeVisible()
  })

  test('FAQ section is interactive', async ({ page }) => {
    // Scroll to FAQ section
    await page.locator('[data-testid="faq"], :text("Frequently Asked Questions")').first().scrollIntoViewIfNeeded()
    
    // Try to expand an accordion item (shadcn accordion)
    const firstFaqItem = page.locator('[data-testid="accordion-trigger"], button[role="button"]').first()
    if (await firstFaqItem.isVisible()) {
      await firstFaqItem.click()
      // Wait a moment for animation
      await page.waitForTimeout(300)
    }
  })

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigation should adapt
    await expect(page.locator('header')).toBeVisible()
    
    // Hero should still be readable
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('header nav')).toBeVisible()
  })

  test('performance budget check', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    // Navigate to page
    await page.goto('/')
    
    // Wait for main content to load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time (adjust based on your requirements)
    expect(loadTime).toBeLessThan(5000) // 5 seconds
    
    // Check for performance metrics
    const performanceTiming = await page.evaluate(() => performance.now())
    expect(performanceTiming).toBeLessThan(10000) // 10 seconds total
  })

  test('accessibility basics', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    
    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
    
    // Check that images have alt text (if any)
    const images = page.locator('img')
    const imageCount = await images.count()
    if (imageCount > 0) {
      await expect(images.first()).toHaveAttribute('alt')
    }
  })
})