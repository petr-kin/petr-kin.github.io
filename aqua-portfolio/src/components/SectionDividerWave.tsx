'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface SectionDividerWaveProps {
  variant?: 'aqua' | 'teal' | 'gradient'
  direction?: 'up' | 'down'
  height?: number
  className?: string
}

export default function SectionDividerWave({ 
  variant = 'gradient', 
  direction = 'down',
  height = 100,
  className = ''
}: SectionDividerWaveProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const getColors = () => {
    switch (variant) {
      case 'aqua':
        return 'fill-blue-200'
      case 'teal':
        return 'fill-blue-200'
      case 'gradient':
      default:
        return 'fill-blue-200'
    }
  }

  const transform = direction === 'up' ? 'rotate(180deg)' : 'rotate(0deg)'

  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ height, transform: 'translateZ(0)', willChange: isInView ? 'transform' : 'auto' }}>
      {variant === 'gradient' && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ transform }}
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(191 219 254)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="rgb(147 197 253)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(191 219 254)" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Animated wave paths */}
          <motion.path
            d="M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z"
            fill="url(#waveGradient)"
            initial={{ d: "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z" }}
            animate={isInView ? {
              d: [
                "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z",
                "M0,120 C200,80 400,20 600,40 C800,60 1000,120 1200,100 L1200,120 Z",
                "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z"
              ]
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Secondary wave for depth */}
          <motion.path
            d="M0,120 C300,80 600,40 900,60 C1050,70 1150,90 1200,100 L1200,120 Z"
            fill="url(#waveGradient)"
            opacity={0.6}
            initial={{ d: "M0,120 C300,80 600,40 900,60 C1050,70 1150,90 1200,100 L1200,120 Z" }}
            animate={isInView ? {
              d: [
                "M0,120 C300,80 600,40 900,60 C1050,70 1150,90 1200,100 L1200,120 Z",
                "M0,120 C250,100 550,20 850,80 C1000,100 1100,80 1200,90 L1200,120 Z",
                "M0,120 C300,80 600,40 900,60 C1050,70 1150,90 1200,100 L1200,120 Z"
              ]
            } : {}}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </svg>
      )}

      {variant !== 'gradient' && (
        <svg
          className={`absolute inset-0 w-full h-full ${getColors()}`}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ transform }}
        >
          <motion.path
            d="M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z"
            initial={{ d: "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z" }}
            animate={isInView ? {
              d: [
                "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z",
                "M0,120 C200,80 400,20 600,40 C800,60 1000,120 1200,100 L1200,120 Z",
                "M0,120 C150,100 350,0 600,20 C850,40 1050,100 1200,80 L1200,120 Z"
              ]
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      )}
    </div>
  )
}