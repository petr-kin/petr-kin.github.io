'use client'

import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Matrix rain effect with professional colors
    const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+=-[]{}|;:,.<>?'
    const matrixArray = matrix.split('')

    const fontSize = 14
    const columns = canvas.width / fontSize

    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    const colors = [
      'rgba(6, 182, 212, 0.35)',   // Cyan-500 enhanced visibility
      'rgba(14, 165, 233, 0.30)',  // Blue-500 enhanced
      'rgba(59, 130, 246, 0.25)',  // Blue-400 enhanced
      'rgba(16, 185, 129, 0.20)',  // Emerald-500 for variety
      'rgba(168, 85, 247, 0.18)',  // Purple-500 for depth
    ]

    function draw() {
      if (!ctx || !canvas) return

      // Enhanced fade effect for better visibility
      ctx.fillStyle = 'rgba(245, 243, 240, 0.08)' // Alpine Oat with enhanced transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)]
        const colorIndex = Math.floor(Math.random() * colors.length)
        
        // Enhanced gradient effect for falling characters
        const opacity = Math.max(0.1, 1 - (drops[i] * fontSize) / canvas.height)
        const enhancedOpacity = Math.min(0.8, opacity * 0.4) // Increased visibility
        ctx.fillStyle = colors[colorIndex].replace(/[\d.]+\)/, `${enhancedOpacity})`)
        
        // Add subtle glow effect
        ctx.shadowColor = colors[colorIndex].replace(/[\d.]+\)/, '0.3)')
        ctx.shadowBlur = 2
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        // Reset shadow for next character
        ctx.shadowBlur = 0

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i] += 0.6 // Slightly faster for more dynamic effect
      }
    }

    const interval = setInterval(draw, 50)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-90"
        style={{ zIndex: 1 }}
      />
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-alpine-oat/0 via-alpine-oat/30 to-alpine-oat/0" />
      </div>
    </>
  )
}