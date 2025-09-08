# Performance Testing & Optimization Guide

## Overview

This portfolio includes comprehensive performance testing and optimization infrastructure using Lighthouse, Playwright, and automated CI/CD workflows.

## 🚀 Quick Start

### Running Performance Tests

```bash
# Run all performance tests
npm run test:performance

# Run only Lighthouse CI tests
npm run lighthouse:ci

# Run only Playwright performance tests  
npm run test:lighthouse

# Run bundle analysis
npm run analyze

# Generate single Lighthouse report
npm run lighthouse
```

### Development Performance Monitoring

```bash
# Start dev server with performance monitoring
npm run dev

# Check Web Vitals in browser console
# Open DevTools → Console → Look for "Web Vital" logs
```

## 📊 Performance Testing Architecture

### 1. Lighthouse CI (`scripts/lighthouse-ci.js`)

**Features:**
- Multi-scenario testing (Desktop, Mobile, Mobile 3G)
- Core Web Vitals monitoring
- Performance threshold enforcement
- Automated report generation
- Regression tracking

**Scenarios:**
- **Desktop**: 1920x1080, fast network, no CPU throttling
- **Mobile**: 375x667, 4G network, 4x CPU throttling  
- **Mobile 3G**: Slow 3G network simulation, 4x CPU throttling

**Thresholds:**
```javascript
{
  performance: 90,      // Performance score
  accessibility: 95,    // Accessibility score
  bestPractices: 90,    // Best practices score  
  seo: 95,             // SEO score
  fcp: 1800,           // First Contentful Paint (ms)
  lcp: 2500,           // Largest Contentful Paint (ms)
  tbt: 200,            // Total Blocking Time (ms)
  cls: 0.1,            // Cumulative Layout Shift
  si: 3000,            // Speed Index (ms)
  tti: 3800            // Time to Interactive (ms)
}
```

### 2. Playwright Performance Tests (`tests/lighthouse.spec.ts`)

**Test Cases:**
- Lighthouse threshold validation
- Performance report generation
- Performance regression tracking
- Core Web Vitals validation under real conditions

### 3. Automated CI/CD (`.github/workflows/performance.yml`)

**Workflow Features:**
- **Lighthouse Tests**: Automated performance testing on every PR
- **Performance Regression**: Compares against main branch baseline
- **Bundle Analysis**: Tracks bundle size changes
- **Daily Monitoring**: Scheduled daily performance checks
- **PR Comments**: Automated performance reports in pull requests

## 📈 Performance Optimization Features

### 1. Web Vitals Monitoring (`src/lib/analytics.ts`)

```typescript
// Automatic Core Web Vitals tracking
import { analytics } from '@/lib/analytics';

// Get current vitals
const vitals = analytics.getWebVitals();

// Get performance score (0-100)
const score = analytics.getPerformanceScore();

// Get detailed report with recommendations
const report = analytics.getPerformanceReport();
```

### 2. Third-Party Script Optimization (`src/components/ThirdPartyScripts.tsx`)

**Features:**
- Conditional loading based on environment variables
- Optimized loading strategies (`afterInteractive`, `beforeInteractive`)
- Resource hints for third-party domains
- Client-side hydration protection

### 3. Intersection Observer Optimization (`src/hooks/useIntersectionObserver.tsx`)

```typescript
// Efficient animation triggering
const { targetRef, isIntersecting, shouldAnimate } = useIntersectionObserver({
  threshold: 0.3,
  triggerOnce: true
});
```

### 4. CSS Performance Optimizations (`src/app/globals.css`)

```css
/* GPU acceleration utilities */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Will-change optimization */
.will-change-transform { will-change: transform; }

/* Reduced motion respect */
@media (prefers-reduced-motion: reduce) {
  * { will-change: auto !important; }
}
```

### 5. Bundle Optimization (`next.config.ts`)

**Features:**
- Bundle analyzer integration
- Image optimization with WebP/AVIF support
- Security headers
- Static asset optimization

## 📋 Performance Reports

### Report Locations

- **Lighthouse Summary**: `lighthouse-reports/lighthouse-summary.md`
- **Lighthouse CI Data**: `lighthouse-reports/lighthouse-ci.json`
- **Individual Reports**: `lighthouse-reports/*.json`
- **Bundle Analysis**: `.next/analyze/`

### Report Structure

```json
{
  "timestamp": "2025-01-XX",
  "scenarios": [
    {
      "name": "Desktop - Homepage",
      "scores": {
        "performance": 95,
        "accessibility": 98,
        "bestPractices": 92,
        "seo": 100
      },
      "vitals": {
        "first-contentful-paint": "1.2s",
        "largest-contentful-paint": "1.8s",
        "cumulative-layout-shift": "0.05"
      },
      "opportunities": [...]
    }
  ]
}
```

## 🎯 Performance Targets

### Core Web Vitals Goals

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Lighthouse Score Goals

| Category | Target | Current |
|----------|--------|---------|
| **Performance** | ≥ 90 | TBD |
| **Accessibility** | ≥ 95 | TBD |
| **Best Practices** | ≥ 90 | TBD |
| **SEO** | ≥ 95 | TBD |

## 🛠️ Optimization Checklist

### Development Phase
- [ ] Use React.memo for expensive components
- [ ] Implement intersection observers for animations
- [ ] Add loading states with skeleton components
- [ ] Optimize images with next/image
- [ ] Use will-change CSS property judiciously
- [ ] Implement error boundaries
- [ ] Add performance monitoring

### Pre-Production
- [ ] Run bundle analysis
- [ ] Check Lighthouse scores
- [ ] Validate Core Web Vitals
- [ ] Test on 3G networks
- [ ] Review console errors/warnings
- [ ] Verify accessibility
- [ ] Test offline functionality

### Production Monitoring
- [ ] Set up performance alerts
- [ ] Monitor real user metrics
- [ ] Track performance regressions  
- [ ] Review monthly performance reports
- [ ] Update performance baselines

## 🚨 Common Performance Issues & Solutions

### Issue: Large Bundle Size
**Solutions:**
- Use dynamic imports for heavy components
- Implement code splitting
- Remove unused dependencies
- Optimize images and assets

### Issue: Poor LCP Score
**Solutions:**  
- Optimize images (WebP, lazy loading)
- Reduce server response time
- Remove render-blocking resources
- Use CDN for static assets

### Issue: High CLS Score
**Solutions:**
- Set dimensions for images and ads
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use transform instead of changing layout properties

### Issue: Poor FID Score
**Solutions:**
- Reduce JavaScript execution time
- Split long tasks
- Use web workers for heavy computation
- Implement progressive hydration

## 📚 Additional Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Performance Audits](https://web.dev/lighthouse-performance/)
- [Core Web Vitals Workflow](https://web.dev/vitals-tools/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)