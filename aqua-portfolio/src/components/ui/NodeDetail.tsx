'use client';

import React, { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

interface NodeDetailProps {
  node: FlowNodeType | null;
  onClose: () => void;
}

export const NodeDetail = memo(({ node, onClose }: NodeDetailProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (node && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [node]);

  useEffect(() => {
    if (!node) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTabLoop = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabLoop);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabLoop);
    };
  }, [node, onClose]);

  if (!node) return null;

  const typeConfig = {
    problem: {
      bgColor: 'from-red-500 to-red-600',
      textColor: 'text-red-100',
      borderColor: 'border-red-400'
    },
    solution: {
      bgColor: 'from-blue-500 to-blue-600', 
      textColor: 'text-blue-100',
      borderColor: 'border-blue-400'
    },
    benefit: {
      bgColor: 'from-green-500 to-green-600',
      textColor: 'text-green-100', 
      borderColor: 'border-green-400'
    },
    result: {
      bgColor: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
      borderColor: 'border-purple-400'
    }
  };

  const config = typeConfig[node.type];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-detail-title"
        aria-describedby="node-detail-description"
      >
        <motion.div
          ref={modalRef}
          className={`
            relative max-w-2xl w-full max-h-[80vh] overflow-hidden 
            bg-gradient-to-br ${config.bgColor} 
            rounded-2xl shadow-2xl ${config.borderColor} border focus-within:ring-4 focus-within:ring-white/50
          `}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: node.bgPattern }}
          />
          
          {/* Header */}
          <div className="relative p-6 border-b border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: node.color }}
                >
                  {node.icon}
                </div>
                <div>
                  <h2 id="node-detail-title" className={`text-2xl font-bold ${config.textColor} mb-1`}>
                    {node.title}
                  </h2>
                  <p id="node-detail-description" className={`${config.textColor} opacity-80`}>
                    {node.description}
                  </p>
                </div>
              </div>
              
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className={`
                  p-2 rounded-lg ${config.textColor} hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-white/50
                  transition-colors duration-200
                `}
                aria-label={`Close ${node.title} details`}
                type="button"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative p-6 overflow-y-auto max-h-96">
            {/* Details */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${config.textColor} mb-3`}>
                Key Details
              </h3>
              <ul className="space-y-2">
                {node.details.map((detail, index) => (
                  <motion.li
                    key={index}
                    className={`flex items-start gap-3 ${config.textColor} opacity-90`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Stats */}
            {node.stats && node.stats.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${config.textColor} mb-3`}>
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {node.stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/10 rounded-lg p-4 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className={`text-2xl font-bold ${config.textColor} mb-1`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${config.textColor} opacity-80`}>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

NodeDetail.displayName = 'NodeDetail';