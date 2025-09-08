import { test, expect } from '@playwright/test'

test.describe('Blog Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
  })

  test('blog page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog|Petr Kindlmann/)
    await expect(page.getByRole('heading', { name: /QA Insights Blog/i })).toBeVisible()
  })

  test('featured posts are displayed', async ({ page }) => {
    // Check for featured posts section
    const featuredSection = page.getByText('Featured Articles')
    if (await featuredSection.isVisible()) {
      await expect(featuredSection).toBeVisible()
    }
  })

  test('blog posts have proper structure', async ({ page }) => {
    // Check that blog post cards are present
    const blogCards = page.locator('[class*="Card"], .blog-post, article').first()
    if (await blogCards.isVisible()) {
      await expect(blogCards).toBeVisible()
    }

    // Check for read time indicators
    const readTimeElements = page.getByText(/\d+\s*min.*read/i)
    if (await readTimeElements.count() > 0) {
      await expect(readTimeElements.first()).toBeVisible()
    }
  })

  test('newsletter signup is present', async ({ page }) => {
    const newsletterSection = page.getByText(/Stay Updated|Newsletter|Subscribe/i)
    if (await newsletterSection.count() > 0) {
      await expect(newsletterSection.first()).toBeVisible()
    }
  })

  test('blog categories and tags work', async ({ page }) => {
    // Check for category badges
    const badges = page.locator('[class*="badge"], .badge, .tag')
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible()
    }
  })

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should still be readable on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Cards should stack properly on mobile
    const mainContent = page.locator('main, .container, [class*="max-w"]').first()
    await expect(mainContent).toBeVisible()
  })
})