'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface FlowConnectionType {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

interface FlowConnectionProps {
  connection: FlowConnectionType;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  isAnimated: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const FlowConnection = memo(({
  connection,
  fromPosition,
  toPosition,
  isAnimated,
  containerWidth,
  containerHeight
}: FlowConnectionProps) => {
  // Calculate path
  const pathData = useMemo(() => {
    const startX = fromPosition.x;
    const startY = fromPosition.y;
    const endX = toPosition.x;
    const endY = toPosition.y;
    
    // Calculate control points for a smooth curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Add some curvature
    const curvature = 50;
    const controlX1 = startX + (endX - startX) * 0.3;
    const controlY1 = startY - curvature;
    const controlX2 = endX - (endX - startX) * 0.3;
    const controlY2 = endY - curvature;
    
    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  }, [fromPosition, toPosition]);

  const pathLength = useMemo(() => {
    // Approximate path length for animation
    const dx = toPosition.x - fromPosition.x;
    const dy = toPosition.y - fromPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [fromPosition, toPosition]);

  return (
    <g>
      {/* Main path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#connectionGradient)"
        strokeWidth="2"
        strokeDasharray={isAnimated ? "5,5" : "none"}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      
      {/* Animated flow particles */}
      {isAnimated && (
        <motion.circle
          r="3"
          fill="#06b6d4"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ offsetPath: `path('${pathData}')` } as any}
        />
      )}
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.from}-${connection.to}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#06b6d4"
            opacity="0.8"
          />
        </marker>
        <linearGradient
          id="connectionGradient"
          gradientUnits="userSpaceOnUse"
          x1={fromPosition.x}
          y1={fromPosition.y}
          x2={toPosition.x}
          y2={toPosition.y}
        >
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Add arrow marker to path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="2"
        markerEnd={`url(#arrowhead-${connection.from}-${connection.to})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      
      {/* Connection label */}
      {connection.label && (
        <motion.text
          x={(fromPosition.x + toPosition.x) / 2}
          y={(fromPosition.y + toPosition.y) / 2 - 10}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {connection.label}
        </motion.text>
      )}
    </g>
  );
});

FlowConnection.displayName = 'FlowConnection';