'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AquaLayoutProps {
  children: ReactNode
}

export default function AquaLayout({ children }: AquaLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/expertise', label: 'Expertise' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/blog', label: 'Blog' },
    { href: '/#contact', label: 'Contact' }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <style jsx global>{`
        @keyframes subtle-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .glass-shimmer {
          background: linear-gradient(
            90deg,
            transparent 30%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: subtle-shimmer 8s ease-in-out infinite;
        }

        .glass-depth {
          box-shadow: 
            0 0.5px 0 1px rgba(255, 255, 255, 0.23) inset,
            0 1px 0 0 rgba(255, 255, 255, 0.66) inset,
            0 4px 16px rgba(0, 0, 0, 0.12),
            0 1px 3px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Simplified background - single subtle gradient */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
        {/* Single floating orb - very subtle */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-100/20 blur-3xl rounded-full" />
      </div>

      {/* Navigation */}
      <motion.header 
        className="fixed top-0 w-full z-50 glass-depth"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Glass shimmer overlay */}
        <div className="absolute inset-0 glass-shimmer opacity-30 pointer-events-none" />
        
        <nav className="relative mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo - Refined */}
          <motion.a
            href="/"
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <div 
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">PK</span>
              </div>
              {/* Glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">Test Intelligence</div>
              <div className="text-sm font-semibold text-gray-900">Engineer</div>
            </div>
          </motion.a>

          {/* Navigation links - Glass pill container */}
          <div 
            className="hidden md:flex items-center gap-1 px-1 py-1 rounded-2xl"
            style={{
              background: 'rgba(248, 250, 252, 0.8)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            }}
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 rounded-xl transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                style={{
                  color: hoveredIndex === index ? '#000' : '#4b5563',
                  fontWeight: hoveredIndex === index ? 500 : 400,
                }}
              >
                {/* Hover background with depth */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: `
                          inset 0 1px 1px rgba(255, 255, 255, 0.9),
                          inset 0 -1px 1px rgba(0, 0, 0, 0.04),
                          0 2px 8px rgba(0, 0, 0, 0.08)
                        `,
                      }}
                    />
                  )}
                </AnimatePresence>
                
                <span className="relative z-10">{item.label}</span>
              </motion.a>
            ))}
          </div>

          {/* CTA Button - Glass style */}
          <motion.a
            href="/#contact"
            className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: `
                inset 0 1px 1px rgba(255, 255, 255, 0.3),
                inset 0 -1px 1px rgba(0, 0, 0, 0.2),
                0 4px 12px rgba(37, 99, 235, 0.3)
              `,
            }}
          >
            <span>Let's Talk</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          {/* Mobile menu button */}
          <motion.button 
            className="md:hidden p-2.5 rounded-xl"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'rgba(248, 250, 252, 0.8)',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <svg width="18" height="12" fill="none" viewBox="0 0 18 12" stroke="currentColor">
              {!isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M0 1h18M0 6h18M0 11h18"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l16 16M1 17L17 1"/>
              )}
            </svg>
          </motion.button>
        </nav>

        {/* Bottom edge highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </motion.header>

      {/* Mobile Menu - Glass style */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel with glass effect */}
            <motion.div
              className="absolute top-20 left-4 right-4 overflow-hidden rounded-2xl glass-depth"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              <div className="p-6">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="font-medium">{item.label}</span>
                    </motion.a>
                  ))}
                </div>

                <motion.a
                  href="/#contact"
                  className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  Let's Talk
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative pt-16">
        {children}
      </main>

      {/* Footer - Simplified */}
      <footer className="relative border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              {[
                { icon: 'GH', href: '#', label: 'GitHub' },
                { icon: 'LI', href: '#', label: 'LinkedIn' },
                { icon: 'X', href: '#', label: 'X' },
                { icon: 'CV', href: '#', label: 'Resume' }
              ].map((social) => (
                <motion.a
                  key={social.icon}
                  href={social.href}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-600 hover:text-gray-900 transition-all duration-200"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              © 2025 Petr Kindlmann. Test Intelligence Engineer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}