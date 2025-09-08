'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestScenario {
  id: string;
  title: string;
  description: string;
  code: string;
  color: string;
  icon: React.ReactNode;
}

const TestingInAction = () => {
  const [activeScenario, setActiveScenario] = useState('resilient');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [codeLines, setCodeLines] = useState<string[]>([]);

  const scenarios: TestScenario[] = [
    {
      id: 'resilient',
      title: 'Resilient Selectors',
      description: 'AI-powered selector healing when elements change',
      color: 'from-cyan-500 to-cyan-400',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      code: `// AI-Enhanced Resilient Selector Detection
const smartSelector = await page.locator([
  'button[data-testid="login-submit"]',
  'button:has-text("Sign In")',
  '.auth-form button[type="submit"]',
  'button.primary:near(input[type="password"])'
]).first();

// Auto-healing when selectors break
if (!await smartSelector.isVisible()) {
  console.log('Healing selector...');
  const healedSelector = await aiHealSelector('login-button');
  await healedSelector.click();
} else {
  await smartSelector.click();
}

Selector healed automatically - test continues`
    },
    {
      id: 'performance',
      title: 'Performance Testing',
      description: 'Real-time performance monitoring during tests',
      color: 'from-aqua-500 to-blue-400',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      code: `// Performance Monitoring Integration
const performanceMetrics = await page.evaluate(() => {
  return {
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    firstContentfulPaint: performance.getEntriesByType('paint')[0]?.startTime,
    cumulativeLayoutShift: 0.1,
    largestContentfulPaint: 2341
  };
});

await expect(performanceMetrics.loadTime).toBeLessThan(3000);
await expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500);

console.log(\`Page loaded in \${performanceMetrics.loadTime}ms\`);
console.log(\`FCP: \${performanceMetrics.firstContentfulPaint}ms\`);

Performance thresholds met - all metrics green`
    },
    {
      id: 'autohealing',
      title: 'Auto-Healing',
      description: 'Intelligent test recovery when elements change',
      color: 'from-purple-500 to-purple-400',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
      code: `// AI-Powered Auto-Healing Engine
try {
  await page.click('#submit-button');
} catch (error) {
  console.log('AI healing initiated...');
  
  // Analyze DOM changes
  const domAnalysis = await analyzeDOMChanges();
  const similarElements = await findSimilarElements({
    text: 'Submit',
    role: 'button',
    context: 'form'
  });
  
  // Apply machine learning pattern matching
  const healedSelector = await mlPatternMatch(similarElements);
  
  console.log(\`Healed selector: \${healedSelector}\`);
  await page.click(healedSelector);
}

Test healed successfully - 96% healing rate maintained`
    }
  ];

  const activeScenarioData = scenarios.find(s => s.id === activeScenario) || scenarios[0];

  useEffect(() => {
    const lines = activeScenarioData.code.split('\n');
    setCodeLines([]);
    
    const animateCode = async () => {
      for (let i = 0; i < lines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setCodeLines(prev => [...prev, lines[i]]);
      }
    };
    
    const timer = setTimeout(animateCode, 300);
    return () => clearTimeout(timer);
  }, [activeScenario]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText('');
    
    const messages = [
      'Initializing AI test generator...',
      'Analyzing page structure...',
      'Discovering interactive elements...',
      'Generating optimized selectors...',
      'Creating test scenarios...',
      'Test suite generated successfully!'
    ];
    
    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGeneratedText(messages[i]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsGenerating(false);
    setGeneratedText('');
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              width: i % 2 === 0 ? '4px' : '6px',
              height: i % 2 === 0 ? '4px' : '6px',
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl">
        {/* Corner Decorations */}
        <svg className="absolute top-0 left-0 w-3 h-3 text-slate-200/50" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute top-0 right-0 w-3 h-3 text-slate-200/50 rotate-90" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-3 h-3 text-slate-200/50 -rotate-90" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-3 h-3 text-slate-200/50 rotate-180" fill="currentColor" viewBox="0 0 11 11">
          <path d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L-4.37114e-08 1L0 -4.80825e-07L11 4.37114e-07L11 1Z" />
        </svg>

        {/* Header */}
        <div className="relative p-8 lg:p-12 border-b border-slate-200/50">
          <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
Testing in Action - Interactive Demo
          </div>
          <div className="text-xl text-midnight-300">
            <span className="font-semibold text-midnight">Experience AI testing live.</span>{' '}
            Click scenarios below to see intelligent test automation in action.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Scenario Buttons */}
          <div className="lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-slate-200/50">
            <h3 className="text-lg font-semibold text-midnight mb-6">Test Scenarios</h3>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <motion.button
                  key={scenario.id}
                  onClick={() => setActiveScenario(scenario.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeScenario === scenario.id
                      ? `bg-gradient-to-r ${scenario.color} text-white border-transparent shadow-lg`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeScenario === scenario.id ? 'bg-white/20' : 'bg-white'
                    }`}>
                      {scenario.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{scenario.title}</div>
                      <div className={`text-sm ${
                        activeScenario === scenario.id ? 'text-white/80' : 'text-slate-600'
                      }`}>
                        {scenario.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate New Test
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Code Display */}
          <div className="lg:w-2/3 relative">
            {/* Generated Text Overlay */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    key={generatedText}
                    className="text-white text-lg font-medium flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <motion.div
                      className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {generatedText}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code Editor */}
            <div className="bg-slate-900 text-slate-100 p-8 min-h-[400px] font-mono text-sm leading-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-aqua-500"></div>
                </div>
                <div className="ml-4 text-slate-400">
                  {activeScenarioData.title.toLowerCase().replace(' ', '-')}.spec.ts
                </div>
              </div>

              <div className="space-y-1">
                {codeLines.map((line, index) => (
                  <motion.div
                    key={index}
                    className="flex"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <span className="text-slate-500 w-8 text-right mr-4">{index + 1}</span>
                    <span className="whitespace-pre-wrap">
                      {line.includes('//') ? (
                        <>
                          <span>{line.split('//')[0]}</span>
                          <span className="text-aqua-400">{`//${line.split('//')[1]}`}</span>
                        </>
                      ) : line.includes('await') ? (
                        line.replace(/await/g, '<span class="text-purple-400">await</span>')
                      ) : line.includes('console.log') ? (
                        <span className="text-blue-400">{line}</span>
                      ) : line.includes('✅') ? (
                        <span className="text-aqua-400">{line}</span>
                      ) : line.includes('🔄') || line.includes('🤖') || line.includes('🔧') ? (
                        <span className="text-cyan-400">{line}</span>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                      )}
                    </span>
                  </motion.div>
                ))}
                {codeLines.length > 0 && (
                  <motion.div
                    className="w-2 h-5 bg-cyan-500 ml-12 mt-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingInAction;