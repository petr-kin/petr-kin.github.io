'use client'

import { useState, useEffect } from 'react'

interface Node {
  id: string
  x: number
  y: number
  label: string
  type: 'agent' | 'mcp' | 'tool' | 'data'
  status: 'active' | 'processing' | 'idle'
}

interface Connection {
  from: string
  to: string
  type: 'data' | 'command' | 'feedback'
}

const nodes: Node[] = [
  { id: 'claude', x: 400, y: 50, label: 'Claude AI', type: 'agent', status: 'active' },
  { id: 'mcp-server', x: 400, y: 150, label: 'MCP Server', type: 'mcp', status: 'processing' },
  { id: 'test-agent', x: 200, y: 250, label: 'Test Generation Agent', type: 'agent', status: 'active' },
  { id: 'healing-agent', x: 400, y: 250, label: 'Self-Healing Agent', type: 'agent', status: 'processing' },
  { id: 'bug-agent', x: 600, y: 250, label: 'Bug Detection Agent', type: 'agent', status: 'idle' },
  { id: 'playwright', x: 100, y: 350, label: 'Playwright', type: 'tool', status: 'active' },
  { id: 'jest', x: 300, y: 350, label: 'Jest', type: 'tool', status: 'active' },
  { id: 'sonarqube', x: 500, y: 350, label: 'SonarQube', type: 'tool', status: 'idle' },
  { id: 'database', x: 700, y: 350, label: 'Test Database', type: 'data', status: 'active' },
  { id: 'ci-cd', x: 400, y: 450, label: 'CI/CD Pipeline', type: 'tool', status: 'processing' }
]

const connections: Connection[] = [
  { from: 'claude', to: 'mcp-server', type: 'command' },
  { from: 'mcp-server', to: 'test-agent', type: 'command' },
  { from: 'mcp-server', to: 'healing-agent', type: 'command' },
  { from: 'mcp-server', to: 'bug-agent', type: 'command' },
  { from: 'test-agent', to: 'playwright', type: 'command' },
  { from: 'test-agent', to: 'jest', type: 'command' },
  { from: 'healing-agent', to: 'playwright', type: 'command' },
  { from: 'bug-agent', to: 'sonarqube', type: 'command' },
  { from: 'bug-agent', to: 'database', type: 'data' },
  { from: 'playwright', to: 'ci-cd', type: 'data' },
  { from: 'jest', to: 'ci-cd', type: 'data' },
  { from: 'sonarqube', to: 'ci-cd', type: 'data' },
  { from: 'playwright', to: 'healing-agent', type: 'feedback' },
  { from: 'ci-cd', to: 'mcp-server', type: 'feedback' }
]

export default function AIArchitectureDiagram() {
  const [animatedConnections, setAnimatedConnections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const interval = setInterval(() => {
      const randomConnection = connections[Math.floor(Math.random() * connections.length)]
      const connectionKey = `${randomConnection.from}-${randomConnection.to}`
      
      setAnimatedConnections(prev => new Set([...prev, connectionKey]))
      
      const timeout = setTimeout(() => {
        setAnimatedConnections(prev => {
          const newSet = new Set(prev)
          newSet.delete(connectionKey)
          return newSet
        })
      }, 2000)
      
      timeouts.push(timeout);
    }, 1500)

    return () => {
      clearInterval(interval);
      timeouts.forEach(timeout => clearTimeout(timeout));
    }
  }, [])

  const getNodeColor = (type: string) => {
    const baseColors = {
      agent: 'from-purple-500 to-pink-500',
      mcp: 'from-cyan-500 to-blue-500',
      tool: 'from-green-500 to-emerald-500',
      data: 'from-orange-500 to-red-500'
    }
    
    return baseColors[type as keyof typeof baseColors] || 'from-gray-500 to-gray-600'
  }

  const getConnectionColor = (type: string) => {
    const colors = {
      command: '#8B5CF6',
      data: '#06B6D4',
      feedback: '#10B981'
    }
    return colors[type as keyof typeof colors] || '#6B7280'
  }

  const getStatusIndicator = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      processing: 'bg-yellow-500 animate-pulse',
      idle: 'bg-gray-400'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-400'
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-midnight">AI QA Ecosystem Architecture</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>AI Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>MCP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Tools</span>
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-96 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
          {/* Connections */}
          {connections.map((connection, index) => {
            const fromNode = nodes.find(n => n.id === connection.from)
            const toNode = nodes.find(n => n.id === connection.to)
            
            if (!fromNode || !toNode) return null
            
            const connectionKey = `${connection.from}-${connection.to}`
            const isAnimated = animatedConnections.has(connectionKey)
            
            return (
              <g key={index}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={getConnectionColor(connection.type)}
                  strokeWidth="2"
                  strokeDasharray={connection.type === 'feedback' ? '5,5' : '0'}
                  opacity={isAnimated ? 1 : 0.3}
                  className="transition-opacity duration-300"
                />
                {isAnimated && (
                  <circle
                    r="4"
                    fill={getConnectionColor(connection.type)}
                    opacity="0.8"
                  >
                    <animateMotion
                      dur="2s"
                      path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                    />
                  </circle>
                )}
              </g>
            )
          })}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <foreignObject
                x={node.x - 40}
                y={node.y - 25}
                width="80"
                height="50"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getNodeColor(node.type)} flex items-center justify-center mb-1 shadow-lg relative`}>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusIndicator(node.status)}`}></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-midnight text-center leading-tight">{node.label}</span>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-midnight mb-2">Connection Types</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500"></div>
                <span>Commands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-cyan-500"></div>
                <span>Data Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500" style={{backgroundImage: 'repeating-linear-gradient(90deg, #10B981 0, #10B981 3px, transparent 3px, transparent 6px)'}}></div>
                <span>Feedback</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-midnight mb-2">Node Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Idle</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-midnight mb-2">Key Features</h4>
            <ul className="space-y-1 text-xs text-midnight-300">
              <li>• Real-time communication via MCP</li>
              <li>• Autonomous agent coordination</li>
              <li>• Bidirectional feedback loops</li>
              <li>• Scalable architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}