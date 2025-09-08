'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: string;
}

const InteractiveTerminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'output', content: 'Welcome to AI Test Doctor v3.1.0' },
    { id: '2', type: 'output', content: 'Type a command to see intelligent testing in action...' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands = {
    'npm test': [
      { type: 'output' as const, content: '> Running test suite with AI healing enabled...' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: 'PASS  tests/login.spec.ts (4.2s)' },
      { type: 'success' as const, content: '  ✓ should login with valid credentials (2.1s)' },
      { type: 'success' as const, content: '  ✓ should handle invalid credentials (1.8s)' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: 'HEAL  tests/navigation.spec.ts (3.8s)' },
      { type: 'output' as const, content: '  ⚡ Auto-healed selector: .menu-button → [data-testid="nav-menu"]' },
      { type: 'success' as const, content: '  ✓ should navigate to dashboard (1.9s)' },
      { type: 'output' as const, content: '' },
      { type: 'success' as const, content: 'Test Suites: 2 passed, 2 total' },
      { type: 'success' as const, content: 'Tests:       3 passed, 3 total' },
      { type: 'success' as const, content: 'Healing:     1 selector healed automatically' },
      { type: 'success' as const, content: 'Time:        8.0s' }
    ],
    'playwright test': [
      { type: 'output' as const, content: '> Starting Playwright tests with AI Doctor...' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: 'Running 12 tests using 4 workers' },
      { type: 'output' as const, content: '' },
      { type: 'success' as const, content: '  ✓ [chromium] › auth/login.spec.ts:3:1 › Login flow' },
      { type: 'output' as const, content: '    ⚡ AI healed broken selector automatically' },
      { type: 'success' as const, content: '  ✓ [chromium] › ui/navigation.spec.ts:8:1 › Menu navigation' },
      { type: 'success' as const, content: '  ✓ [firefox] › forms/contact.spec.ts:5:1 › Contact form' },
      { type: 'output' as const, content: '    🎯 Performance check: LCP 1.2s (target: <2.5s)' },
      { type: 'success' as const, content: '  ✓ [webkit] › api/users.spec.ts:12:1 › User API endpoints' },
      { type: 'output' as const, content: '' },
      { type: 'success' as const, content: '  12 passed (34s)' },
      { type: 'output' as const, content: '  AI Healings: 3 selectors auto-fixed' },
      { type: 'output' as const, content: '  Performance: All metrics within thresholds' }
    ],
    'ai-heal --fix': [
      { type: 'output' as const, content: '> AI Test Doctor - Healing Mode Activated' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: 'Scanning test files for broken selectors...' },
      { type: 'output' as const, content: 'Found 4 potential issues to fix' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: '🔍 Analyzing DOM patterns...' },
      { type: 'success' as const, content: '✓ Fixed: #submit-btn → button[data-testid="submit"]' },
      { type: 'success' as const, content: '✓ Fixed: .login-form → form[aria-label="Login"]' },
      { type: 'success' as const, content: '✓ Enhanced: .menu → nav[role="navigation"] >> .menu-item' },
      { type: 'success' as const, content: '✓ Optimized: .card:nth-child(3) → .card:has-text("Features")' },
      { type: 'output' as const, content: '' },
      { type: 'success' as const, content: 'Healing complete! 4/4 selectors improved' },
      { type: 'output' as const, content: 'Estimated maintenance reduction: 67%' }
    ],
    'help': [
      { type: 'output' as const, content: 'Available commands:' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: '  npm test          - Run test suite with AI healing' },
      { type: 'output' as const, content: '  playwright test   - Execute Playwright tests' },
      { type: 'output' as const, content: '  ai-heal --fix     - Auto-fix broken selectors' },
      { type: 'output' as const, content: '  clear             - Clear terminal' },
      { type: 'output' as const, content: '  help              - Show this help message' }
    ],
    'clear': []
  };

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const typeText = async (text: string, delay = 50) => {
    setCurrentInput('');
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 30));
      setCurrentInput(text.slice(0, i));
    }
  };

  const executeCommand = async (command: string) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Add input line
    const inputLine: TerminalLine = {
      id: `input-${Date.now()}`,
      type: 'input',
      content: `$ ${command}`,
      timestamp
    };

    setLines(prev => [...prev, inputLine]);
    setCurrentInput('');

    if (command === 'clear') {
      setLines([]);
      return;
    }

    const commandOutput = commands[command as keyof typeof commands];
    
    if (!commandOutput) {
      setLines(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `Command not found: ${command}. Type 'help' for available commands.`
      }]);
      return;
    }

    // Type out each line with realistic delays
    setIsTyping(true);
    for (let i = 0; i < commandOutput.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400));
      const newLine: TerminalLine = {
        id: `output-${Date.now()}-${i}`,
        ...commandOutput[i]
      };
      setLines(prev => [...prev, newLine]);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim() && !isTyping) {
      executeCommand(currentInput.trim());
    }
  };

  const runDemoCommand = async (command: string) => {
    if (isTyping) return;
    setIsTyping(true);
    await typeText(command, 80);
    await new Promise(resolve => setTimeout(resolve, 500));
    await executeCommand(command);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-aqua-500"></div>
            </div>
            <span className="text-slate-300 text-sm font-mono ml-4">
              AI Test Doctor Terminal
            </span>
          </div>
          <div className="flex gap-2">
            {Object.keys(commands).slice(0, 3).map((cmd) => (
              <button
                key={cmd}
                onClick={() => runDemoCommand(cmd)}
                disabled={isTyping}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 disabled:opacity-50 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="h-96 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        >
          <div className="font-mono text-sm space-y-1">
            <AnimatePresence>
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    line.type === 'input' ? 'text-cyan-400' :
                    line.type === 'success' ? 'text-aqua-400' :
                    line.type === 'error' ? 'text-red-400' :
                    'text-slate-300'
                  }`}
                >
                  {line.content}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Current Input Line */}
            {!isTyping && (
              <div className="flex text-cyan-400">
                <span>$ </span>
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-transparent border-none outline-none flex-1 font-mono text-cyan-400 placeholder-slate-500"
                  placeholder="Type a command..."
                  autoFocus
                />
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  █
                </span>
              </div>
            )}

            {isTyping && (
              <div className="flex text-cyan-400">
                <span>$ </span>
                <span>{currentInput}</span>
                <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  █
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-aqua-500'}`}></div>
              <span>{isTyping ? 'Processing...' : 'Ready'}</span>
            </div>
            <span>AI Doctor v3.1.0</span>
          </div>
          <div className="text-slate-500">
            Lines: {lines.length} | Type &apos;help&apos; for commands
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTerminal;