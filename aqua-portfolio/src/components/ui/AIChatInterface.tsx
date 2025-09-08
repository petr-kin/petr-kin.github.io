'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const AIChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI Testing Assistant. Ask me anything about test automation, Playwright, or AI-powered testing!",
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [suggestedQuestions] = useState([
    "How does AI healing work?",
    "Best practices for Playwright testing?",
    "How to reduce test maintenance?",
    "Setting up CI/CD for tests?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const aiResponses: Record<string, string> = {
    "how does ai healing work": "AI healing uses machine learning to automatically detect and fix broken selectors when page elements change. It analyzes DOM patterns, element relationships, and visual characteristics to find alternative selectors that maintain test stability. The system learns from successful healing patterns to improve future predictions.",
    
    "best practices for playwright": "Here are key Playwright best practices: 1) Use data-testid attributes for stable selectors, 2) Implement proper wait strategies with auto-waiting, 3) Create reusable page object models, 4) Use parallel execution for faster test runs, 5) Set up proper error handling and screenshots, 6) Configure cross-browser testing for comprehensive coverage.",
    
    "how to reduce test maintenance": "Reduce maintenance by: 1) Using AI-powered selector healing, 2) Creating robust, semantic selectors, 3) Implementing page object patterns, 4) Using visual testing for UI changes, 5) Setting up proper test data management, 6) Regular test health monitoring, 7) Automated test reporting and analytics.",
    
    "setting up ci/cd for tests": "CI/CD setup: 1) Use GitHub Actions or Jenkins for automation, 2) Run tests on multiple environments, 3) Implement test result reporting, 4) Set up parallel execution, 5) Configure screenshot and video capture, 6) Add test result notifications, 7) Use test scheduling for different test suites.",
    
    "default": "That's a great question! Based on my experience with test automation and AI-powered testing, I'd recommend exploring Playwright's advanced features, implementing proper error handling, and leveraging AI healing capabilities to maintain stable test suites. Would you like me to elaborate on any specific aspect?"
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    }
  };

  useEffect(() => {
    // Only auto-scroll if user is near the bottom or if it's an AI message
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      const lastMessage = messages[messages.length - 1];
      
      if (isNearBottom || lastMessage?.type === 'ai') {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages]);

  const typeAIResponse = async (response: string) => {
    setIsAITyping(true);
    
    const tempMessage: Message = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i <= response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, content: response.slice(0, i) }
          : msg
      ));
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === tempMessage.id 
        ? { ...msg, isTyping: false }
        : msg
    ));
    
    setIsAITyping(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isAITyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    // Find appropriate response
    const key = content.toLowerCase().trim();
    const response = Object.keys(aiResponses).find(k => 
      key.includes(k) || k.includes(key)
    );
    
    const aiResponse = response ? aiResponses[response] : aiResponses.default;
    
    await typeAIResponse(aiResponse);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentInput);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden h-[600px] flex flex-col relative">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(6, 182, 212, 0.4)', '0 0 0 10px rgba(6, 182, 212, 0)', '0 0 0 0 rgba(6, 182, 212, 0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </motion.div>
          <div>
            <h3 className="font-semibold text-midnight">AI Testing Assistant</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <motion.div
                className="w-2 h-2 bg-aqua-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Online • Ready to help</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth" 
          style={{ scrollBehavior: 'smooth' }}
          onScroll={handleScroll}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-600 font-medium">AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white'
                        : 'bg-slate-100 text-midnight'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.content}
                      {message.isTyping && (
                        <motion.span
                          className="inline-block w-2 h-5 bg-current ml-1"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </p>
                  </div>
                  <div className={`text-xs text-slate-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isAITyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">AI is typing...</span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-20 right-6 w-10 h-10 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <motion.div
            className="px-6 py-3 border-t border-slate-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-slate-600 mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isAITyping}
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-200/50 bg-slate-50/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyPress={handleKeyPress}
                onFocus={(e) => {
                  // Prevent scroll jumping when focusing
                  e.preventDefault();
                }}
                placeholder="Ask me about test automation..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all overflow-hidden"
                rows={1}
                disabled={isAITyping}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              onClick={() => handleSendMessage(currentInput)}
              disabled={!currentInput.trim() || isAITyping}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;