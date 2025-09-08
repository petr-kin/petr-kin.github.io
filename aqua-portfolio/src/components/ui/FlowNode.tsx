'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';

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

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  scale?: number;
}

export const FlowNode = memo(({ 
  node, 
  isSelected, 
  onSelect, 
  scale = 1 
}: FlowNodeProps) => {
  const nodeVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
      y: 20
    },
    animate: {
      scale: scale,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        delay: 0.1
      }
    },
    hover: {
      scale: scale * 1.05,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 400
      }
    },
    tap: {
      scale: scale * 0.95
    }
  };

  const selectedVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: isSelected ? 1.1 : 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      variants={nodeVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(node.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node.id);
        }
      }}
      aria-label={`${node.type} node: ${node.title}. ${node.description}. ${isSelected ? 'Currently selected. Press Enter to close details.' : 'Press Enter to view details.'}`}
      aria-expanded={isSelected}
    >
      <motion.div
        className={`
          relative w-48 h-32 rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-200
          ${isSelected ? 'border-white ring-4 ring-cyan-300 focus:ring-4 focus:ring-cyan-400' : 'border-white/20 focus:ring-2 focus:ring-cyan-200'}
        `}
        style={{
          background: node.gradient,
          backdropFilter: 'blur(10px)'
        }}
        variants={selectedVariants}
        animate="animate"
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: node.bgPattern }}
        />
        
        {/* Content */}
        <div className="relative p-4 h-full flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: node.color }}
            >
              {node.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight mb-1">
                {node.title}
              </h3>
              <p className="text-white/80 text-xs leading-tight">
                {node.description}
              </p>
            </div>
          </div>
          
          {/* Stats */}
          {node.stats && node.stats.length > 0 && (
            <div className="flex gap-2 mt-2">
              {node.stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className="text-white font-bold text-xs">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-xs">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-300 rounded-xl"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

FlowNode.displayName = 'FlowNode';