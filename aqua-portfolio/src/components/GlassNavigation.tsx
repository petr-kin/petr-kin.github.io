'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function GlassNavigation() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Transform scroll position to blur and opacity values
  const blurAmount = useTransform(scrollY, [0, 100, 200], [0, 4, 8])
  const opacity = useTransform(scrollY, [0, 100, 200], [0, 0.8, 0.95])
  const scale = useTransform(scrollY, [0, 100, 200], [0.95, 1, 1])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest > 10) // Show navigation sooner
    })
    return unsubscribe
  }, [scrollY])

  // Handle navigation with smooth scrolling for hash links
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (href.startsWith('/#')) {
      // Hash navigation - navigate to home and scroll
      const sectionId = href.substring(2) // Remove /#
      
      if (pathname !== '/') {
        // Navigate to home first, then scroll
        router.push('/')
        setTimeout(() => {
          const element = document.getElementById(sectionId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        // Already on home, just scroll
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } else {
      // Regular page navigation
      router.push(href)
    }
  }

  const navItems = [
    { href: '/#home', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/expertise', label: 'Expertise' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/chiisana', label: 'Chiisana' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' }
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-2xl border border-white/20"
          style={{
            backdropFilter: `blur(${blurAmount}px) saturate(180%)`,
            backgroundColor: `rgba(255, 255, 255, ${opacity})`,
            scale
          }}
        >
          <div className="flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavigation(item.href, e)}
                className="relative px-3 py-2 text-sm font-medium text-slate-700 hover:text-aqua-600 transition-colors group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-aqua-100/50"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-aqua-400/10 via-transparent to-blue-400/10 blur-xl -z-10" />
        </motion.nav>
      )}
    </AnimatePresence>
  )
}