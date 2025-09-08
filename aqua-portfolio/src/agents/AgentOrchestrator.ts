#!/usr/bin/env ts-node

/**
 * Agent Orchestrator - Coordinates and manages all portfolio agents
 * Master controller for the entire agent ecosystem
 */

import { CodeFixAgent } from './CodeFixAgent';
import { ForgottenFeaturesAgent } from './ForgottenFeaturesAgent';
import { BackupDetectionAgent } from './BackupDetectionAgent';
import { PortfolioPerformanceAgent } from './PortfolioPerformanceAgent';
import { promises as fs } from 'fs';
import * as path from 'path';

interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  duration?: number;
  issues?: number;
  fixes?: number;
  error?: string;
}

interface OrchestrationConfig {
  agents: {
    codefix: boolean;
    forgotten: boolean;
    backup: boolean;
    performance: boolean;
    typography: boolean;
    content: boolean;
    store: boolean;
    component: boolean;
    mcp: boolean;
    playwright: boolean;
  };
  schedule?: 'ondemand' | 'daily' | 'weekly';
  parallel?: boolean;
  reportFormat?: 'json' | 'html' | 'markdown';
}

interface GlobalReport {
  timestamp: string;
  summary: {
    totalAgents: number;
    successful: number;
    failed: number;
    totalIssues: number;
    totalFixes: number;
    duration: number;
  };
  agents: AgentStatus[];
  recommendations: string[];
  nextActions: string[];
}

export class AgentOrchestrator {
  private readonly rootDir: string;
  private readonly reportsDir: string;
  private readonly agents = new Map<string, any>();
  private readonly agentStatuses = new Map<string, AgentStatus>();

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.reportsDir = path.join(rootDir, 'agent-reports');
    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Initialize all available agents
    this.agents.set('codefix', new CodeFixAgent(this.rootDir));
    this.agents.set('forgotten', new ForgottenFeaturesAgent(this.rootDir));
    this.agents.set('backup', new BackupDetectionAgent(this.rootDir));
    this.agents.set('performance', new PortfolioPerformanceAgent(this.rootDir));
    
    // Initialize agent statuses
    for (const [name] of this.agents) {
      this.agentStatuses.set(name, {
        name,
        status: 'idle'
      });
    }
  }

  async runAllAgents(config: Partial<OrchestrationConfig> = {}): Promise<GlobalReport> {
    console.log('🎯 Starting Agent Orchestrator...');
    
    const startTime = Date.now();
    await fs.mkdir(this.reportsDir, { recursive: true });
    
    const defaultConfig: OrchestrationConfig = {
      agents: {
        codefix: true,
        forgotten: true,
        backup: true,
        performance: true,
        typography: true,
        content: false, // Not yet implemented
        store: false,   // Not yet implemented
        component: false, // Not yet implemented
        mcp: false,     // Not yet implemented
        playwright: false // Not yet implemented
      },
      parallel: false,
      reportFormat: 'json'
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    console.log('🔧 Configuration:', finalConfig);
    
    const results: AgentStatus[] = [];
    
    if (finalConfig.parallel) {
      // Run agents in parallel
      const promises = [];
      for (const [agentName, enabled] of Object.entries(finalConfig.agents)) {
        if (enabled && this.agents.has(agentName)) {
          promises.push(this.runAgent(agentName));
        }
      }
      const agentResults = await Promise.allSettled(promises);
      results.push(...agentResults.map((result, index) => 
        result.status === 'fulfilled' ? result.value : this.createFailedStatus(Object.keys(finalConfig.agents)[index], result.reason)
      ));
    } else {
      // Run agents sequentially
      for (const [agentName, enabled] of Object.entries(finalConfig.agents)) {
        if (enabled && this.agents.has(agentName)) {
          try {
            const result = await this.runAgent(agentName);
            results.push(result);
          } catch (error) {
            results.push(this.createFailedStatus(agentName, error));
          }
        }
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Generate global report
    const report: GlobalReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: results.length,
        successful: results.filter(r => r.status === 'completed').length,
        failed: results.filter(r => r.status === 'failed').length,
        totalIssues: results.reduce((sum, r) => sum + (r.issues || 0), 0),
        totalFixes: results.reduce((sum, r) => sum + (r.fixes || 0), 0),
        duration
      },
      agents: results,
      recommendations: this.generateGlobalRecommendations(results),
      nextActions: this.generateNextActions(results)
    };
    
    await this.saveReport(report, finalConfig.reportFormat);
    this.printSummary(report);
    
    return report;
  }

  private async runAgent(agentName: string): Promise<AgentStatus> {
    console.log(`\n🚀 Running ${agentName} agent...`);
    
    const startTime = Date.now();
    const status: AgentStatus = {
      name: agentName,
      status: 'running',
      lastRun: new Date()
    };
    
    this.agentStatuses.set(agentName, status);
    
    try {
      const agent = this.agents.get(agentName);
      let result;
      
      switch (agentName) {
        case 'codefix':
          result = await agent.fixAllIssues();
          status.issues = result.reduce((sum: number, r: any) => sum + r.issuesFound, 0);
          status.fixes = result.reduce((sum: number, r: any) => sum + r.issuesFixed, 0);
          break;
          
        case 'forgotten':
          const features = await agent.findForgottenFeatures();
          const suggestions = await agent.generateIntegrationSuggestions(features);
          await agent.generateReport(features, suggestions);
          status.issues = features.length;
          status.fixes = suggestions.length;
          break;
          
        case 'backup':
          const analyses = await agent.analyzeFiles();
          await agent.generateReport(analyses);
          status.issues = analyses.filter((a: any) => a.type !== 'active').length;
          status.fixes = 0; // Backup detection doesn't auto-fix
          break;
          
        case 'performance':
          const perfReport = await agent.analyzePerformance();
          await agent.generateReport(perfReport);
          status.issues = perfReport.issues.length;
          status.fixes = perfReport.optimizations.length;
          break;
          
        default:
          throw new Error(`Unknown agent: ${agentName}`);
      }
      
      const endTime = Date.now();
      status.duration = endTime - startTime;
      status.status = 'completed';
      
      console.log(`✅ ${agentName} completed in ${status.duration}ms`);
      
    } catch (error) {
      status.status = 'failed';
      status.error = error instanceof Error ? error.message : String(error);
      status.duration = Date.now() - startTime;
      
      console.error(`❌ ${agentName} failed:`, error);
    }
    
    this.agentStatuses.set(agentName, status);
    return status;
  }

  private createFailedStatus(agentName: string, error: any): AgentStatus {
    return {
      name: agentName,
      status: 'failed',
      lastRun: new Date(),
      error: error instanceof Error ? error.message : String(error)
    };
  }

  private generateGlobalRecommendations(results: AgentStatus[]): string[] {
    const recommendations: string[] = [];
    
    const totalIssues = results.reduce((sum, r) => sum + (r.issues || 0), 0);
    const totalFixes = results.reduce((sum, r) => sum + (r.fixes || 0), 0);
    
    if (totalIssues > 50) {
      recommendations.push('High number of issues detected - consider running agents more frequently');
    }
    
    if (totalFixes > 20) {
      recommendations.push('Many fixes were applied - run tests to ensure everything works correctly');
    }
    
    const failedAgents = results.filter(r => r.status === 'failed');
    if (failedAgents.length > 0) {
      recommendations.push(`${failedAgents.length} agents failed - check error logs and dependencies`);
    }
    
    const performanceAgent = results.find(r => r.name === 'performance');
    if (performanceAgent && (performanceAgent.issues || 0) > 5) {
      recommendations.push('Performance issues detected - prioritize optimization tasks');
    }
    
    const codeFixes = results.find(r => r.name === 'codefix');
    if (codeFixes && (codeFixes.fixes || 0) > 10) {
      recommendations.push('Many code fixes applied - review changes and run build/tests');
    }
    
    return recommendations;
  }

  private generateNextActions(results: AgentStatus[]): string[] {
    const actions: string[] = [];
    
    // Check for critical issues that need immediate attention
    const failedAgents = results.filter(r => r.status === 'failed');
    if (failedAgents.length > 0) {
      actions.push(`Fix ${failedAgents.length} failed agents: ${failedAgents.map(a => a.name).join(', ')}`);
    }
    
    // Check if tests need to be run
    const codeFixes = results.find(r => r.name === 'codefix');
    if (codeFixes && (codeFixes.fixes || 0) > 0) {
      actions.push('Run tests to verify code fixes');
    }
    
    // Check for backup cleanup
    const backup = results.find(r => r.name === 'backup');
    if (backup && (backup.issues || 0) > 5) {
      actions.push('Review and clean up backup files');
    }
    
    // Check for forgotten features
    const forgotten = results.find(r => r.name === 'forgotten');
    if (forgotten && (forgotten.issues || 0) > 0) {
      actions.push('Integrate forgotten features or remove unused code');
    }
    
    // Check performance optimizations
    const performance = results.find(r => r.name === 'performance');
    if (performance && (performance.fixes || 0) > 0) {
      actions.push('Implement performance optimizations');
    }
    
    actions.push('Schedule next agent run based on project activity');
    
    return actions;
  }

  private async saveReport(report: GlobalReport, format: 'json' | 'html' | 'markdown' = 'json'): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    switch (format) {
      case 'json':
        const jsonPath = path.join(this.reportsDir, `orchestrator-${timestamp}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
        
        // Also save as latest
        const latestPath = path.join(this.reportsDir, 'latest-orchestrator.json');
        await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
        
        console.log(`📄 Report saved: ${jsonPath}`);
        break;
        
      case 'html':
        const htmlContent = this.generateHTMLReport(report);
        const htmlPath = path.join(this.reportsDir, `orchestrator-${timestamp}.html`);
        await fs.writeFile(htmlPath, htmlContent);
        console.log(`📄 HTML Report saved: ${htmlPath}`);
        break;
        
      case 'markdown':
        const markdownContent = this.generateMarkdownReport(report);
        const mdPath = path.join(this.reportsDir, `orchestrator-${timestamp}.md`);
        await fs.writeFile(mdPath, markdownContent);
        console.log(`📄 Markdown Report saved: ${mdPath}`);
        break;
    }
  }

  private generateHTMLReport(report: GlobalReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Agent Orchestrator Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #28a745; }
        .agent { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
        .status-completed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-running { color: #ffc107; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Agent Orchestrator Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.totalAgents}</div>
            <div>Total Agents</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.successful}</div>
            <div>Successful</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.totalIssues}</div>
            <div>Issues Found</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.totalFixes}</div>
            <div>Fixes Applied</div>
        </div>
    </div>
    
    <h2>Agent Details</h2>
    ${report.agents.map(agent => `
        <div class="agent">
            <h3>${agent.name} <span class="status-${agent.status}">[${agent.status.toUpperCase()}]</span></h3>
            <p><strong>Duration:</strong> ${agent.duration ? `${agent.duration}ms` : 'N/A'}</p>
            <p><strong>Issues:</strong> ${agent.issues || 0} | <strong>Fixes:</strong> ${agent.fixes || 0}</p>
            ${agent.error ? `<p><strong>Error:</strong> ${agent.error}</p>` : ''}
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  }

  private generateMarkdownReport(report: GlobalReport): string {
    return `
# Agent Orchestrator Report

**Generated:** ${report.timestamp}

## Summary

| Metric | Value |
|--------|-------|
| Total Agents | ${report.summary.totalAgents} |
| Successful | ${report.summary.successful} |
| Failed | ${report.summary.failed} |
| Total Issues | ${report.summary.totalIssues} |
| Total Fixes | ${report.summary.totalFixes} |
| Duration | ${Math.round(report.summary.duration / 1000)}s |

## Agent Results

${report.agents.map(agent => `
### ${agent.name} [${agent.status.toUpperCase()}]

- **Duration:** ${agent.duration ? `${agent.duration}ms` : 'N/A'}
- **Issues:** ${agent.issues || 0}
- **Fixes:** ${agent.fixes || 0}
${agent.error ? `- **Error:** ${agent.error}` : ''}
`).join('')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Actions

${report.nextActions.map(action => `- [ ] ${action}`).join('\n')}
    `;
  }

  private printSummary(report: GlobalReport): void {
    console.log(`\n🎯 Agent Orchestrator Complete:`);
    console.log(`   ⏱️  Duration: ${Math.round(report.summary.duration / 1000)}s`);
    console.log(`   🤖 Agents Run: ${report.summary.totalAgents}`);
    console.log(`   ✅ Successful: ${report.summary.successful}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   🔍 Total Issues: ${report.summary.totalIssues}`);
    console.log(`   🔧 Total Fixes: ${report.summary.totalFixes}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Top Recommendations:`);
      report.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    if (report.nextActions.length > 0) {
      console.log(`\n📋 Next Actions:`);
      report.nextActions.slice(0, 3).forEach(action => {
        console.log(`   • ${action}`);
      });
    }
  }

  async runSingleAgent(agentName: string): Promise<AgentStatus> {
    if (!this.agents.has(agentName)) {
      throw new Error(`Agent '${agentName}' not found`);
    }
    
    return await this.runAgent(agentName);
  }

  async getAgentStatus(agentName?: string): Promise<AgentStatus | AgentStatus[]> {
    if (agentName) {
      const status = this.agentStatuses.get(agentName);
      if (!status) {
        throw new Error(`Agent '${agentName}' not found`);
      }
      return status;
    }
    
    return Array.from(this.agentStatuses.values());
  }

  async scheduleAgents(schedule: 'daily' | 'weekly', config: Partial<OrchestrationConfig> = {}): Promise<void> {
    // This would integrate with a job scheduler like node-cron
    console.log(`📅 Scheduling agents to run ${schedule}`);
    console.log('   Note: Implement with node-cron or similar scheduler');
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const orchestrator = new AgentOrchestrator();
  
  if (args.includes('--single')) {
    const agentIndex = args.indexOf('--single');
    const agentName = args[agentIndex + 1];
    if (agentName) {
      orchestrator.runSingleAgent(agentName).catch(console.error);
    } else {
      console.error('Please specify agent name: --single <agent-name>');
    }
  } else if (args.includes('--status')) {
    orchestrator.getAgentStatus().then(statuses => {
      console.table(statuses);
    }).catch(console.error);
  } else {
    const parallel = args.includes('--parallel');
    const format = args.includes('--html') ? 'html' : args.includes('--markdown') ? 'markdown' : 'json';
    
    orchestrator.runAllAgents({ parallel, reportFormat: format }).catch(console.error);
  }
}