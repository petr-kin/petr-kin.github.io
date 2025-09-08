'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, MouseEvent, ReactNode } from 'react'

interface MagneticCTAProps {
  children: ReactNode
  strength?: number
  className?: string
  onClick?: () => void
}

export default function MagneticCTA({ 
  children, 
  strength = 0.3, 
  className = '',
  onClick 
}: MagneticCTAProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { damping: 30, stiffness: 300 })
  const springY = useSpring(y, { damping: 30, stiffness: 300 })
  
  const rotateX = useTransform(springY, [-50, 50], [5, -5])
  const rotateY = useTransform(springX, [-50, 50], [-5, 5])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = event.clientX - centerX
    const distanceY = event.clientY - centerY
    
    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={`cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="relative transform-gpu"
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
      >
        {children}
        
        {/* Magnetic field visualization */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-aqua-400/20 to-blue-400/20 blur-xl opacity-0"
          whileHover={{ 
            opacity: 1,
            scale: 1.2,
            transition: { duration: 0.3 }
          }}
        />
      </motion.div>
    </motion.div>
  )
}