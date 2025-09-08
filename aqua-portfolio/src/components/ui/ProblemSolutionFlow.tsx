'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowNode } from './FlowNode';
import { FlowConnection } from './FlowConnection';
import { NodeDetail } from './NodeDetail';

interface FlowNodeType {
  id: string;
  type: 'problem' | 'solution' | 'benefit' | 'result';
  title: string;
  description: string;
  details: string[];
  position: { x: number; y: number };
  connections: string[];
  icon: React.ReactNode;
  color: string;
  stats?: { label: string; value: string }[];
  gradient: string;
  bgPattern: string;
}

interface FlowConnectionType {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

const ProblemSolutionFlow = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [animatedConnections, setAnimatedConnections] = useState<Set<string>>(new Set());
  const [flowStep, setFlowStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const nodes: FlowNodeType[] = useMemo(() => [
    {
      id: 'manual-testing-problem',
      type: 'problem',
      title: 'Manual Testing Crisis',
      description: 'Time-consuming, error-prone manual testing processes holding back development velocity',
      details: [
        '40+ hours/week spent on repetitive test execution',
        '15% error rate in manual test case execution',
        'Cannot scale testing with development speed',
        'No continuous feedback loop for quality',
        'Team burnout from repetitive tasks'
      ],
      position: { x: 50, y: 150 },
      connections: ['automation-solution'],
      color: '#dc2626',
      gradient: 'from-red-500 via-red-600 to-red-700',
      bgPattern: 'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      stats: [
        { label: 'Time Lost', value: '40h/week' },
        { label: 'Error Rate', value: '15%' },
        { label: 'Scalability', value: 'Poor' }
      ]
    },
    {
      id: 'automation-solution',
      type: 'solution',
      title: 'Test Automation Revolution',
      description: 'Implementing robust automated testing infrastructure with modern tools',
      details: [
        'Cross-browser automated test execution',
        'Parallel testing for maximum speed',
        'CI/CD pipeline integration',
        'Comprehensive test reporting dashboard',
        'Consistent, repeatable test results'
      ],
      position: { x: 350, y: 150 },
      connections: ['flaky-tests-problem', 'automation-benefits'],
      color: '#059669',
      gradient: 'from-aqua-500 via-blue-600 to-aqua-700',
      bgPattern: 'radial-gradient(circle at 30% 40%, rgba(5, 150, 105, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      stats: [
        { label: 'Time Saved', value: '60%' },
        { label: 'Consistency', value: '98%' },
        { label: 'Speed', value: '5x Faster' }
      ]
    },
    {
      id: 'automation-benefits',
      type: 'benefit',
      title: 'Automation Wins',
      description: 'Significant improvements from basic automation implementation',
      details: [
        '60% reduction in manual testing time',
        '98% consistency in test execution',
        'Parallel execution across multiple browsers',
        'Automated regression testing coverage',
        'Early bug detection in development pipeline'
      ],
      position: { x: 650, y: 50 },
      connections: [],
      color: '#0ea5e9',
      gradient: 'from-sky-500 via-blue-600 to-cyan-600',
      bgPattern: 'radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      stats: [
        { label: 'Speed Gain', value: '3x' },
        { label: 'Bug Detection', value: '2x Earlier' },
        { label: 'Coverage', value: '90%' }
      ]
    },
    {
      id: 'flaky-tests-problem',
      type: 'problem',
      title: 'Maintenance Nightmare',
      description: 'Automated tests breaking frequently due to UI changes and selector brittleness',
      details: [
        'CSS selectors break with every UI update',
        '20+ hours/week spent fixing broken tests',
        'False negative test results reduce confidence',
        'Developer productivity hampered by test maintenance',
        'Test suite reliability drops to 75%'
      ],
      position: { x: 350, y: 300 },
      connections: ['ai-healing-solution'],
      color: '#d97706',
      gradient: 'from-amber-500 via-orange-600 to-yellow-600',
      bgPattern: 'radial-gradient(circle at 40% 60%, rgba(217, 119, 6, 0.15) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      stats: [
        { label: 'Maintenance Time', value: '20h/week' },
        { label: 'Flaky Rate', value: '25%' },
        { label: 'Confidence', value: 'Low' }
      ]
    },
    {
      id: 'ai-healing-solution',
      type: 'solution',
      title: 'AI-Powered Test Healing',
      description: 'Revolutionary intelligent test maintenance with machine learning',
      details: [
        'Automatic selector healing when tests break',
        'AI-powered DOM analysis and pattern recognition',
        'Real-time test adaptation during execution',
        'Predictive failure prevention algorithms',
        'Self-evolving test maintenance system'
      ],
      position: { x: 650, y: 300 },
      connections: ['ai-benefits', 'final-results'],
      color: '#7c3aed',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      bgPattern: 'radial-gradient(circle at 35% 35%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 65% 65%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      stats: [
        { label: 'Healing Rate', value: '94%' },
        { label: 'Auto-Fix Time', value: '<3s' },
        { label: 'Maintenance', value: '80% Less' }
      ]
    },
    {
      id: 'ai-benefits',
      type: 'benefit',
      title: 'AI Transformation',
      description: 'Revolutionary improvement in test reliability and developer experience',
      details: [
        '80% reduction in test maintenance time',
        '94% automatic healing success rate',
        'Zero-downtime test execution',
        'Proactive failure prevention',
        'Continuous learning and improvement'
      ],
      position: { x: 950, y: 200 },
      connections: ['final-results'],
      color: '#0ea5e9',
      gradient: 'from-cyan-500 via-blue-600 to-blue-600',
      bgPattern: 'radial-gradient(circle at 30% 70%, rgba(14, 165, 233, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      stats: [
        { label: 'Reliability', value: '96%' },
        { label: 'ROI', value: '400%' },
        { label: 'Joy Factor', value: '∞' }
      ]
    },
    {
      id: 'final-results',
      type: 'result',
      title: 'Testing Excellence',
      description: 'World-class autonomous testing infrastructure with predictive capabilities',
      details: [
        'Fully autonomous test suite management',
        'Predictive quality assurance algorithms',
        'Zero false positives/negatives',
        'Real-time quality feedback loops',
        'Industry-leading test coverage and stability'
      ],
      position: { x: 1250, y: 300 },
      connections: [],
      color: '#16a34a',
      gradient: 'from-aqua-500 via-aqua-600 to-blue-600',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.15) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      stats: [
        { label: 'Test Coverage', value: '99.9%' },
        { label: 'Quality Score', value: 'A+' },
        { label: 'Impact', value: 'Massive' }
      ]
    }
  ], []);

  const connections: FlowConnectionType[] = useMemo(() => [
    { from: 'manual-testing-problem', to: 'automation-solution', label: 'Implement Automation' },
    { from: 'automation-solution', to: 'automation-benefits', label: 'Achieve Benefits' },
    { from: 'automation-solution', to: 'flaky-tests-problem', label: 'New Challenges' },
    { from: 'flaky-tests-problem', to: 'ai-healing-solution', label: 'AI Integration' },
    { from: 'ai-healing-solution', to: 'ai-benefits', label: 'Transform Testing' },
    { from: 'ai-healing-solution', to: 'final-results', label: 'Ultimate Goal' },
    { from: 'ai-benefits', to: 'final-results', label: 'Excellence' }
  ], []);

  // Auto-play flow animation
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setFlowStep(prev => (prev + 1) % nodes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nodes.length]);

  useEffect(() => {
    if (isAutoPlaying) {
      const currentNode = nodes[flowStep];
      setSelectedNodeId(currentNode.id);
      
      // Animate connections from this node
      const nodeConnections = connections.filter(conn => conn.from === currentNode.id);
      nodeConnections.forEach(conn => {
        setTimeout(() => {
          setAnimatedConnections(prev => new Set([...prev, `${conn.from}-${conn.to}`]));
        }, 500);
      });
    }
  }, [flowStep, isAutoPlaying, nodes, connections]);

  const selectedNode = useMemo(
    () => selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null,
    [selectedNodeId, nodes]
  );

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(current => current === nodeId ? null : nodeId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  return (
    <div className="w-full max-w-full mx-auto overflow-hidden">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Problem → Solution Flow</h1>
              <p className="text-slate-300">Interactive journey from testing challenges to AI-powered excellence</p>
            </div>
            <motion.button
              onClick={toggleAutoPlay}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isAutoPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAutoPlaying ? '⏸️ Pause Tour' : '▶️ Auto Tour'}
            </motion.button>
          </div>
        </header>

        <main className="p-8">
          {/* Flow Diagram */}
          <section className="relative overflow-x-auto" role="img" aria-label="Interactive flow diagram showing the journey from testing problems to AI-powered solutions">
            <div className="min-w-[1400px] h-[500px] relative bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 rounded-xl border border-slate-200">
              <svg className="absolute inset-0 w-full h-full">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Render connections */}
                {connections.map(connection => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  
                  if (!fromNode || !toNode) return null;

                  return (
                    <FlowConnection
                      key={`${connection.from}-${connection.to}`}
                      connection={connection}
                      fromPosition={{
                        x: fromNode.position.x + 120,
                        y: fromNode.position.y + 60
                      }}
                      toPosition={{
                        x: toNode.position.x,
                        y: toNode.position.y + 60
                      }}
                      isAnimated={animatedConnections.has(`${connection.from}-${connection.to}`)}
                      containerWidth={1400}
                      containerHeight={500}
                    />
                  );
                })}
              </svg>
              
              {/* Render nodes */}
              {nodes.map((node) => (
                <FlowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={handleNodeSelect}
                />
              ))}
            </div>
          </section>
          {/* Node Detail Modal */}
          <div aria-live="polite" aria-atomic="true">
            <NodeDetail
              node={selectedNode}
              onClose={handleCloseDetail}
            />
          </div>

        {/* Enhanced Legend */}
        <section className="mt-8 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-6 border border-slate-200" aria-labelledby="legend-title">
            <h2 id="legend-title" className="font-bold text-midnight mb-4 text-center">Flow Legend</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'problem', label: 'Problems', color: '#dc2626', icon: '⚠️' },
                { type: 'solution', label: 'Solutions', color: '#059669', icon: '⚡' },
                { type: 'benefit', label: 'Benefits', color: '#0ea5e9', icon: '📈' },
                { type: 'result', label: 'Results', color: '#16a34a', icon: '🎯' }
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="font-medium text-midnight">{item.label}</div>
                    <div className="w-8 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProblemSolutionFlow;