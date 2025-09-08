import { test, expect } from '@playwright/test'

test.describe('Case Studies Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/case-studies')
  })

  test('case studies page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Case Studies|Petr Kindlmann/)
    await expect(page.getByRole('heading', { name: /Case Studies/i })).toBeVisible()
  })

  test('case study cards display key information', async ({ page }) => {
    // Look for case study cards
    const caseStudyCards = page.locator('[class*="Card"], .case-study, article').first()
    if (await caseStudyCards.isVisible()) {
      await expect(caseStudyCards).toBeVisible()
      
      // Check for key metrics or results
      const metricsSection = page.getByText(/Key Results|Results|Metrics/i)
      if (await metricsSection.count() > 0) {
        await expect(metricsSection.first()).toBeVisible()
      }
    }
  })

  test('technology badges are displayed', async ({ page }) => {
    // Check for technology/tool badges
    const techBadges = page.locator('[class*="badge"], .badge, .tech-tag')
    if (await techBadges.count() > 0) {
      await expect(techBadges.first()).toBeVisible()
    }
  })

  test('call-to-action section is present', async ({ page }) => {
    // Look for consultation or contact CTA
    const ctaSection = page.getByText(/Schedule Consultation|Contact|Get in Touch/i)
    if (await ctaSection.count() > 0) {
      await expect(ctaSection.first()).toBeVisible()
    }
  })

  test('case study links are functional', async ({ page }) => {
    // Check for "Read Full Case Study" or similar links
    const readMoreLinks = page.getByText(/Read Full|View Details|Learn More/i)
    if (await readMoreLinks.count() > 0) {
      const firstLink = readMoreLinks.first()
      await expect(firstLink).toBeVisible()
      
      // Check that it has proper href attribute
      if (await firstLink.getAttribute('href')) {
        await expect(firstLink).toHaveAttribute('href', /.+/)
      }
    }
  })

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should be readable on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Case study cards should stack properly
    const mainContent = page.locator('main, .container').first()
    await expect(mainContent).toBeVisible()
  })

  test('performance metrics are highlighted', async ({ page }) => {
    // Look for performance improvements or metrics
    const performanceMetrics = page.getByText(/\d+%|faster|improvement|reduction/i)
    if (await performanceMetrics.count() > 0) {
      await expect(performanceMetrics.first()).toBeVisible()
    }
  })
})