'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Heart, Play, Sparkles, Star, Users, Video } from 'lucide-react'

// Character data
const characters = [
  {
    id: 'neko',
    name: 'Neko Sensei',
    emoji: '🐱',
    color: 'from-yellow-200 to-orange-200',
    description: 'Wise cream-colored cat with tiny glasses',
    personality: 'Patient teacher who loves sharing knowledge',
    role: 'The Professor'
  },
  {
    id: 'doge',
    name: 'Doge Coach',
    emoji: '🐕',
    color: 'from-orange-300 to-red-300',
    description: 'Energetic orange Shiba Inu with whistle',
    personality: 'Motivational and always encouraging',
    role: 'The Motivator'
  },
  {
    id: 'capy',
    name: 'Capy Calm',
    emoji: '🦫',
    color: 'from-green-200 to-teal-200',
    description: 'Peaceful brown capybara with lotus flower',
    personality: 'Zen master of mindfulness and peace',
    role: 'The Zen Master'
  },
  {
    id: 'axolotl',
    name: 'Axolotl LOL',
    emoji: '🦎',
    color: 'from-pink-200 to-purple-200',
    description: 'Creative pink axolotl with art supplies',
    personality: 'Artistic soul who finds joy in everything',
    role: 'The Artist'
  },
  {
    id: 'trash',
    name: 'Trash Panda',
    emoji: '🦝',
    color: 'from-gray-300 to-slate-300',
    description: 'Clever gray raccoon with detective gear',
    personality: 'Curious investigator and problem solver',
    role: 'The Detective'
  }
]

// Silent films data
const silentFilms = [
  {
    title: 'The Great Train Heist',
    year: '1903',
    duration: '12 min',
    thumbnail: '🚂',
    characters: ['Trash Panda', 'Doge Coach']
  },
  {
    title: 'A Trip to the Moon',
    year: '1902',
    duration: '15 min',
    thumbnail: '🌙',
    characters: ['Axolotl LOL', 'Neko Sensei']
  },
  {
    title: 'The Gold Rush',
    year: '1925',
    duration: '20 min',
    thumbnail: '⛏️',
    characters: ['All Characters']
  }
]

export default function ChiisanaPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hoveredFilm, setHoveredFilm] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Kawaii Elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${(i * 23) % 100}%`,
                top: `${(i * 17) % 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            >
              {['✨', '⭐', '💖', '🌸', '🎀'][i % 5]}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 text-center px-6">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1.5 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-bold text-navy-900 mb-2">
              Chiisana
            </h1>
            <p className="text-3xl md:text-4xl text-gray-600 font-light">
              小さな
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-700 mb-12 font-medium"
          >
            Where little friends create big adventures
          </motion.p>

          {/* Character Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-4 mb-12"
          >
            {characters.map((char, index) => (
              <motion.div
                key={char.id}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer"
                onClick={() => setSelectedCharacter(char.id)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {char.emoji}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            Meet Our Little Friends
          </motion.button>
        </div>
      </section>

      {/* Character Showcase */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 text-navy-900"
          >
            Meet the Characters
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-gradient-to-br ${char.color} rounded-3xl p-8 shadow-xl cursor-pointer transform transition-all`}
                onClick={() => setSelectedCharacter(char.id)}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{char.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{char.name}</h3>
                  <p className="text-sm text-gray-700 font-medium mb-4">{char.role}</p>
                  <p className="text-gray-600">{char.personality}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Silent Films Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 text-navy-900"
          >
            Silent Film Remakes
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {silentFilms.map((film, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                onHoverStart={() => setHoveredFilm(index)}
                onHoverEnd={() => setHoveredFilm(null)}
                className="relative group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  {/* Film Poster */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                    <div className="text-8xl">{film.thumbnail}</div>
                    
                    {/* Play Button Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredFilm === index ? 1 : 0 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <Play className="w-20 h-20 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Film Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{film.title}</h3>
                    <p className="text-gray-600 mb-2">Original: {film.year}</p>
                    <p className="text-gray-600 mb-3">Duration: {film.duration}</p>
                    <div className="flex flex-wrap gap-2">
                      {film.characters.map((char, i) => (
                        <span key={i} className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-8 text-navy-900"
          >
            Join Our Community
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-12"
          >
            Follow us for daily doses of kawaii education and entertainment!
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6 mb-12"
          >
            {['TikTok', 'Instagram', 'YouTube', 'Twitter'].map((social, index) => (
              <motion.a
                key={social}
                href={`#${social.toLowerCase()}`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              >
                {social[0]}
              </motion.a>
            ))}
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Get Kawaii Updates! 💌
            </h3>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-l-full border-2 border-pink-300 focus:outline-none focus:border-purple-400"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-r-full hover:shadow-lg transition-shadow">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Character Modal */}
      {selectedCharacter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedCharacter(null)}
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {characters.find(c => c.id === selectedCharacter) && (
              <>
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {characters.find(c => c.id === selectedCharacter)?.emoji}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    {characters.find(c => c.id === selectedCharacter)?.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {characters.find(c => c.id === selectedCharacter)?.description}
                  </p>
                  <p className="text-gray-700">
                    {characters.find(c => c.id === selectedCharacter)?.personality}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-full w-full"
                >
                  Close
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}