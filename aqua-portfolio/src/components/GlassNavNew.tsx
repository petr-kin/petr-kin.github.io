'use client'

import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function GlassNavigation() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  
  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring physics for smooth 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), {
    stiffness: 300,
    damping: 30
  })
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), {
    stiffness: 300,
    damping: 30
  })
  
  // Enhanced scroll-based transformations
  const blurAmount = useTransform(scrollY, [0, 50, 150], [12, 20, 24])
  const opacity = useTransform(scrollY, [0, 50, 150], [0.4, 0.72, 0.88])
  const scale = useTransform(scrollY, [0, 50, 150], [0.98, 1, 1.02])
  const yOffset = useTransform(scrollY, [0, 100], [10, 0])
  
  // Glass refraction effect
  const glassDistortion = useTransform(scrollY, [0, 200], [1.02, 1])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest > 20)
    })
    return unsubscribe
  }, [scrollY])

  // Track mouse for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Handle navigation with smooth scrolling for hash links
  const handleNavigation = (href: string, e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setActiveIndex(index)
    
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2)
      
      if (pathname !== '/') {
        router.push('/')
        setTimeout(() => {
          const element = document.getElementById(sectionId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } else {
      router.push(href)
    }
  }

  const navItems = [
    { href: '/#home', label: 'Home', icon: '○' },
    { href: '/expertise', label: 'Expertise', icon: '◇' },
    { href: '/case-studies', label: 'Case Studies', icon: '□' },
    { href: '/blog', label: 'Blog', icon: '△' },
    { href: '/#contact', label: 'Contact', icon: '◈' }
  ]

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .glass-shimmer {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.7) 50%,
            transparent 60%
          );
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }

        .perspective-container {
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .glass-refraction {
          backdrop-filter: blur(20px) saturate(180%) brightness(1.1);
          -webkit-backdrop-filter: blur(20px) saturate(180%) brightness(1.1);
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <div className="perspective-container fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <motion.nav
              initial={{ y: -100, opacity: 0, rotateX: -15 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -100, opacity: 0, rotateX: 15 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.32, 0.72, 0, 1],
                opacity: { duration: 0.4 }
              }}
              className="glass-refraction relative px-8 py-4 rounded-2xl border border-white/30 shadow-2xl"
              style={{
                backdropFilter: `blur(${blurAmount}px) saturate(200%)`,
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                scale,
                y: yOffset,
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                boxShadow: `
                  0 10px 40px -10px rgba(0, 0, 0, 0.15),
                  0 20px 50px -20px rgba(0, 0, 0, 0.1),
                  inset 0 1px 1px rgba(255, 255, 255, 0.6),
                  inset 0 -1px 1px rgba(0, 0, 0, 0.05)
                `,
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Glass refraction layer */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-50 glass-shimmer pointer-events-none"
                style={{ mixBlendMode: 'overlay' }}
              />
              
              {/* Navigation items container */}
              <div className="relative flex items-center gap-2">
                {/* Sliding indicator */}
                <motion.div
                  className="absolute h-9 bg-black/8 rounded-xl"
                  initial={false}
                  animate={{
                    x: activeIndex * 120,
                    width: navItems[activeIndex].label.length > 8 ? 130 : 110,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e, index)}
                    className="relative px-5 py-2 text-sm font-medium transition-all duration-300 cursor-pointer select-none z-10"
                    initial={{ opacity: 0, y: 20, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      delay: index * 0.08,
                      duration: 0.5,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      color: activeIndex === index ? '#000' : '#64748b',
                      fontWeight: activeIndex === index ? 600 : 400,
                      textShadow: activeIndex === index 
                        ? '0 1px 2px rgba(0, 0, 0, 0.05)' 
                        : 'none',
                    }}
                  >
                    <span className="relative flex items-center gap-2">
                      {/* Mini icon */}
                      <span 
                        className="text-xs opacity-40"
                        style={{
                          transform: activeIndex === index ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    
                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-purple-400/0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ filter: 'blur(8px)' }}
                    />
                  </motion.a>
                ))}
              </div>
              
              {/* Depth shadow layers */}
              <div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
                style={{ transform: 'translateZ(-10px)' }}
              />
              <div 
                className="absolute inset-0 rounded-2xl shadow-lg pointer-events-none"
                style={{ 
                  transform: 'translateZ(-20px)',
                  opacity: 0.3,
                }}
              />
              
              {/* Edge light reflection */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
              
              {/* Side glass panels for 3D effect */}
              <div 
                className="absolute -left-2 top-2 bottom-2 w-1 rounded-l-lg pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)',
                  transform: 'rotateY(45deg)',
                  transformOrigin: 'right',
                }}
              />
              <div 
                className="absolute -right-2 top-2 bottom-2 w-1 rounded-r-lg pointer-events-none"
                style={{
                  background: 'linear-gradient(-90deg, rgba(255,255,255,0.2), transparent)',
                  transform: 'rotateY(-45deg)',
                  transformOrigin: 'left',
                }}
              />
            </motion.nav>
            
            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                  x: [0, (i - 1) * 50, (i - 1) * 25],
                  y: [0, -20, -10],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{
                  left: `${50 + i * 20}%`,
                  filter: 'blur(0.5px)',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  )
}