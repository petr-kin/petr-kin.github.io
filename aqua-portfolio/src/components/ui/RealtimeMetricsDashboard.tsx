'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Metric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ReactNode;
}

interface ChartPoint {
  time: string;
  value: number;
}

const RealtimeMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'tests-run',
      label: 'Tests Run',
      value: 1247,
      target: 1500,
      unit: '',
      trend: 'up',
      color: '#06b6d4',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'success-rate',
      label: 'Success Rate',
      value: 96.8,
      target: 95,
      unit: '%',
      trend: 'up',
      color: '#10b981',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      id: 'healing-rate',
      label: 'Auto Healing',
      value: 94.2,
      target: 90,
      unit: '%',
      trend: 'stable',
      color: '#8b5cf6',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    },
    {
      id: 'avg-duration',
      label: 'Avg Duration',
      value: 2.4,
      target: 3.0,
      unit: 's',
      trend: 'down',
      color: '#f59e0b',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLive) return;

      setMetrics(prev => prev.map(metric => {
        const change = (Math.random() - 0.5) * 0.1;
        const newValue = Math.max(0, metric.value + change);
        
        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (change > 0.05) trend = 'up';
        else if (change < -0.05) trend = 'down';

        return {
          ...metric,
          value: parseFloat(newValue.toFixed(1)),
          trend
        };
      }));

      // Update chart data
      const now = new Date().toLocaleTimeString([], { hour12: false });
      setChartData(prev => [
        ...prev.slice(-29), // Keep last 30 points
        {
          time: now,
          value: 95 + Math.random() * 5 // Success rate simulation
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Initialize chart data
  useEffect(() => {
    const initialData: ChartPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const time = new Date(Date.now() - i * 2000).toLocaleTimeString([], { hour12: false });
      initialData.push({
        time,
        value: 95 + Math.random() * 5
      });
    }
    setChartData(initialData);
  }, []);

  const getProgressPercentage = (value: number, target: number) => {
    return Math.min(100, (value / target) * 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-aqua-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-3 h-3 bg-aqua-500 rounded-full"
                animate={isLive ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <h3 className="text-xl font-bold text-midnight">Real-time Test Metrics</h3>
              <span className="text-sm text-slate-500">Live Dashboard</span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLive 
                  ? 'bg-aqua-100 text-aqua-700 hover:bg-aqua-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric) => (
              <motion.div
                key={metric.id}
                className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/50"
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                    <div style={{ color: metric.color }}>
                      {metric.icon}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <motion.div
                    className="text-2xl font-bold text-midnight"
                    key={metric.value}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {metric.value.toLocaleString()}{metric.unit}
                  </motion.div>
                  <div className="text-sm text-slate-600">{metric.label}</div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>Target: {metric.target}{metric.unit}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: metric.color }}
                        animate={{ width: `${getProgressPercentage(metric.value, metric.target)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Chart */}
          <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-midnight">Success Rate Trend</h4>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-aqua-500 rounded-full"></div>
                <span>Last 60 seconds</span>
              </div>
            </div>

            <div className="h-32 relative">
              <svg className="w-full h-full">
                {/* Grid Lines */}
                {[...Array(5)].map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={`${(i * 25)}%`}
                    x2="100%"
                    y2={`${(i * 25)}%`}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Chart Line */}
                <motion.path
                  d={chartData.length > 1 ? 
                    `M ${chartData.map((point, i) => 
                      `${(i / (chartData.length - 1)) * 100},${100 - (point.value - 90) * 10}`
                    ).join(' L ')}` : ''
                  }
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />

                {/* Data Points */}
                {chartData.map((point, i) => (
                  <motion.circle
                    key={`${point.time}-${i}`}
                    cx={`${(i / (chartData.length - 1)) * 100}%`}
                    cy={`${100 - (point.value - 90) * 10}%`}
                    r="3"
                    fill="#10b981"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  />
                ))}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-8">
                <span>100%</span>
                <span>97.5%</span>
                <span>95%</span>
                <span>92.5%</span>
                <span>90%</span>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-aqua-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>AI healing active</span>
              </div>
            </div>
            <div className="text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMetricsDashboard;