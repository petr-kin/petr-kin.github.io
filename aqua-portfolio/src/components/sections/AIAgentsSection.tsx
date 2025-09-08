'use client'

import { useState, lazy, Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InfoCardMatrix from '@/components/ui/InfoCardMatrix'

// Lazy load the heavy MCP showcase component
const MCPAppsShowcase = lazy(() => import('@/components/ui/MCPAppsShowcase'))

const aiAgentTypes = [
  {
    id: 'test-generation',
    name: 'Test Generation Agents',
    description: 'AI agents that automatically generate comprehensive test suites based on application analysis and requirements',
    capabilities: [
      'Automated test case generation',
      'Edge case discovery',
      'Regression test optimization',
      'Test data synthesis'
    ],
    technologies: ['GPT-4', 'Claude', 'Playwright', 'Jest'],
    status: 'Production Ready',
    accuracy: '94%',
    coverage: '87%'
  },
  {
    id: 'bug-detection',
    name: 'Bug Detection Agents',
    description: 'Intelligent agents that identify potential bugs through static analysis, runtime monitoring, and pattern recognition',
    capabilities: [
      'Code vulnerability scanning',
      'Runtime anomaly detection',
      'Performance bottleneck identification',
      'Security flaw discovery'
    ],
    technologies: ['SonarQube', 'ESLint', 'Custom ML Models', 'SAST Tools'],
    status: 'Beta',
    accuracy: '89%',
    coverage: '92%'
  },
  {
    id: 'healing-agents',
    name: 'Self-Healing Test Agents',
    description: 'Advanced agents that automatically repair broken test selectors and maintain test stability',
    capabilities: [
      'Automatic selector healing',
      'Test maintenance automation',
      'Flaky test stabilization',
      'CI/CD integration'
    ],
    technologies: ['Computer Vision', 'DOM Analysis', 'ML Classifiers', 'Playwright'],
    status: 'Production Ready',
    accuracy: '96%',
    coverage: '78%'
  }
]

const researchPapers = [
  {
    title: 'AI-Powered Test Generation: A Comprehensive Analysis of Modern Approaches',
    authors: 'Kindlmann, P. et al.',
    year: '2024',
    abstract: 'This paper examines the effectiveness of large language models in automated test case generation, comparing traditional rule-based approaches with modern AI-driven methodologies.',
    citations: 15,
    venue: 'International Conference on Software Testing (ICST)',
    url: '#',
    tags: ['Test Generation', 'LLM', 'Automation']
  },
  {
    title: 'Self-Healing Test Infrastructure: Reducing Maintenance Overhead through Intelligent Adaptation',
    authors: 'Kindlmann, P., Johnson, M.',
    year: '2024',
    abstract: 'We present a novel approach to test maintenance using machine learning algorithms that automatically adapt test selectors and maintain test suite stability.',
    citations: 8,
    venue: 'IEEE Transactions on Software Engineering',
    url: '#',
    tags: ['Self-Healing', 'ML', 'Test Maintenance']
  },
  {
    title: 'Model Context Protocol in Quality Assurance: Bridging AI and Testing Workflows',
    authors: 'Kindlmann, P.',
    year: '2024',
    abstract: 'This study explores the application of Model Context Protocol (MCP) in creating seamless integrations between AI models and existing QA toolchains.',
    citations: 12,
    venue: 'Journal of Automated Software Engineering',
    url: '#',
    tags: ['MCP', 'Integration', 'Workflow']
  }
]

export default function AIAgentsSection() {
  const [selectedAgent, setSelectedAgent] = useState(aiAgentTypes[0])
  const [activeTab, setActiveTab] = useState<'agents' | 'mcp' | 'research'>('agents')

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="relative bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl p-16 text-center overflow-hidden">
            <InfoCardMatrix intensity="high" className="rounded-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Cutting Edge
                </Badge>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-midnight mb-6 tracking-tight leading-tight">
                AI Agents & MCPs in QA
              </h2>
              <p className="text-xl md:text-2xl text-midnight-300 max-w-4xl mx-auto font-light leading-relaxed">
                Exploring the future of quality assurance through <span className="font-semibold text-purple-600">intelligent agents</span> and <span className="font-semibold text-pink-600">Model Context Protocol</span> integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-1 flex gap-1">
            {(['agents', 'mcp', 'research'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-midnight-300 hover:text-midnight hover:bg-white/50'
                }`}
              >
                {tab === 'agents' ? 'AI Agents' : tab === 'mcp' ? 'MCP Integration' : 'Research'}
              </button>
            ))}
          </div>
        </div>

        {/* AI Agents Tab */}
        {activeTab === 'agents' && (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Agent List */}
            <div className="lg:col-span-1">
              <div className="space-y-3 lg:space-y-4 lg:max-h-[600px] lg:overflow-y-auto lg:pr-2">
                {aiAgentTypes.map((agent) => (
                <Card
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 lg:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedAgent.id === agent.id
                      ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                      : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <h3 className="font-bold text-midnight text-sm lg:text-base">{agent.name}</h3>
                  </div>
                  <p className="text-xs lg:text-sm text-midnight-300 mb-3 line-clamp-2 lg:line-clamp-none">{agent.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${
                      agent.status === 'Production Ready' 
                        ? 'border-green-300 text-green-700' 
                        : 'border-orange-300 text-orange-700'
                    }`}>
                      {agent.status}
                    </Badge>
                    <span className="text-xs text-purple-600 font-medium">{agent.accuracy}</span>
                  </div>
                </Card>
              ))}
              </div>
            </div>

            {/* Agent Details */}
            <div className="lg:col-span-2">
              <Card className="p-4 lg:p-8 bg-white/70 backdrop-blur-sm border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
                  <h3 className="text-xl lg:text-2xl font-bold text-midnight">{selectedAgent.name}</h3>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-fit">
                    {selectedAgent.status}
                  </Badge>
                </div>
                
                <p className="text-midnight-300 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">{selectedAgent.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 lg:p-4 border border-purple-100">
                    <div className="text-xl lg:text-2xl font-bold text-purple-600 mb-1">{selectedAgent.accuracy}</div>
                    <div className="text-xs lg:text-sm text-purple-700">Accuracy Rate</div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 lg:p-4 border border-pink-100">
                    <div className="text-xl lg:text-2xl font-bold text-pink-600 mb-1">{selectedAgent.coverage}</div>
                    <div className="text-xs lg:text-sm text-pink-700">Coverage Rate</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4 lg:mb-6">
                  <h4 className="font-semibold text-midnight mb-3 text-sm lg:text-base">Key Capabilities</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs lg:text-sm text-midnight-300 leading-relaxed">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="font-semibold text-midnight mb-3 text-sm lg:text-base">Technologies Used</h4>
                  <div className="flex flex-wrap gap-1.5 lg:gap-2">
                    {selectedAgent.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-slate-100 text-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MCP Integration Tab */}
        {activeTab === 'mcp' && (
          <Suspense
            fallback={
              <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center animate-pulse">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            }
          >
            <MCPAppsShowcase />
          </Suspense>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            {researchPapers.map((paper, index) => (
              <Card key={index} className="p-8 bg-white/70 backdrop-blur-sm border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-midnight mb-2 leading-tight">{paper.title}</h3>
                    <p className="text-midnight-300 mb-2">{paper.authors} • {paper.year}</p>
                    <p className="text-sm text-midnight-300 mb-3 leading-relaxed">{paper.abstract}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {paper.citations} Citations
                    </Badge>
                    <span className="text-xs text-midnight-300">{paper.venue}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {paper.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                  Read Paper
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}