'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ShimmerButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  className?: string
  variant?: 'primary' | 'secondary'
}

export default function ShimmerButton({ 
  children, 
  onClick, 
  href, 
  className = '', 
  variant = 'primary' 
}: ShimmerButtonProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-sm
    transition-all duration-300 transform-gpu overflow-hidden group
    ${variant === 'primary' 
      ? 'bg-gradient-to-r from-aqua-500 to-blue-500 text-white shadow-lg shadow-aqua-500/25' 
      : 'bg-white/10 backdrop-blur-sm text-slate-700 border border-white/20'
    }
    ${className}
  `

  const shimmerClasses = `
    absolute inset-0 -skew-x-12 bg-gradient-to-r 
    ${variant === 'primary' 
      ? 'from-transparent via-white/30 to-transparent' 
      : 'from-transparent via-aqua-300/40 to-transparent'
    }
    transform translate-x-[-100%] group-hover:translate-x-[200%] 
    transition-transform duration-700 ease-out
  `

  const content = (
    <motion.div
      className={baseClasses}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Shimmer effect */}
      <div className={shimmerClasses} />
      
      {/* Gradient border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-aqua-400/20 via-blue-400/20 to-aqua-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}