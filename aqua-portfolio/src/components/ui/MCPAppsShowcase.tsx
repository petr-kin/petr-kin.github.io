'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AIArchitectureDiagram from './AIArchitectureDiagram'

const mcpApps = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop MCP',
    description: 'Real-time integration with Claude Desktop for interactive test analysis and generation',
    icon: '🤖',
    status: 'Production',
    features: [
      'Live test execution monitoring',
      'Interactive debugging sessions', 
      'Automated report generation',
      'Context-aware suggestions'
    ],
    metrics: {
      responseTime: '< 200ms',
      accuracy: '96%',
      uptime: '99.9%'
    },
    codeExample: `// Claude Desktop MCP Integration
const mcpClient = new MCPClient({
  serverPath: './qa-mcp-server',
  capabilities: ['test-generation', 'bug-analysis', 'report-generation']
});

// Generate tests from user requirements
const tests = await mcpClient.call('generate-tests', {
  component: 'LoginForm',
  requirements: 'Test email validation and password strength',
  framework: 'playwright'
});

// Real-time test execution monitoring
mcpClient.subscribe('test-execution', (event) => {
  console.log(\`Test: \${event.testName} - Status: \${event.status}\`);
});`
  },
  {
    id: 'vscode-extension',
    name: 'VS Code MCP Extension',
    description: 'IDE integration for seamless AI-powered testing workflow within development environment',
    icon: '🔧',
    status: 'Beta',
    features: [
      'Inline test generation',
      'Code coverage analysis',
      'Smart refactoring suggestions',
      'Real-time QA insights'
    ],
    metrics: {
      responseTime: '< 500ms',
      accuracy: '91%',
      uptime: '99.5%'
    },
    codeExample: `// VS Code Extension MCP
import { MCPExtension } from '@qa-tools/vscode-mcp';

class QAMCPExtension extends MCPExtension {
  async generateTestsForSelection() {
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor.document.getText(editor.selection);
    
    const tests = await this.mcp.request('generate-tests', {
      sourceCode: selectedText,
      testType: 'unit',
      framework: this.getPreferredFramework()
    });
    
    // Insert generated tests
    await this.insertAtCursor(tests);
  }
  
  async analyzeCodeCoverage() {
    const coverage = await this.mcp.request('analyze-coverage', {
      projectPath: vscode.workspace.rootPath
    });
    
    this.showCoverageReport(coverage);
  }
}`
  },
  {
    id: 'cicd-pipeline',
    name: 'CI/CD Pipeline MCP',
    description: 'Automated testing agents integrated directly with CI/CD pipelines for continuous quality assurance',
    icon: '🚀',
    status: 'Development',
    features: [
      'Pipeline test orchestration',
      'Automated quality gates',
      'Performance benchmarking',
      'Deployment confidence scoring'
    ],
    metrics: {
      responseTime: '< 1s',
      accuracy: '88%',
      uptime: '99.8%'
    },
    codeExample: `// CI/CD Pipeline MCP Integration
version: '3'
services:
  qa-mcp-agent:
    image: qa-tools/mcp-agent:latest
    environment:
      - MCP_MODE=pipeline
      - QUALITY_THRESHOLD=85
    volumes:
      - ./tests:/app/tests
      - ./reports:/app/reports

# GitHub Actions Integration  
name: QA MCP Pipeline
on: [push, pull_request]

jobs:
  qa-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: MCP Quality Analysis
        uses: qa-tools/mcp-action@v1
        with:
          analysis-types: 'tests,security,performance'
          quality-gate: true
          
      - name: Generate MCP Report
        run: |
          mcp-agent generate-report --format=html
          mcp-agent calculate-confidence-score`
  }
]

export default function MCPAppsShowcase() {
  const [selectedApp, setSelectedApp] = useState(mcpApps[0])
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="space-y-8">
      {/* Architecture Diagram */}
      <AIArchitectureDiagram />
      
      {/* Apps Showcase */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* App List */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-midnight mb-4">MCP Applications</h3>
          {mcpApps.map((app) => (
            <Card
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedApp.id === app.id
                  ? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md'
                  : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:border-cyan-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <h4 className="font-semibold text-midnight text-sm">{app.name}</h4>
                  <Badge variant="outline" className={`text-xs mt-1 ${
                    app.status === 'Production' 
                      ? 'border-green-300 text-green-700'
                      : app.status === 'Beta'
                      ? 'border-orange-300 text-orange-700'
                      : 'border-blue-300 text-blue-700'
                  }`}>
                    {app.status}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-midnight-300 leading-relaxed">{app.description}</p>
            </Card>
          ))}
        </div>

        {/* App Details */}
        <div className="lg:col-span-3">
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedApp.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-midnight">{selectedApp.name}</h3>
                  <Badge className={`${
                    selectedApp.status === 'Production' 
                      ? 'bg-green-500'
                      : selectedApp.status === 'Beta'
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
                  } text-white mt-1`}>
                    {selectedApp.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCode(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    !showCode 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'text-midnight-300 hover:text-midnight'
                  }`}
                >
                  Features
                </button>
                <button 
                  onClick={() => setShowCode(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    showCode 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'text-midnight-300 hover:text-midnight'
                  }`}
                >
                  Code
                </button>
              </div>
            </div>
            
            <p className="text-midnight-300 mb-6 leading-relaxed">{selectedApp.description}</p>

            {!showCode ? (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100">
                    <div className="text-2xl font-bold text-cyan-600 mb-1">{selectedApp.metrics.responseTime}</div>
                    <div className="text-sm text-cyan-700">Response Time</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{selectedApp.metrics.accuracy}</div>
                    <div className="text-sm text-blue-700">Accuracy</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{selectedApp.metrics.uptime}</div>
                    <div className="text-sm text-purple-700">Uptime</div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-midnight mb-4">Key Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedApp.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                        <span className="text-sm text-midnight-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-midnight mb-4">Implementation Example</h4>
                <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                    <code>{selectedApp.codeExample}</code>
                  </pre>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}