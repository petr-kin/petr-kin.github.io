#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

const LIGHTHOUSE_CONFIG = {
  // Core Web Vitals thresholds
  thresholds: {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'first-input-delay': 100,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 200,
    'speed-index': 3000,
    'time-to-interactive': 3800,
    'performance': 90,
    'accessibility': 95,
    'best-practices': 90,
    'seo': 95
  },
  
  // Multiple test scenarios
  scenarios: [
    {
      name: 'Desktop - Homepage',
      url: 'http://localhost:3000',
      config: {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop',
          screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
          },
        },
      },
    },
    {
      name: 'Mobile - Homepage',
      url: 'http://localhost:3000',
      config: {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
          },
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
          },
        },
      },
    },
    {
      name: 'Mobile - 3G Slow',
      url: 'http://localhost:3000',
      config: {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'mobile',
          throttling: {
            rttMs: 300,
            throughputKbps: 400,
            requestLatencyMs: 300,
            downloadThroughputKbps: 400,
            uploadThroughputKbps: 400,
            cpuSlowdownMultiplier: 4,
          },
        },
      },
    },
  ],
};

async function launchChrome() {
  return await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
      '--deterministic-fetch',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
    ],
  });
}

async function runLighthouse(url, config, chrome) {
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options, config);
  return runnerResult;
}

function extractMetrics(lhr) {
  const audits = lhr.audits;
  const categories = lhr.categories;

  return {
    scores: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    },
    vitals: {
      'first-contentful-paint': audits['first-contentful-paint']?.displayValue,
      'largest-contentful-paint': audits['largest-contentful-paint']?.displayValue,
      'total-blocking-time': audits['total-blocking-time']?.displayValue,
      'cumulative-layout-shift': audits['cumulative-layout-shift']?.displayValue,
      'speed-index': audits['speed-index']?.displayValue,
      'time-to-interactive': audits['interactive']?.displayValue,
    },
    opportunities: audits['diagnostics'] ? Object.keys(audits)
      .filter(key => audits[key].details && audits[key].details.type === 'opportunity')
      .map(key => ({
        audit: key,
        title: audits[key].title,
        description: audits[key].description,
        score: audits[key].score,
        displayValue: audits[key].displayValue,
      }))
      .filter(opp => opp.score < 1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10) : [],
    diagnostics: Object.keys(audits)
      .filter(key => audits[key].details && audits[key].details.type === 'table')
      .map(key => ({
        audit: key,
        title: audits[key].title,
        score: audits[key].score,
        displayValue: audits[key].displayValue,
      }))
      .filter(diag => diag.score !== null && diag.score < 1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5),
  };
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  let report = `# Lighthouse Performance Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;

  results.forEach((result, index) => {
    const scenario = LIGHTHOUSE_CONFIG.scenarios[index];
    report += `## ${scenario.name}\n\n`;
    
    report += `### Scores\n`;
    report += `- **Performance:** ${result.metrics.scores.performance}/100\n`;
    report += `- **Accessibility:** ${result.metrics.scores.accessibility}/100\n`;
    report += `- **Best Practices:** ${result.metrics.scores.bestPractices}/100\n`;
    report += `- **SEO:** ${result.metrics.scores.seo}/100\n\n`;

    report += `### Core Web Vitals\n`;
    Object.entries(result.metrics.vitals).forEach(([key, value]) => {
      if (value) {
        const threshold = LIGHTHOUSE_CONFIG.thresholds[key];
        const status = threshold ? getVitalStatus(key, value, threshold) : '';
        report += `- **${formatVitalName(key)}:** ${value} ${status}\n`;
      }
    });
    report += '\n';

    if (result.metrics.opportunities.length > 0) {
      report += `### Top Optimization Opportunities\n`;
      result.metrics.opportunities.slice(0, 5).forEach(opp => {
        report += `- **${opp.title}** (Score: ${Math.round(opp.score * 100)}/100)\n`;
        report += `  ${opp.description}\n`;
        if (opp.displayValue) report += `  Impact: ${opp.displayValue}\n`;
        report += '\n';
      });
    }

    report += `---\n\n`;
  });

  return report;
}

function getVitalStatus(key, value, threshold) {
  const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (key === 'cumulative-layout-shift') {
    return numValue <= threshold ? '✅ Good' : numValue <= 0.25 ? '⚠️ Needs Improvement' : '❌ Poor';
  }
  return numValue <= threshold ? '✅ Good' : '⚠️ Needs Improvement';
}

function formatVitalName(key) {
  return key.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

async function checkThresholds(results) {
  let passing = true;
  const failures = [];

  results.forEach((result, index) => {
    const scenario = LIGHTHOUSE_CONFIG.scenarios[index];
    const scores = result.metrics.scores;

    Object.entries(LIGHTHOUSE_CONFIG.thresholds).forEach(([key, threshold]) => {
      if (key === 'performance' && scores.performance < threshold) {
        passing = false;
        failures.push(`${scenario.name}: Performance score ${scores.performance} below threshold ${threshold}`);
      } else if (key === 'accessibility' && scores.accessibility < threshold) {
        passing = false;
        failures.push(`${scenario.name}: Accessibility score ${scores.accessibility} below threshold ${threshold}`);
      } else if (key === 'best-practices' && scores.bestPractices < threshold) {
        passing = false;
        failures.push(`${scenario.name}: Best Practices score ${scores.bestPractices} below threshold ${threshold}`);
      } else if (key === 'seo' && scores.seo < threshold) {
        passing = false;
        failures.push(`${scenario.name}: SEO score ${scores.seo} below threshold ${threshold}`);
      }
    });
  });

  return { passing, failures };
}

async function main() {
  console.log('🚀 Starting Lighthouse CI tests...\n');

  const chrome = await launchChrome();
  const results = [];
  
  try {
    for (let i = 0; i < LIGHTHOUSE_CONFIG.scenarios.length; i++) {
      const scenario = LIGHTHOUSE_CONFIG.scenarios[i];
      console.log(`📊 Running scenario: ${scenario.name}`);
      
      const result = await runLighthouse(scenario.url, scenario.config, chrome);
      const metrics = extractMetrics(result.lhr);
      
      results.push({
        scenario: scenario.name,
        metrics,
        lhr: result.lhr,
      });

      console.log(`   Performance: ${metrics.scores.performance}/100`);
      console.log(`   Accessibility: ${metrics.scores.accessibility}/100`);
      console.log(`   Best Practices: ${metrics.scores.bestPractices}/100`);
      console.log(`   SEO: ${metrics.scores.seo}/100\n`);
    }

    // Generate reports
    const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
    await fs.mkdir(reportsDir, { recursive: true });

    // Save individual JSON reports
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const fileName = `${result.scenario.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
      await fs.writeFile(
        path.join(reportsDir, fileName),
        JSON.stringify(result.lhr, null, 2)
      );
    }

    // Generate summary report
    const summaryReport = generateReport(results);
    await fs.writeFile(
      path.join(reportsDir, 'lighthouse-summary.md'),
      summaryReport
    );

    // Save aggregated JSON for CI
    const ciReport = {
      timestamp: new Date().toISOString(),
      scenarios: results.map(r => ({
        name: r.scenario,
        scores: r.metrics.scores,
        vitals: r.metrics.vitals,
        opportunities: r.metrics.opportunities,
      })),
    };
    await fs.writeFile(
      path.join(reportsDir, 'lighthouse-ci.json'),
      JSON.stringify(ciReport, null, 2)
    );

    console.log('📋 Reports generated:');
    console.log(`   - Summary: lighthouse-reports/lighthouse-summary.md`);
    console.log(`   - CI Data: lighthouse-reports/lighthouse-ci.json`);
    console.log(`   - Individual JSON reports in lighthouse-reports/`);

    // Check thresholds
    const thresholdResult = await checkThresholds(results);
    
    if (thresholdResult.passing) {
      console.log('\n✅ All Lighthouse tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some Lighthouse tests failed:');
      thresholdResult.failures.forEach(failure => {
        console.log(`   - ${failure}`);
      });
      process.exit(1);
    }

  } catch (error) {
    console.error('Error running Lighthouse:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, LIGHTHOUSE_CONFIG };