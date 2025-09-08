'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiffLine {
  id: string;
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  lineNumber?: number;
  highlight?: boolean;
}

interface CodeDiff {
  id: string;
  title: string;
  description: string;
  language: string;
  beforeCode: DiffLine[];
  afterCode: DiffLine[];
  improvements: string[];
}

const CodeDiffVisualizer = () => {
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [animateLines, setAnimateLines] = useState(false);

  const codeDiffs: CodeDiff[] = [
    {
      id: 'selector-healing',
      title: 'Selector Healing - Login Button',
      description: 'AI automatically healed a broken CSS selector after DOM changes',
      language: 'typescript',
      beforeCode: [
        { id: '1', type: 'unchanged', content: "import { test, expect } from '@playwright/test';", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: '', lineNumber: 2 },
        { id: '3', type: 'unchanged', content: "test('user login flow', async ({ page }) => {", lineNumber: 3 },
        { id: '4', type: 'unchanged', content: "  await page.goto('/login');", lineNumber: 4 },
        { id: '5', type: 'removed', content: "  await page.click('button.submit-btn');", lineNumber: 5, highlight: true },
        { id: '6', type: 'unchanged', content: "  await expect(page).toHaveURL('/dashboard');", lineNumber: 6 },
        { id: '7', type: 'unchanged', content: '});', lineNumber: 7 }
      ],
      afterCode: [
        { id: '1', type: 'unchanged', content: "import { test, expect } from '@playwright/test';", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: '', lineNumber: 2 },
        { id: '3', type: 'unchanged', content: "test('user login flow', async ({ page }) => {", lineNumber: 3 },
        { id: '4', type: 'unchanged', content: "  await page.goto('/login');", lineNumber: 4 },
        { id: '5', type: 'added', content: "  await page.click('button[data-testid=\"login-submit\"]');", lineNumber: 5, highlight: true },
        { id: '6', type: 'unchanged', content: "  await expect(page).toHaveURL('/dashboard');", lineNumber: 6 },
        { id: '7', type: 'unchanged', content: '});', lineNumber: 7 }
      ],
      improvements: [
        'Uses semantic data-testid for stability',
        'Resistant to CSS class changes',
        'Improved accessibility compliance',
        '98% reliability increase'
      ]
    },
    {
      id: 'robust-navigation',
      title: 'Navigation Selector Enhancement',
      description: 'Converted brittle nth-child selector to semantic text-based selection',
      language: 'typescript',
      beforeCode: [
        { id: '1', type: 'unchanged', content: "test('navigate to dashboard', async ({ page }) => {", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: "  await page.goto('/');", lineNumber: 2 },
        { id: '3', type: 'removed', content: "  await page.click('.nav-menu-item:nth-child(3)');", lineNumber: 3, highlight: true },
        { id: '4', type: 'removed', content: "  // Brittle - breaks when menu order changes", lineNumber: 4, highlight: true },
        { id: '5', type: 'unchanged', content: "  await expect(page).toHaveURL('/dashboard');", lineNumber: 5 },
        { id: '6', type: 'unchanged', content: '});', lineNumber: 6 }
      ],
      afterCode: [
        { id: '1', type: 'unchanged', content: "test('navigate to dashboard', async ({ page }) => {", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: "  await page.goto('/');", lineNumber: 2 },
        { id: '3', type: 'added', content: '  await page.click(\'nav[role="navigation"] >> text="Dashboard"\');', lineNumber: 3, highlight: true },
        { id: '4', type: 'added', content: "  // Semantic - works regardless of menu structure", lineNumber: 4, highlight: true },
        { id: '5', type: 'unchanged', content: "  await expect(page).toHaveURL('/dashboard');", lineNumber: 5 },
        { id: '6', type: 'unchanged', content: '});', lineNumber: 6 }
      ],
      improvements: [
        'Semantic selector based on content',
        'Immune to DOM structure changes',
        'Better accessibility alignment',
        'Self-documenting test intent'
      ]
    },
    {
      id: 'form-interaction',
      title: 'Form Input Strategy Optimization',
      description: 'Enhanced form interaction with proper waiting and validation',
      language: 'typescript',
      beforeCode: [
        { id: '1', type: 'unchanged', content: "test('fill contact form', async ({ page }) => {", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: "  await page.goto('/contact');", lineNumber: 2 },
        { id: '3', type: 'removed', content: "  await page.fill('#email', 'test@example.com');", lineNumber: 3, highlight: true },
        { id: '4', type: 'removed', content: "  await page.fill('#message', 'Hello world');", lineNumber: 4 },
        { id: '5', type: 'removed', content: "  await page.click('#submit');", lineNumber: 5 },
        { id: '6', type: 'unchanged', content: '});', lineNumber: 6 }
      ],
      afterCode: [
        { id: '1', type: 'unchanged', content: "test('fill contact form', async ({ page }) => {", lineNumber: 1 },
        { id: '2', type: 'unchanged', content: "  await page.goto('/contact');", lineNumber: 2 },
        { id: '3', type: 'added', content: "  await page.fill('input[name=\"email\"]', 'test@example.com');", lineNumber: 3, highlight: true },
        { id: '4', type: 'added', content: "  await page.fill('textarea[name=\"message\"]', 'Hello world');", lineNumber: 4, highlight: true },
        { id: '5', type: 'added', content: "  await page.click('button[type=\"submit\"]:has-text(\"Send\")');", lineNumber: 5, highlight: true },
        { id: '6', type: 'added', content: "  await expect(page.locator('.success-message')).toBeVisible();", lineNumber: 6, highlight: true },
        { id: '7', type: 'unchanged', content: '});', lineNumber: 7 }
      ],
      improvements: [
        'Name-based selectors for forms',
        'Added explicit success validation',
        'More descriptive button targeting',
        'Complete interaction flow coverage'
      ]
    }
  ];

  const currentDiff = codeDiffs[currentDiffIndex];

  useEffect(() => {
    setAnimateLines(true);
    const timer = setTimeout(() => setAnimateLines(false), 1000);
    return () => clearTimeout(timer);
  }, [currentDiffIndex]);

  const renderDiffLine = (line: DiffLine, index: number) => {
    const getLineStyle = () => {
      switch (line.type) {
        case 'added':
          return 'bg-aqua-50 border-l-4 border-aqua-500 text-aqua-800';
        case 'removed':
          return 'bg-red-50 border-l-4 border-red-500 text-red-800';
        case 'modified':
          return 'bg-blue-50 border-l-4 border-blue-500 text-blue-800';
        default:
          return 'bg-white text-slate-700';
      }
    };

    const getLinePrefix = () => {
      switch (line.type) {
        case 'added':
          return '+';
        case 'removed':
          return '-';
        default:
          return ' ';
      }
    };

    return (
      <motion.div
        key={line.id}
        className={`flex font-mono text-sm leading-6 ${getLineStyle()} ${
          line.highlight ? 'ring-2 ring-cyan-300' : ''
        }`}
        initial={animateLines ? { opacity: 0, x: line.type === 'added' ? 20 : line.type === 'removed' ? -20 : 0 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="w-12 text-slate-400 text-right pr-3 select-none flex-shrink-0">
          {line.lineNumber}
        </div>
        <div className="w-4 text-slate-500 text-center flex-shrink-0">
          {getLinePrefix()}
        </div>
        <div className="flex-1 pr-4">
          <pre className="whitespace-pre-wrap">{line.content}</pre>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-midnight mb-2">Code Diff Visualizer</h3>
              <p className="text-slate-600">See how AI healing transforms your test code</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'split' 
                    ? 'bg-cyan-100 text-cyan-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } transition-colors`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'unified' 
                    ? 'bg-cyan-100 text-cyan-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } transition-colors`}
              >
                Unified View
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Diff Navigation */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h4 className="text-lg font-semibold text-midnight">
                {currentDiff.title}
              </h4>
              <div className="flex gap-1">
                {codeDiffs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDiffIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentDiffIndex ? 'bg-cyan-500' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-600 mb-4">{currentDiff.description}</p>

            {/* Improvements List */}
            <div className="bg-aqua-50 rounded-lg p-4 border border-aqua-200">
              <h5 className="font-medium text-aqua-900 mb-2">Improvements Made:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentDiff.improvements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 text-sm text-aqua-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <svg className="w-4 h-4 text-aqua-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {improvement}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentDiffIndex}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'split' ? (
                /* Split View */
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200/50">
                    <div className="px-4 py-3 bg-red-100 border-b border-red-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-medium text-red-900">Before (Broken)</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {currentDiff.beforeCode.map((line, index) => renderDiffLine(line, index))}
                    </div>
                  </div>

                  {/* After */}
                  <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200/50">
                    <div className="px-4 py-3 bg-aqua-100 border-b border-aqua-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-aqua-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-aqua-900">After (Healed)</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {currentDiff.afterCode.map((line, index) => renderDiffLine(line, index))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Unified View */
                <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200/50">
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="font-medium text-midnight">Unified Diff</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Combine and sort lines for unified view */}
                    {[...currentDiff.beforeCode, ...currentDiff.afterCode]
                      .filter(line => line.type !== 'unchanged' || currentDiff.beforeCode.includes(line))
                      .sort((a, b) => (a.lineNumber || 0) - (b.lineNumber || 0))
                      .map((line, index) => renderDiffLine(line, index))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentDiffIndex(prev => prev > 0 ? prev - 1 : codeDiffs.length - 1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="text-sm text-slate-600">
              {currentDiffIndex + 1} of {codeDiffs.length}
            </div>

            <button
              onClick={() => setCurrentDiffIndex(prev => prev < codeDiffs.length - 1 ? prev + 1 : 0)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDiffVisualizer;