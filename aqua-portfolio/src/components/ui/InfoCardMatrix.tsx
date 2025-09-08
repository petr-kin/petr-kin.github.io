'use client'

import { useEffect, useRef } from 'react'

interface InfoCardMatrixProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export default function InfoCardMatrix({ className = '', intensity = 'medium' }: InfoCardMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check if device is mobile for performance optimization
    const isMobile = window.innerWidth < 768
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      // Use device pixel ratio for crisp rendering, but limit on mobile
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()

    // Matrix characters - more tech-focused
    const matrix = 'QATEST01{}[];()<>=!@#$%^&*+-_|\\/:?'
    const matrixArray = matrix.split('')

    const fontSize = intensity === 'low' ? 12 : intensity === 'medium' ? 14 : 16
    const columns = Math.floor(canvas.width / fontSize)

    const drops: number[] = []

    // Intensity-based settings with mobile optimization
    const intensitySettings = {
      low: { 
        colors: ['rgba(6, 182, 212, 0.15)', 'rgba(14, 165, 233, 0.12)'],
        speed: isMobile ? 0.2 : 0.3,
        fadeAlpha: 0.08,
        columns: isMobile ? Math.floor(columns * 0.6) : columns
      },
      medium: { 
        colors: ['rgba(6, 182, 212, 0.25)', 'rgba(14, 165, 233, 0.20)', 'rgba(59, 130, 246, 0.18)'],
        speed: isMobile ? 0.3 : 0.4,
        fadeAlpha: 0.06,
        columns: isMobile ? Math.floor(columns * 0.7) : columns
      },
      high: { 
        colors: ['rgba(6, 182, 212, 0.35)', 'rgba(14, 165, 233, 0.30)', 'rgba(59, 130, 246, 0.25)', 'rgba(168, 85, 247, 0.20)'],
        speed: isMobile ? 0.4 : 0.6,
        fadeAlpha: 0.04,
        columns: isMobile ? Math.floor(columns * 0.8) : columns
      }
    }

    const settings = intensitySettings[intensity]
    
    // Initialize drops array with optimized column count
    for (let i = 0; i < settings.columns; i++) {
      drops[i] = Math.random() * -100
    }

    function draw() {
      if (!ctx || !canvas) return

      // Fade effect
      ctx.fillStyle = `rgba(255, 255, 255, ${settings.fadeAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)]
        const colorIndex = Math.floor(Math.random() * settings.colors.length)
        
        // Enhanced gradient effect
        const opacity = Math.max(0.1, 1 - (drops[i] * fontSize) / canvas.height)
        const enhancedOpacity = Math.min(0.8, opacity * 0.4)
        ctx.fillStyle = settings.colors[colorIndex].replace(/[\d.]+\)/, `${enhancedOpacity})`)
        
        // Subtle glow for higher intensities
        if (intensity !== 'low') {
          ctx.shadowColor = settings.colors[colorIndex].replace(/[\d.]+\)/, '0.2)')
          ctx.shadowBlur = 1
        }
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        // Reset shadow
        ctx.shadowBlur = 0

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
        }

        drops[i] += settings.speed
      }
    }

    const interval = setInterval(draw, isMobile ? 80 : 60) // Slower on mobile for better performance

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none opacity-70 ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}