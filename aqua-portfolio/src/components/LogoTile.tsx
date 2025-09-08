'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, MouseEvent } from 'react'
import Image from 'next/image'

interface LogoTileProps {
  logo: string
  name: string
  category?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LogoTile({ logo, name, category, size = 'md' }: LogoTileProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { damping: 30, stiffness: 300 })
  const mouseYSpring = useSpring(y, { damping: 30, stiffness: 300 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"])

  const sizeClasses = {
    sm: 'w-16 h-16 p-3',
    md: 'w-20 h-20 p-4',
    lg: 'w-24 h-24 p-5'
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const xPct = (mouseX / width) - 0.5
    const yPct = (mouseY / height) - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={`
        relative ${sizeClasses[size]} rounded-2xl cursor-pointer
        bg-white/80 backdrop-blur-sm border border-white/30
        shadow-lg shadow-black/10 group overflow-hidden
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Image 
          src={logo} 
          alt={name}
          width={64}
          height={64}
          className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
        />
      </div>
      
      {/* Floating label */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
      >
        {name}
        {category && <div className="text-xs text-slate-400">{category}</div>}
      </motion.div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-aqua-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
    </motion.div>
  )
}