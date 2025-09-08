'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'
import { useRef } from 'react'
import ShimmerButton from './ShimmerButton'
import MagneticCTA from './MagneticCTA'

export default function HeroWave() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

  return (
    <section ref={containerRef} id="home" className="relative isolate overflow-hidden pt-32 pb-24 min-h-screen flex items-center">
      {/* Animated background blobs with parallax */}
      <motion.div 
        className="absolute -z-10 inset-0 pointer-events-none"
        style={{ y, opacity }}
      >
        <motion.div 
          className="absolute left-10 top-20 w-80 h-80 bg-aqua-300/30 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ['58% 42% 57% 43%', '40% 60% 45% 55%', '58% 42% 57% 43%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute right-20 top-32 w-96 h-96 bg-aqua-500/20 blur-3xl rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            borderRadius: ['40% 60% 45% 55%', '58% 42% 57% 43%', '40% 60% 45% 55%']
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute left-1/2 bottom-20 -translate-x-1/2 w-72 h-72 bg-aqua-400/15 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -50, 0],
            borderRadius: ['45% 55% 60% 40%', '60% 40% 45% 55%', '45% 55% 60% 40%']
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      <div className="mx-auto max-w-6xl px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-sm font-medium text-primary">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                QA-minded developer
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-midnight font-display">Clean code.</span>
                <span className="block text-midnight font-display">Precise tests.</span>
                <span className="block bg-aqua-gradient bg-clip-text text-transparent font-display">
                  Fluid design.
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              I design and automate websites with a focus on performance and reliability — then prove it with data.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <MagneticCTA>
                <ShimmerButton href="#projects">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </MagneticCTA>
              
              <MagneticCTA>
                <ShimmerButton variant="secondary" href="/Petr-Resume.pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Get Resume
                </ShimmerButton>
              </MagneticCTA>
            </motion.div>
          </motion.div>

          {/* Interactive visual element */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
              {/* Central hub */}
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-aqua-gradient shadow-aqua flex items-center justify-center text-white font-bold text-lg z-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                QA
              </motion.div>

              {/* Orbiting skill nodes */}
              {[
                { name: 'Playwright', angle: 0, distance: 120, delay: 0 },
                { name: 'TypeScript', angle: 72, distance: 140, delay: 0.2 },
                { name: 'React', angle: 144, distance: 110, delay: 0.4 },
                { name: 'Next.js', angle: 216, distance: 130, delay: 0.6 },
                { name: 'Tailwind', angle: 288, distance: 115, delay: 0.8 }
              ].map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="absolute"
                  animate={{
                    rotate: 360,
                    x: Math.cos((skill.angle * Math.PI) / 180) * skill.distance,
                    y: Math.sin((skill.angle * Math.PI) / 180) * skill.distance,
                  }}
                  transition={{
                    duration: 15 + index * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: skill.delay
                  }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-xs font-semibold text-primary cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    {skill.name.slice(0, 2)}
                  </motion.div>
                  
                  {/* Connection line */}
                  <div className="absolute top-1/2 left-1/2 w-px h-24 bg-aqua-300/30 -translate-x-1/2 -translate-y-full origin-bottom transform-gpu" />
                </motion.div>
              ))}

              {/* Floating particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-aqua-400"
                  animate={{
                    x: [0, Math.random() * 200 - 100],
                    y: [0, Math.random() * 200 - 100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}