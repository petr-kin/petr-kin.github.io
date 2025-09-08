'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  velocity: number
  opacity: number
}

interface ParticleCanvasProps {
  density?: number
  color?: string
  className?: string
}

export default function ParticleCanvas({ 
  density = 60, 
  color = 'rgba(75, 160, 255, 0.25)',
  className = '' 
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let width = canvas.clientWidth
    let height = canvas.clientHeight

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    const particles: Particle[] = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      velocity: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.2
    }))

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      for (const particle of particles) {
        // Update position
        particle.y -= particle.velocity
        
        // Reset particle when it goes off screen
        if (particle.y < -5) {
          particle.y = height + 5
          particle.x = Math.random() * width
        }
        
        // Add gentle horizontal sway
        particle.x += Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 0.2

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    resize()
    animate()

    const handleResize = () => {
      resize()
      // Redistribute particles on resize
      particles.forEach(particle => {
        particle.x = Math.random() * width
        particle.y = Math.random() * height
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [density, color])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}