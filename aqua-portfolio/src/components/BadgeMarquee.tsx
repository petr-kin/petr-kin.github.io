'use client'

import { Badge } from '@/components/ui/badge'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface BadgeMarqueeProps {
  badges: string[]
  speed?: number
  className?: string
}

export default function BadgeMarquee({ 
  badges, 
  speed = 30, 
  className = '' 
}: BadgeMarqueeProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  
  // Duplicate badges to create seamless loop
  const duplicatedBadges = [...badges, ...badges]

  return (
    <div ref={ref} className={`overflow-hidden whitespace-nowrap ${className}`} style={{ transform: 'translateZ(0)' }}>
      <motion.div
        className="inline-flex gap-3"
        style={{ willChange: isInView ? 'transform' : 'auto' }}
        animate={isInView ? {
          x: [0, -50 + '%']
        } : {}}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {duplicatedBadges.map((badge, index) => (
          <Badge
            key={`${badge}-${index}`}
            variant="secondary"
            className="px-4 py-2 bg-aqua-50 text-aqua-700 border border-aqua-200/50 hover:bg-aqua-100 transition-colors duration-200 flex-shrink-0 text-sm font-medium"
          >
            {badge}
          </Badge>
        ))}
      </motion.div>
    </div>
  )
}