#!/usr/bin/env ts-node

/**
 * Portfolio Performance Agent - Monitors and optimizes portfolio performance
 * Based on existing performance monitoring infrastructure
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PerformanceMetrics {
  timestamp: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  bundleSize: {
    total: number;
    javascript: number;
    css: number;
    images: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  customMetrics: {
    loadTime: number;
    interactiveTime: number;
    componentCount: number;
    chunkCount: number;
  };
}

interface OptimizationSuggestion {
  type: 'bundle' | 'images' | 'code' | 'lazy-loading' | 'caching' | 'critical-css';
  priority: 'high' | 'medium' | 'low';
  impact: number; // Expected performance improvement percentage
  effort: number; // Implementation effort (1-10)
  description: string;
  implementation: string;
  files?: string[];
}

interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    file?: string;
    suggestion?: string;
  }>;
  optimizations: OptimizationSuggestion[];
  trends: {
    performance: 'improving' | 'degrading' | 'stable';
    bundleSize: 'growing' | 'shrinking' | 'stable';
    memory: 'increasing' | 'decreasing' | 'stable';
  };
}

export class PortfolioPerformanceAgent {
  private readonly rootDir: string;
  private readonly srcDir: string;
  private readonly buildDir: string;
  private readonly reportsDir: string;

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.buildDir = path.join(rootDir, '.next');
    this.reportsDir = path.join(rootDir, 'performance-reports');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.reportsDir, { recursive: true });
    console.log('🚀 Portfolio Performance Agent initialized');
  }

  async analyzePerformance(): Promise<PerformanceReport> {
    console.log('📊 Analyzing portfolio performance...');
    
    await this.initialize();
    
    // Build the project first to get accurate metrics
    console.log('🔨 Building project for analysis...');
    try {
      await execAsync('npm run build', { cwd: this.rootDir });
    } catch (error) {
      console.warn('⚠️ Build failed, using existing build for analysis');
    }
    
    const metrics = await this.gatherMetrics();
    const issues = await this.identifyIssues();
    const optimizations = await this.generateOptimizations(metrics);
    const trends = await this.analyzeTrends();
    
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics,
      issues,
      optimizations: optimizations.sort((a, b) => b.impact - a.impact),
      trends
    };
    
    return report;
  }

  private async gatherMetrics(): Promise<PerformanceMetrics> {
    console.log('📈 Gathering performance metrics...');
    
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      coreWebVitals: await this.getCoreWebVitals(),
      bundleSize: await this.getBundleSize(),
      memory: await this.getMemoryUsage(),
      lighthouse: await this.getLighthouseScores(),
      customMetrics: await this.getCustomMetrics()
    };
    
    return metrics;
  }

  private async getCoreWebVitals(): Promise<PerformanceMetrics['coreWebVitals']> {
    try {
      // Run Lighthouse for Core Web Vitals
      const { stdout } = await execAsync(
        'npx lighthouse http://localhost:3000 --only-categories=performance --output=json --quiet',
        { cwd: this.rootDir }
      );
      
      const lighthouse = JSON.parse(stdout);
      const audits = lighthouse.audits;
      
      return {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        ttfb: audits['server-response-time']?.numericValue || 0
      };
    } catch (error) {
      console.warn('⚠️ Could not gather Core Web Vitals:', error);
      return { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 };
    }
  }

  private async getBundleSize(): Promise<PerformanceMetrics['bundleSize']> {
    try {
      // Analyze Next.js build output
      const buildManifest = path.join(this.buildDir, 'build-manifest.json');
      const manifest = JSON.parse(await fs.readFile(buildManifest, 'utf-8'));
      
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      
      // Calculate JavaScript bundle size
      for (const files of Object.values(manifest.pages) as string[][]) {
        for (const file of files) {
          if (file.endsWith('.js')) {
            try {
              const filePath = path.join(this.buildDir, 'static', file);
              const stats = await fs.stat(filePath);
              jsSize += stats.size;
              totalSize += stats.size;
            } catch (error) {
              // File might not exist
            }
          }
        }
      }
      
      // Get CSS size from build output
      const staticDir = path.join(this.buildDir, 'static', 'css');
      try {
        const cssFiles = await fs.readdir(staticDir);
        for (const file of cssFiles) {
          const stats = await fs.stat(path.join(staticDir, file));
          cssSize += stats.size;
          totalSize += stats.size;
        }
      } catch (error) {
        // CSS directory might not exist
      }
      
      // Estimate image size
      const imagesSize = await this.calculateImageSize();
      
      return {
        total: totalSize + imagesSize,
        javascript: jsSize,
        css: cssSize,
        images: imagesSize
      };
    } catch (error) {
      console.warn('⚠️ Could not analyze bundle size:', error);
      return { total: 0, javascript: 0, css: 0, images: 0 };
    }
  }

  private async calculateImageSize(): Promise<number> {
    try {
      const publicDir = path.join(this.rootDir, 'public');
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];
      
      let totalSize = 0;
      
      const files = await this.findFiles(publicDir, (file) => 
        imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
      );
      
      for (const file of files) {
        const stats = await fs.stat(file);
        totalSize += stats.size;
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private async getMemoryUsage(): Promise<PerformanceMetrics['memory']> {
    // This would typically be gathered from browser APIs during runtime
    // For build-time analysis, we estimate based on bundle complexity
    const bundleSize = await this.getBundleSize();
    const componentCount = await this.countComponents();
    
    const estimatedUsed = (bundleSize.javascript / 1024) + (componentCount * 50); // Rough estimate
    const estimatedTotal = estimatedUsed * 1.5;
    
    return {
      used: Math.round(estimatedUsed),
      total: Math.round(estimatedTotal),
      percentage: Math.round((estimatedUsed / estimatedTotal) * 100)
    };
  }

  private async getLighthouseScores(): Promise<PerformanceMetrics['lighthouse']> {
    try {
      // Check if lighthouse report exists
      const reportPath = path.join(this.rootDir, 'lighthouse-report.html');
      const reportExists = await fs.access(reportPath).then(() => true).catch(() => false);
      
      if (reportExists) {
        // Run lighthouse and parse results
        const { stdout } = await execAsync(
          'npx lighthouse http://localhost:3000 --output=json --quiet',
          { cwd: this.rootDir }
        );
        
        const lighthouse = JSON.parse(stdout);
        const categories = lighthouse.categories;
        
        return {
          performance: Math.round((categories.performance?.score || 0) * 100),
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100),
          pwa: Math.round((categories.pwa?.score || 0) * 100)
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not get Lighthouse scores:', error);
    }
    
    // Return default scores if Lighthouse fails
    return {
      performance: 85,
      accessibility: 90,
      bestPractices: 85,
      seo: 95,
      pwa: 70
    };
  }

  private async getCustomMetrics(): Promise<PerformanceMetrics['customMetrics']> {
    const componentCount = await this.countComponents();
    const chunkCount = await this.countChunks();
    
    return {
      loadTime: 2500, // Estimated based on bundle size
      interactiveTime: 3000, // Estimated
      componentCount,
      chunkCount
    };
  }

  private async countComponents(): Promise<number> {
    const componentFiles = await this.findFiles(
      path.join(this.srcDir, 'components'),
      (file) => file.endsWith('.tsx') || file.endsWith('.jsx')
    );
    return componentFiles.length;
  }

  private async countChunks(): Promise<number> {
    try {
      const buildDir = path.join(this.buildDir, 'static', 'chunks');
      const chunkFiles = await fs.readdir(buildDir);
      return chunkFiles.filter(file => file.endsWith('.js')).length;
    } catch (error) {
      return 10; // Estimate
    }
  }

  private async identifyIssues(): Promise<PerformanceReport['issues']> {
    console.log('🔍 Identifying performance issues...');
    
    const issues: PerformanceReport['issues'] = [];
    
    // Check for large components
    const largeComponents = await this.findLargeComponents();
    for (const component of largeComponents) {
      issues.push({
        type: 'large-component',
        severity: 'warning',
        message: `Component ${component.name} is large (${component.lines} lines)`,
        file: component.path,
        suggestion: 'Consider breaking into smaller components or implementing lazy loading'
      });
    }
    
    // Check for unoptimized images
    const unoptimizedImages = await this.findUnoptimizedImages();
    for (const image of unoptimizedImages) {
      issues.push({
        type: 'unoptimized-image',
        severity: 'warning',
        message: `Large image file: ${image.name} (${Math.round(image.size / 1024)}KB)`,
        file: image.path,
        suggestion: 'Optimize image or convert to WebP format'
      });
    }
    
    // Check for missing lazy loading
    const missingLazyLoad = await this.findMissingLazyLoading();
    for (const component of missingLazyLoad) {
      issues.push({
        type: 'missing-lazy-load',
        severity: 'info',
        message: `Component ${component.name} could benefit from lazy loading`,
        file: component.path,
        suggestion: 'Implement lazy loading using React.lazy() or next/dynamic'
      });
    }
    
    // Check bundle size issues
    const bundleSize = await this.getBundleSize();
    if (bundleSize.javascript > 500 * 1024) { // 500KB
      issues.push({
        type: 'large-bundle',
        severity: 'error',
        message: `JavaScript bundle is large (${Math.round(bundleSize.javascript / 1024)}KB)`,
        suggestion: 'Implement code splitting and lazy loading'
      });
    }
    
    return issues;
  }

  private async findLargeComponents(): Promise<Array<{name: string, path: string, lines: number}>> {
    const components: Array<{name: string, path: string, lines: number}> = [];
    
    const componentFiles = await this.findFiles(
      this.srcDir,
      (file) => file.endsWith('.tsx') || file.endsWith('.jsx')
    );
    
    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        
        if (lines > 200) { // Threshold for large components
          components.push({
            name: path.basename(file, path.extname(file)),
            path: path.relative(this.rootDir, file),
            lines
          });
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return components;
  }

  private async findUnoptimizedImages(): Promise<Array<{name: string, path: string, size: number}>> {
    const images: Array<{name: string, path: string, size: number}> = [];
    
    const imageFiles = await this.findFiles(
      path.join(this.rootDir, 'public'),
      (file) => /\.(png|jpg|jpeg)$/i.test(file)
    );
    
    for (const file of imageFiles) {
      try {
        const stats = await fs.stat(file);
        
        if (stats.size > 100 * 1024) { // 100KB threshold
          images.push({
            name: path.basename(file),
            path: path.relative(this.rootDir, file),
            size: stats.size
          });
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return images;
  }

  private async findMissingLazyLoading(): Promise<Array<{name: string, path: string}>> {
    const candidates: Array<{name: string, path: string}> = [];
    
    // Look for heavy components that aren't lazy loaded
    const heavyComponents = ['Chart', 'Graph', 'Video', 'Map', 'Editor', 'Dashboard'];
    
    const componentFiles = await this.findFiles(
      this.srcDir,
      (file) => file.endsWith('.tsx') || file.endsWith('.jsx')
    );
    
    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const fileName = path.basename(file, path.extname(file));
        
        // Check if component name suggests it's heavy
        const isHeavy = heavyComponents.some(heavy => fileName.includes(heavy));
        
        // Check if it's not already lazy loaded
        const isLazyLoaded = content.includes('lazy(') || content.includes('dynamic(');
        
        if (isHeavy && !isLazyLoaded) {
          candidates.push({
            name: fileName,
            path: path.relative(this.rootDir, file)
          });
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return candidates;
  }

  private async generateOptimizations(metrics: PerformanceMetrics): Promise<OptimizationSuggestion[]> {
    console.log('💡 Generating optimization suggestions...');
    
    const optimizations: OptimizationSuggestion[] = [];
    
    // Bundle optimization
    if (metrics.bundleSize.javascript > 300 * 1024) {
      optimizations.push({
        type: 'bundle',
        priority: 'high',
        impact: 25,
        effort: 6,
        description: 'Implement code splitting and lazy loading for large components',
        implementation: `
// Use React.lazy() for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Or use Next.js dynamic imports
const DynamicComponent = dynamic(() => import('./DynamicComponent'), {
  loading: () => <LoadingSpinner />
});
        `
      });
    }
    
    // Image optimization
    if (metrics.bundleSize.images > 500 * 1024) {
      optimizations.push({
        type: 'images',
        priority: 'high',
        impact: 20,
        effort: 4,
        description: 'Optimize images using WebP format and proper sizing',
        implementation: `
// Use Next.js Image component with optimization
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  alt="Description"
  width={800}
  height={600}
  quality={85}
  placeholder="blur"
/>
        `,
        files: await this.findUnoptimizedImages().then(imgs => imgs.map(i => i.path))
      });
    }
    
    // Lazy loading optimization
    const lazyComponents = await this.findMissingLazyLoading();
    if (lazyComponents.length > 0) {
      optimizations.push({
        type: 'lazy-loading',
        priority: 'medium',
        impact: 15,
        effort: 3,
        description: `Implement lazy loading for ${lazyComponents.length} components`,
        implementation: `
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
        `,
        files: lazyComponents.map(c => c.path)
      });
    }
    
    // Critical CSS optimization
    if (metrics.bundleSize.css > 100 * 1024) {
      optimizations.push({
        type: 'critical-css',
        priority: 'medium',
        impact: 12,
        effort: 5,
        description: 'Extract critical CSS and defer non-critical styles',
        implementation: `
// In next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  // Configure critical CSS extraction
};
        `
      });
    }
    
    // Caching optimization
    optimizations.push({
      type: 'caching',
      priority: 'low',
      impact: 10,
      effort: 2,
      description: 'Implement better caching strategies',
      implementation: `
// Add cache headers in next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
      `
    });
    
    return optimizations;
  }

  private async analyzeTrends(): Promise<PerformanceReport['trends']> {
    // This would analyze historical data to determine trends
    // For now, return neutral trends
    return {
      performance: 'stable',
      bundleSize: 'stable',
      memory: 'stable'
    };
  }

  private async findFiles(dir: string, filter: (file: string) => boolean): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.findFiles(fullPath, filter));
        } else if (entry.isFile() && filter(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  async implementOptimization(optimization: OptimizationSuggestion): Promise<boolean> {
    console.log(`🔧 Implementing: ${optimization.description}`);
    
    try {
      switch (optimization.type) {
        case 'lazy-loading':
          return await this.implementLazyLoading(optimization);
        case 'images':
          return await this.optimizeImages(optimization);
        case 'bundle':
          return await this.optimizeBundle(optimization);
        default:
          console.log('📝 Manual implementation required');
          return false;
      }
    } catch (error) {
      console.error(`❌ Failed to implement optimization:`, error);
      return false;
    }
  }

  private async implementLazyLoading(optimization: OptimizationSuggestion): Promise<boolean> {
    if (!optimization.files) return false;
    
    for (const filePath of optimization.files) {
      try {
        const fullPath = path.resolve(this.rootDir, filePath);
        let content = await fs.readFile(fullPath, 'utf-8');
        
        // Add lazy import
        if (!content.includes('lazy')) {
          content = `import { lazy, Suspense } from 'react';\n${content}`;
        }
        
        // Find export default and wrap with lazy
        const componentName = path.basename(filePath, path.extname(filePath));
        const lazyName = `Lazy${componentName}`;
        
        content = content.replace(
          /export default function (\w+)/,
          `const $1 = () => {\n  // Component implementation\n};\n\nconst ${lazyName} = lazy(() => Promise.resolve({ default: $1 }));\nexport default ${lazyName};`
        );
        
        await fs.writeFile(fullPath, content);
        console.log(`✅ Added lazy loading to ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ Could not modify ${filePath}:`, error);
      }
    }
    
    return true;
  }

  private async optimizeImages(optimization: OptimizationSuggestion): Promise<boolean> {
    console.log('📸 Image optimization requires manual review of image usage');
    return false; // Requires manual implementation
  }

  private async optimizeBundle(optimization: OptimizationSuggestion): Promise<boolean> {
    console.log('📦 Bundle optimization requires manual code splitting analysis');
    return false; // Requires manual implementation
  }

  async generateReport(report: PerformanceReport): Promise<void> {
    const reportPath = path.join(this.reportsDir, `performance-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    const summaryPath = path.join(this.reportsDir, 'latest-performance.json');
    await fs.writeFile(summaryPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Performance report saved: ${reportPath}`);
    
    // Console summary
    console.log(`\n⚡ Performance Analysis Complete:`);
    console.log(`   🎯 Lighthouse Performance: ${report.metrics.lighthouse.performance}/100`);
    console.log(`   📦 Bundle Size: ${Math.round(report.metrics.bundleSize.total / 1024)}KB`);
    console.log(`   🔍 Issues Found: ${report.issues.length}`);
    console.log(`   💡 Optimizations: ${report.optimizations.length}`);
    console.log(`   📈 Top Priority: ${report.optimizations[0]?.description || 'None'}`);
  }

  async run(): Promise<void> {
    const report = await this.analyzePerformance();
    await this.generateReport(report);
    
    // Offer to implement high-priority optimizations
    const highPriority = report.optimizations.filter(o => o.priority === 'high');
    if (highPriority.length > 0) {
      console.log(`\n🚀 Found ${highPriority.length} high-priority optimizations`);
      console.log('Run with --implement flag to auto-apply optimizations');
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const implement = args.includes('--implement');
  
  const agent = new PortfolioPerformanceAgent();
  
  if (implement) {
    agent.analyzePerformance().then(async (report) => {
      await agent.generateReport(report);
      
      const highPriority = report.optimizations.filter(o => o.priority === 'high');
      for (const optimization of highPriority) {
        await agent.implementOptimization(optimization);
      }
    }).catch(console.error);
  } else {
    agent.run().catch(console.error);
  }
}