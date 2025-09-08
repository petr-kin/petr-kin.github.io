'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { 
  Code2, 
  TestTube, 
  Sparkles, 
  Zap, 
  Brain, 
  Rocket,
  Globe,
  Heart,
  Coffee,
  Music
} from 'lucide-react'

const skills = [
  { name: 'QA Automation', level: 95, color: 'from-cyan-400 to-blue-500' },
  { name: 'React/Next.js', level: 90, color: 'from-blue-400 to-indigo-500' },
  { name: 'TypeScript', level: 88, color: 'from-indigo-400 to-purple-500' },
  { name: 'Testing Frameworks', level: 92, color: 'from-purple-400 to-pink-500' },
  { name: 'CI/CD', level: 85, color: 'from-pink-400 to-red-500' },
  { name: 'Performance Optimization', level: 87, color: 'from-red-400 to-orange-500' }
]

const interests = [
  { icon: Coffee, label: 'Tea Connoisseur', rotate: -5 },
  { icon: Music, label: 'Music Producer', rotate: 3 },
  { icon: Globe, label: 'Travel Explorer', rotate: -3 },
  { icon: Heart, label: 'Open Source', rotate: 5 }
]

// Mini Quiz - Test your tech knowledge
const MiniQuiz = () => {
  const originalMessage = "QA-minded developer crafting bulletproof digital experiences with a passion for quality and innovation"
  
  const questions = [
    {
      q: "What does TDD stand for?",
      options: ["Test Driven Development", "Total Data Design", "Technical Design Document"],
      correct: 0
    },
    {
      q: "Which HTTP status indicates success?",
      options: ["404", "200", "500"],
      correct: 1
    },
    {
      q: "What's the best practice for API testing?",
      options: ["Test only happy paths", "Test edge cases & errors", "Skip negative tests"],
      correct: 1
    }
  ]
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 1)
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setIsCompleted(true)
      }
    }, 1500)
  }
  
  if (isCompleted) {
    const passed = score >= 2 // Need 2/3 to unlock
    
    if (passed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <p className="text-xl md:text-2xl text-cyan-100/80 max-w-2xl mx-auto leading-relaxed mb-4">
            {originalMessage}
          </p>
          <p className="text-sm text-cyan-400/70 text-center">
            Quiz completed! Score: {score}/3 ✨
          </p>
        </motion.div>
      )
    } else {
      return (
        <div className="text-center">
          <p className="text-cyan-100/60 mb-4">Score: {score}/3 - Try again?</p>
          <button
            onClick={() => {
              setCurrentQuestion(0)
              setScore(0)
              setSelectedAnswer(null)
              setShowResult(false)
              setIsCompleted(false)
            }}
            className="px-4 py-2 bg-cyan-400/20 text-cyan-300 rounded-lg hover:bg-cyan-400/30 transition-colors"
          >
            Retry Quiz
          </button>
        </div>
      )
    }
  }
  
  const currentQ = questions[currentQuestion]
  
  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex justify-center mb-6 space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentQuestion 
                ? 'bg-cyan-400' 
                : index < currentQuestion 
                  ? 'bg-cyan-600' 
                  : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
      
      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <h3 className="text-lg text-cyan-100 mb-4 text-center font-medium">
          {currentQ.q}
        </h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            let buttonClass = "w-full p-3 rounded-lg border transition-all duration-200 text-left"
            
            if (selectedAnswer === null) {
              buttonClass += " bg-slate-800/30 border-slate-600/50 text-slate-300 hover:border-cyan-400/50 hover:bg-slate-700/30"
            } else if (index === currentQ.correct) {
              buttonClass += " bg-green-400/20 border-green-400 text-green-300"
            } else if (index === selectedAnswer) {
              buttonClass += " bg-red-400/20 border-red-400 text-red-300"
            } else {
              buttonClass += " bg-slate-800/20 border-slate-600/30 text-slate-500"
            }
            
            return (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                className={buttonClass}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                {option}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
      
      <p className="text-xs text-cyan-400/60 text-center">
        {showResult 
          ? (selectedAnswer === currentQ.correct ? "Correct! ✓" : "Wrong answer ✗")
          : "Choose the correct answer"
        }
      </p>
    </div>
  )
}

// Journey Memory Game - Interactive card flip game
const JourneyMemoryGame = () => {
  const journeyCards = [
    { id: 1, icon: TestTube, title: "QA Engineer", year: "2019" },
    { id: 2, icon: Code2, title: "Full-Stack Dev", year: "2021" },
    { id: 3, icon: Sparkles, title: "Test Automation", year: "2022" },
    { id: 4, icon: Zap, title: "Tech Lead", year: "2024" }
  ]
  
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])
  const [gameComplete, setGameComplete] = useState(false)
  
  // Shuffle and duplicate cards for memory game (fixed positions for SSR)
  const shuffledOrder = [0, 5, 2, 7, 1, 4, 6, 3] // Pre-defined shuffle order
  const gameCards = [...journeyCards, ...journeyCards]
    .map((card, index) => ({ ...card, gameId: index }))
    .sort((a, b) => shuffledOrder.indexOf(a.gameId) - shuffledOrder.indexOf(b.gameId))
  
  const handleCardClick = (gameId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(gameId) || matchedCards.includes(gameId)) {
      return
    }
    
    const newFlipped = [...flippedCards, gameId]
    setFlippedCards(newFlipped)
    
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped
      const firstCard = gameCards.find(c => c.gameId === first)
      const secondCard = gameCards.find(c => c.gameId === second)
      
      if (firstCard?.id === secondCard?.id) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => [...prev, first, second])
          setFlippedCards([])
          
          if (matchedCards.length + 2 === gameCards.length) {
            setGameComplete(true)
          }
        }, 600)
      } else {
        // No match, flip back
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
    }
  }
  
  const resetGame = () => {
    setFlippedCards([])
    setMatchedCards([])
    setGameComplete(false)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <p className="text-cyan-400 text-sm font-medium">🎉 Journey Complete!</p>
          <button
            onClick={resetGame}
            className="text-xs text-slate-400 hover:text-cyan-300 underline mt-1"
          >
            Play Again
          </button>
        </motion.div>
      )}
      
      <div className="grid grid-cols-4 gap-3">
        {gameCards.map((card) => {
          const isFlipped = flippedCards.includes(card.gameId) || matchedCards.includes(card.gameId)
          const Icon = card.icon
          
          return (
            <motion.div
              key={card.gameId}
              onClick={() => handleCardClick(card.gameId)}
              className="aspect-square cursor-pointer relative"
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Card */}
              <div className="relative w-full h-full preserve-3d" style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}>
                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-cyan-400/20 rounded-full" />
                </div>
                
                {/* Front of card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-cyan-400/10 to-blue-400/10 backdrop-blur-sm border border-cyan-400/40 rounded-xl p-3 flex flex-col items-center justify-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <Icon className="w-8 h-8 text-cyan-400 mb-1" />
                  <div className="text-center">
                    <p className="text-xs text-cyan-300 font-medium leading-tight">{card.title}</p>
                    <p className="text-xs text-cyan-400/70">{card.year}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-3xl -z-10" />
    </motion.div>
  )
}

// ASCII Tea Animation - Minimalistic brewing ceremony
const TeaBrewingAnimation = () => {
  const [frame, setFrame] = useState(0)
  
  const frames = [
    // Frame 0: Empty teapot
    `    ___
   /   \\
  |  o  |
   \\___/
    |||
    ^^^`,
    
    // Frame 1: Adding tea leaves
    `    ___
   /   \\
  | ∘∘∘ |
   \\___/
    |||
    ^^^`,
    
    // Frame 2: Pouring water
    `    ___   ░░░
   /   \\  ░░░
  | ∘∘∘ | ░░
   \\___/
    |||
    ^^^`,
    
    // Frame 3: Steeping
    `    ___
   /~~~\\
  |∘~~~∘|
   \\___/
    |||
    ^^^`,
    
    // Frame 4: Steam rising
    `  ~ ~ ~
    ___
   /~~~\\
  |∘~~~∘|
   \\___/
    |||
    ^^^`,
    
    // Frame 5: Perfect brew
    `  ☁ ☁ ☁
    ___
   /███\\
  |∘███∘|
   \\___/
    |||
    ^^^`
  ]
  
  const messages = [
    "Starting the ceremony...",
    "Adding premium tea leaves",
    "Pouring hot water at 80°C", 
    "Steeping for 3 minutes",
    "Aromatic steam rising",
    "Perfect brew achieved!"
  ]
  
  // Auto-advance frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => prev < frames.length - 1 ? prev + 1 : 0)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <motion.div
        key={`frame-${frame}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <pre className="text-cyan-300 text-sm sm:text-base font-mono leading-tight">
          {frames[frame]}
        </pre>
      </motion.div>
      
      <motion.p
        key={`message-${frame}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-cyan-100/70 text-sm mb-4"
      >
        {messages[frame]}
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-cyan-400/60 text-xs italic"
      >
        "Like debugging code, perfect tea requires patience and precision."
      </motion.p>
    </motion.div>
  )
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null)
  
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity }}
      >
        {/* Animated Background Dots */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const positions = [
              [15, 25], [75, 15], [25, 65], [85, 75], [45, 35], 
              [90, 45], [10, 80], [65, 20], [35, 85], [80, 55],
              [20, 50], [70, 70], [55, 30], [30, 10], [60, 80],
              [40, 60], [85, 25], [15, 70], [50, 45], [75, 90]
            ]
            const [x, y] = positions[i]
            
            return (
              <motion.div
                key={i}
                className="absolute z-10 w-2 h-2 bg-cyan-400/40 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`
                }}
                animate={{
                  x: [-8, 8, -8],
                  y: [-8, 8, -8],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 8 + (i % 8),
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2
                }}
              />
            )
          })}
        </div>

        <motion.div 
          className="relative z-10 text-center px-6"
          style={{ y: textY }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-50" />
              <h1 className="relative text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                About Me
              </h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-cyan-100/80 max-w-2xl mx-auto leading-relaxed"
          >
            QA-minded developer crafting bulletproof digital experiences 
            with a passion for quality and innovation
          </motion.p>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              The Journey
            </h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                Started as a QA engineer obsessed with breaking things, 
                evolved into a developer who builds unbreakable things.
              </p>
              <p className="leading-relaxed">
                My unique perspective from both sides of development gives me 
                superpowers in creating robust, user-focused applications that 
                don't just work — they excel.
              </p>
              <p className="leading-relaxed">
                When I'm not crafting code or hunting bugs, you'll find me 
                exploring new technologies, contributing to open source, or 
                perfecting my tea brewing ceremony.
              </p>
            </div>
          </motion.div>

          <JourneyMemoryGame />
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            Skills & Expertise
          </motion.h2>

          <div className="space-y-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredSkill(index)}
                onHoverEnd={() => setHoveredSkill(null)}
                className="relative"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 font-medium">{skill.name}</span>
                  <motion.span 
                    className="text-cyan-400"
                    animate={{ opacity: hoveredSkill === index ? 1 : 0.7 }}
                  >
                    {skill.level}%
                  </motion.span>
                </div>
                <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Quiz Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-2xl font-semibold text-center mb-8 text-cyan-300">
              Test Your Knowledge
            </h3>
            <MiniQuiz />
          </motion.div>
        </div>
      </section>

      {/* Beyond the Code */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            Beyond the Code
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-cyan-100/80 leading-relaxed"
          >
            When I'm not debugging code, you'll find me perfecting my tea brewing ceremony - 
            because like quality software, great tea requires patience, precision, and attention to detail.
          </motion.p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            My Philosophy
          </h2>
          <blockquote className="text-xl text-slate-300 italic leading-relaxed">
            "Quality is not an act, it's a habit. Every line of code is an opportunity 
            to create something exceptional, tested, and user-focused."
          </blockquote>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 text-white">
            Let's Build Something Amazing
          </h2>
          <div className="flex gap-4 justify-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-400/25 transition-shadow"
            >
              Get In Touch
            </motion.a>
            <motion.a
              href="/case-studies"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border border-cyan-400/50 text-cyan-400 font-semibold rounded-full hover:bg-cyan-400/10 transition-colors"
            >
              View My Work
            </motion.a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}