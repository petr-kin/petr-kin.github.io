#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      network: [],
      bundle: {},
      vitals: [],
      timestamps: []
    };
    this.baselineFile = path.join(process.cwd(), 'performance-baseline.json');
    this.reportsDir = path.join(process.cwd(), 'performance-reports');
  }

  async initialize() {
    await fs.mkdir(this.reportsDir, { recursive: true });
    this.startTime = performance.now();
    console.log('🚀 Performance Monitor initialized');
  }

  // Memory usage tracking
  recordMemoryUsage(label = 'default') {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory;
      this.metrics.memory.push({
        timestamp: Date.now(),
        label,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      });
    } else {
      // Node.js environment
      const memUsage = process.memoryUsage();
      this.metrics.memory.push({
        timestamp: Date.now(),
        label,
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      });
    }
  }

  // Bundle size analysis
  async analyzeBundleSize() {
    try {
      const buildDir = path.join(process.cwd(), '.next');
      const analyzeFile = path.join(buildDir, 'analyze-bundle.json');
      
      // Check if bundle analysis exists
      try {
        const bundleData = await fs.readFile(analyzeFile, 'utf-8');
        const analysis = JSON.parse(bundleData);
        
        this.metrics.bundle = {
          timestamp: Date.now(),
          totalSize: analysis.totalSize || 0,
          chunkSizes: analysis.chunks || [],
          largestChunks: this.getLargestChunks(analysis.chunks || []),
          duplicatedModules: analysis.duplicated || [],
          unusedModules: analysis.unused || []
        };
        
        console.log('📊 Bundle analysis completed');
        return this.metrics.bundle;
      } catch (error) {
        console.warn('⚠️ Bundle analysis file not found, running build analyzer...');
        return await this.runBundleAnalyzer();
      }
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      return null;
    }
  }

  async runBundleAnalyzer() {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const analyzer = spawn('npm', ['run', 'analyze'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      analyzer.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      analyzer.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      analyzer.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Bundle analysis completed');
          resolve({ success: true, output: stdout });
        } else {
          reject(new Error(`Bundle analysis failed: ${stderr}`));
        }
      });
    });
  }

  getLargestChunks(chunks, limit = 10) {
    return chunks
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, limit)
      .map(chunk => ({
        name: chunk.name || 'unknown',
        size: chunk.size || 0,
        sizeFormatted: this.formatBytes(chunk.size || 0)
      }));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Performance timing measurement
  startTiming(label) {
    const id = `${label}-${Date.now()}`;
    performance.mark(`${id}-start`);
    return id;
  }

  endTiming(id) {
    performance.mark(`${id}-end`);
    performance.measure(id, `${id}-start`, `${id}-end`);
    
    const measure = performance.getEntriesByName(id)[0];
    const timing = {
      id,
      duration: measure.duration,
      timestamp: Date.now()
    };
    
    this.metrics.timestamps.push(timing);
    
    // Clean up marks
    performance.clearMarks(`${id}-start`);
    performance.clearMarks(`${id}-end`);
    performance.clearMeasures(id);
    
    return timing;
  }

  // Network performance tracking
  recordNetworkMetrics(requests = []) {
    const networkMetrics = {
      timestamp: Date.now(),
      totalRequests: requests.length,
      totalTransferSize: requests.reduce((sum, req) => sum + (req.transferSize || 0), 0),
      averageResponseTime: requests.length > 0 
        ? requests.reduce((sum, req) => sum + (req.responseTime || 0), 0) / requests.length 
        : 0,
      slowestRequest: requests.reduce((slowest, req) => 
        (req.responseTime || 0) > (slowest.responseTime || 0) ? req : slowest, {}),
      failedRequests: requests.filter(req => req.status >= 400).length,
      cachedRequests: requests.filter(req => req.cached).length
    };
    
    this.metrics.network.push(networkMetrics);
    return networkMetrics;
  }

  // Core Web Vitals integration
  recordWebVital(name, value, rating, id) {
    this.metrics.vitals.push({
      name,
      value,
      rating,
      id,
      timestamp: Date.now()
    });
    
    console.log(`📈 Web Vital recorded: ${name} = ${value} (${rating})`);
  }

  // Generate performance report
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: performance.now() - this.startTime,
      summary: this.generateSummary(),
      metrics: {
        memory: this.metrics.memory,
        timing: this.metrics.timestamps,
        network: this.metrics.network,
        bundle: this.metrics.bundle,
        vitals: this.metrics.vitals
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(
      this.reportsDir, 
      `performance-report-${Date.now()}.json`
    );
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(
      this.reportsDir,
      `performance-summary-${Date.now()}.md`
    );
    
    await fs.writeFile(markdownPath, markdownReport);
    
    console.log('📋 Performance reports generated:');
    console.log(`   - JSON: ${reportPath}`);
    console.log(`   - Summary: ${markdownPath}`);
    
    return report;
  }

  generateSummary() {
    const memoryPeak = Math.max(...this.metrics.memory.map(m => m.heapUsed || m.usedJSHeapSize || 0));
    const avgTiming = this.metrics.timestamps.length > 0 
      ? this.metrics.timestamps.reduce((sum, t) => sum + t.duration, 0) / this.metrics.timestamps.length
      : 0;
    const networkTotal = this.metrics.network.reduce((sum, n) => sum + n.totalTransferSize, 0);
    
    return {
      peakMemoryUsage: this.formatBytes(memoryPeak),
      averageOperationTime: `${avgTiming.toFixed(2)}ms`,
      totalNetworkTransfer: this.formatBytes(networkTotal),
      webVitalsCount: this.metrics.vitals.length,
      bundleSize: this.metrics.bundle.totalSize ? this.formatBytes(this.metrics.bundle.totalSize) : 'N/A'
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Memory recommendations
    const memoryPeak = Math.max(...this.metrics.memory.map(m => m.heapUsed || m.usedJSHeapSize || 0));
    if (memoryPeak > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        category: 'Memory',
        severity: 'high',
        message: 'High memory usage detected. Consider implementing lazy loading or reducing bundle size.',
        metric: this.formatBytes(memoryPeak)
      });
    }
    
    // Bundle size recommendations
    if (this.metrics.bundle.totalSize > 1024 * 1024) { // 1MB
      recommendations.push({
        category: 'Bundle Size',
        severity: 'medium',
        message: 'Large bundle size detected. Consider code splitting and tree shaking.',
        metric: this.formatBytes(this.metrics.bundle.totalSize)
      });
    }
    
    // Web Vitals recommendations
    const poorVitals = this.metrics.vitals.filter(v => v.rating === 'poor');
    if (poorVitals.length > 0) {
      recommendations.push({
        category: 'Core Web Vitals',
        severity: 'high',
        message: `${poorVitals.length} Core Web Vitals metrics need improvement.`,
        details: poorVitals.map(v => `${v.name}: ${v.value}`)
      });
    }
    
    return recommendations;
  }

  generateMarkdownReport(report) {
    return `# Performance Report

**Generated:** ${report.timestamp}
**Duration:** ${(report.duration / 1000).toFixed(2)}s

## Summary

- **Peak Memory Usage:** ${report.summary.peakMemoryUsage}
- **Average Operation Time:** ${report.summary.averageOperationTime}  
- **Total Network Transfer:** ${report.summary.totalNetworkTransfer}
- **Web Vitals Recorded:** ${report.summary.webVitalsCount}
- **Bundle Size:** ${report.summary.bundleSize}

## Recommendations

${report.recommendations.map(rec => 
  `### ${rec.category} (${rec.severity.toUpperCase()})\n${rec.message}\n${rec.metric ? `**Metric:** ${rec.metric}` : ''}\n`
).join('\n')}

## Core Web Vitals

${report.metrics.vitals.map(vital => 
  `- **${vital.name}:** ${vital.value} (${vital.rating})`
).join('\n')}

## Memory Usage Trend

${report.metrics.memory.length > 0 ? 
  `Peak: ${this.formatBytes(Math.max(...report.metrics.memory.map(m => m.heapUsed || m.usedJSHeapSize || 0)))}` :
  'No memory data recorded'
}

---
*Report generated by Performance Monitor*
`;
  }

  // Compare against baseline
  async compareToBaseline(currentMetrics) {
    try {
      const baselineData = await fs.readFile(this.baselineFile, 'utf-8');
      const baseline = JSON.parse(baselineData);
      
      const comparison = {
        memoryDelta: this.calculateMemoryDelta(baseline.memory, currentMetrics.memory),
        bundleSizeDelta: this.calculateBundleDelta(baseline.bundle, currentMetrics.bundle),
        vitalsDelta: this.calculateVitalsDelta(baseline.vitals, currentMetrics.vitals)
      };
      
      return comparison;
    } catch (error) {
      // Create baseline if it doesn't exist
      await this.saveBaseline(currentMetrics);
      return { message: 'Baseline created for future comparisons' };
    }
  }

  async saveBaseline(metrics) {
    const baseline = {
      timestamp: Date.now(),
      memory: metrics.memory,
      bundle: metrics.bundle,
      vitals: metrics.vitals
    };
    
    await fs.writeFile(this.baselineFile, JSON.stringify(baseline, null, 2));
    console.log('💾 Performance baseline saved');
  }

  calculateMemoryDelta(baseline, current) {
    if (!baseline || !current || baseline.length === 0 || current.length === 0) {
      return { message: 'Insufficient data for comparison' };
    }
    
    const baselinePeak = Math.max(...baseline.map(m => m.heapUsed || m.usedJSHeapSize || 0));
    const currentPeak = Math.max(...current.map(m => m.heapUsed || m.usedJSHeapSize || 0));
    
    return {
      baseline: this.formatBytes(baselinePeak),
      current: this.formatBytes(currentPeak),
      delta: this.formatBytes(currentPeak - baselinePeak),
      percentChange: ((currentPeak - baselinePeak) / baselinePeak * 100).toFixed(2) + '%'
    };
  }

  calculateBundleDelta(baseline, current) {
    if (!baseline || !current) {
      return { message: 'Bundle data not available' };
    }
    
    const baselineSize = baseline.totalSize || 0;
    const currentSize = current.totalSize || 0;
    
    return {
      baseline: this.formatBytes(baselineSize),
      current: this.formatBytes(currentSize),
      delta: this.formatBytes(currentSize - baselineSize),
      percentChange: baselineSize > 0 
        ? ((currentSize - baselineSize) / baselineSize * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  calculateVitalsDelta(baseline, current) {
    const deltas = {};
    const vitalTypes = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'];
    
    vitalTypes.forEach(type => {
      const baselineVital = baseline.find(v => v.name === type);
      const currentVital = current.find(v => v.name === type);
      
      if (baselineVital && currentVital) {
        deltas[type] = {
          baseline: baselineVital.value,
          current: currentVital.value,
          delta: currentVital.value - baselineVital.value,
          ratingImproved: this.isRatingBetter(currentVital.rating, baselineVital.rating)
        };
      }
    });
    
    return deltas;
  }

  isRatingBetter(current, baseline) {
    const ratings = { good: 3, 'needs-improvement': 2, poor: 1 };
    return (ratings[current] || 0) > (ratings[baseline] || 0);
  }
}

// CLI interface
if (require.main === module) {
  async function main() {
    const monitor = new PerformanceMonitor();
    await monitor.initialize();
    
    // Simulate some operations for demo
    monitor.recordMemoryUsage('initialization');
    
    const timingId = monitor.startTiming('bundle-analysis');
    await monitor.analyzeBundleSize();
    monitor.endTiming(timingId);
    
    monitor.recordMemoryUsage('post-analysis');
    
    // Generate report
    const report = await monitor.generateReport();
    
    // Compare to baseline
    const comparison = await monitor.compareToBaseline(report.metrics);
    console.log('📊 Baseline comparison:', comparison);
    
    console.log('✅ Performance monitoring completed');
  }
  
  main().catch(console.error);
}

module.exports = PerformanceMonitor;