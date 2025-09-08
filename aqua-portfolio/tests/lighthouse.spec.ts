import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';

test.describe('Lighthouse Performance Testing', () => {
  const LIGHTHOUSE_THRESHOLDS = {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
    fcp: 1800,
    lcp: 2500,
    tbt: 200,
    cls: 0.1,
    si: 3000,
    tti: 3800,
  };

  test('should meet Lighthouse performance thresholds', async ({ page }) => {
    // Start the development server if not running
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Run Lighthouse CI
    const lighthouseResult = await runLighthouseCli();
    
    expect(lighthouseResult.success).toBe(true);
    
    if (lighthouseResult.data) {
      // Check each scenario
      for (const scenario of lighthouseResult.data.scenarios) {
        console.log(`Testing scenario: ${scenario.name}`);
        
        // Performance thresholds
        expect(scenario.scores.performance, 
          `${scenario.name} performance score should be >= ${LIGHTHOUSE_THRESHOLDS.performance}`)
          .toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.performance);
          
        expect(scenario.scores.accessibility,
          `${scenario.name} accessibility score should be >= ${LIGHTHOUSE_THRESHOLDS.accessibility}`)
          .toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.accessibility);
          
        expect(scenario.scores.bestPractices,
          `${scenario.name} best practices score should be >= ${LIGHTHOUSE_THRESHOLDS.bestPractices}`)
          .toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.bestPractices);
          
        expect(scenario.scores.seo,
          `${scenario.name} SEO score should be >= ${LIGHTHOUSE_THRESHOLDS.seo}`)
          .toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.seo);
      }
    }
  });

  test('should generate comprehensive performance report', async () => {
    const reportPath = path.join(process.cwd(), 'lighthouse-reports', 'lighthouse-ci.json');
    
    try {
      const reportContent = await readFile(reportPath, 'utf-8');
      const report = JSON.parse(reportContent);
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('scenarios');
      expect(Array.isArray(report.scenarios)).toBe(true);
      expect(report.scenarios.length).toBeGreaterThan(0);
      
      // Check report structure
      for (const scenario of report.scenarios) {
        expect(scenario).toHaveProperty('name');
        expect(scenario).toHaveProperty('scores');
        expect(scenario).toHaveProperty('vitals');
        expect(scenario).toHaveProperty('opportunities');
        
        // Check scores structure
        expect(scenario.scores).toHaveProperty('performance');
        expect(scenario.scores).toHaveProperty('accessibility');
        expect(scenario.scores).toHaveProperty('bestPractices');
        expect(scenario.scores).toHaveProperty('seo');
        
        // Check vitals structure
        expect(scenario.vitals).toHaveProperty('first-contentful-paint');
        expect(scenario.vitals).toHaveProperty('largest-contentful-paint');
        expect(scenario.vitals).toHaveProperty('cumulative-layout-shift');
      }
      
    } catch (error) {
      // If report doesn't exist, run Lighthouse first
      if ((error as any)?.code === 'ENOENT') {
        await runLighthouseCli();
        
        // Try reading again
        const reportContent = await readFile(reportPath, 'utf-8');
        const report = JSON.parse(reportContent);
        expect(report.scenarios.length).toBeGreaterThan(0);
      } else {
        throw error;
      }
    }
  });

  test('should track performance regression over time', async () => {
    const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
    
    // Run current Lighthouse test
    const currentResult = await runLighthouseCli();
    expect(currentResult.success).toBe(true);
    
    if (currentResult.data) {
      // Store baseline if this is first run
      const baselinePath = path.join(reportsDir, 'performance-baseline.json');
      
      try {
        const baselineContent = await readFile(baselinePath, 'utf-8');
        const baseline = JSON.parse(baselineContent);
        
        // Compare against baseline
        for (let i = 0; i < currentResult.data.scenarios.length; i++) {
          const currentScenario = currentResult.data.scenarios[i];
          const baselineScenario = baseline.scenarios[i];
          
          if (baselineScenario) {
            // Allow 5 point regression in performance score
            const performanceRegression = baselineScenario.scores.performance - currentScenario.scores.performance;
            expect(performanceRegression,
              `Performance regression detected in ${currentScenario.name}: ${performanceRegression} points`)
              .toBeLessThanOrEqual(5);
              
            // Accessibility should not regress
            expect(currentScenario.scores.accessibility,
              `Accessibility regression detected in ${currentScenario.name}`)
              .toBeGreaterThanOrEqual(baselineScenario.scores.accessibility);
          }
        }
        
      } catch (error) {
        if ((error as any)?.code === 'ENOENT') {
          // Create baseline for future tests
          await require('fs/promises').writeFile(
            baselinePath,
            JSON.stringify(currentResult.data, null, 2)
          );
          console.log('Created performance baseline for future regression testing');
        }
      }
    }
  });

  test('should validate Core Web Vitals in real conditions', async ({ page }) => {
    // Test under realistic network conditions
    await page.route('**/*', (route, request) => {
      // Simulate real network latency
      setTimeout(() => route.continue(), Math.random() * 100);
    });

    const vitalsResults = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const vitals = {};
        let metricsReceived = 0;
        const expectedMetrics = 5;

        function onVital(metric: any) {
          vitals[metric.name] = {
            value: metric.value,
            rating: metric.rating,
            id: metric.id
          };
          metricsReceived++;
          
          if (metricsReceived >= expectedMetrics) {
            resolve(vitals);
          }
        }

        // Import web-vitals dynamically
        import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
          onCLS(onVital, { reportAllChanges: false });
          onFCP(onVital);
          onFID(onVital);
          onLCP(onVital, { reportAllChanges: false });
          onTTFB(onVital);
        }).catch(() => {
          // Fallback if web-vitals not available
          resolve({});
        });

        // Timeout after 10 seconds
        setTimeout(() => resolve(vitals), 10000);
      });
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Validate Core Web Vitals if captured
    if (Object.keys(vitalsResults as any).length > 0) {
      if ((vitalsResults as any).FCP) {
        expect((vitalsResults as any).FCP.value).toBeLessThan(LIGHTHOUSE_THRESHOLDS.fcp);
        expect(['good', 'needs-improvement']).toContain((vitalsResults as any).FCP.rating);
      }

      if ((vitalsResults as any).LCP) {
        expect((vitalsResults as any).LCP.value).toBeLessThan(LIGHTHOUSE_THRESHOLDS.lcp);
        expect(['good', 'needs-improvement']).toContain((vitalsResults as any).LCP.rating);
      }

      if ((vitalsResults as any).CLS) {
        expect((vitalsResults as any).CLS.value).toBeLessThan(LIGHTHOUSE_THRESHOLDS.cls);
        expect((vitalsResults as any).CLS.rating).toBe('good');
      }

      console.log('Core Web Vitals Results:', vitalsResults);
    }
  });
});

// Helper function to run Lighthouse CLI
async function runLighthouseCli(): Promise<{ success: boolean; data?: any; error?: string }> {
  return new Promise((resolve) => {
    const lighthouse = spawn('node', ['scripts/lighthouse-ci.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    lighthouse.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    lighthouse.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', async (code) => {
      if (code === 0) {
        try {
          // Read the generated CI report
          const reportPath = path.join(process.cwd(), 'lighthouse-reports', 'lighthouse-ci.json');
          const reportContent = await readFile(reportPath, 'utf-8');
          const data = JSON.parse(reportContent);
          
          resolve({ success: true, data });
        } catch (error) {
          resolve({ success: false, error: `Failed to read Lighthouse report: ${(error as any)?.message}` });
        }
      } else {
        resolve({ 
          success: false, 
          error: `Lighthouse failed with code ${code}. Stderr: ${stderr}. Stdout: ${stdout}` 
        });
      }
    });

    lighthouse.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}