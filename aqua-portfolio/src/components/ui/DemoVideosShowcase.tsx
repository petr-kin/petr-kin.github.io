'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InfoCardMatrix from '@/components/ui/InfoCardMatrix'

interface DemoVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  technologies: string[]
  category: 'automation' | 'ai' | 'performance' | 'security'
  duration: string
  highlights: string[]
}

const demoVideos: DemoVideo[] = [
  {
    id: 'test-doctor',
    title: 'AI Test Doctor in Action',
    description: 'Watch as our AI-powered test healing system automatically fixes broken selectors and maintains test stability without human intervention.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: undefined,
    technologies: ['Playwright', 'Claude AI', 'Computer Vision', 'ML'],
    category: 'ai',
    duration: '3:24',
    highlights: [
      'Automatic selector healing',
      'Real-time DOM analysis', 
      'Zero-downtime test recovery',
      '96% success rate demonstration'
    ]
  },
  {
    id: 'cnc-shadow',
    title: 'CNC Shadow Crawling System',
    description: 'Advanced web crawling system that discovers and maps complex web applications while respecting privacy and consent flows.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: undefined, 
    technologies: ['Playwright', 'TypeScript', 'Pattern Recognition', 'GDPR Compliance'],
    category: 'automation',
    duration: '4:17',
    highlights: [
      'Intelligent consent handling',
      'Dynamic pattern discovery',
      'Multi-site compatibility',
      'Privacy-first approach'
    ]
  },
  {
    id: 'ramenator',
    title: 'Ramenator Performance Testing',
    description: 'Full-stack food delivery application with comprehensive performance testing, load balancing, and user experience optimization.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: undefined,
    technologies: ['React', 'Node.js', 'Artillery', 'Performance Analytics'],
    category: 'performance',
    duration: '5:42',
    highlights: [
      'End-to-end user journey testing',
      'Real-time performance monitoring',
      'Load balancing optimization',
      'UX metrics analysis'
    ]
  }
]

const categoryColors = {
  automation: 'from-green-500 to-emerald-500',
  ai: 'from-purple-500 to-pink-500',
  performance: 'from-orange-500 to-red-500',
  security: 'from-blue-500 to-cyan-500'
}

const categoryIcons = {
  automation: '⚙️',
  ai: '🤖',
  performance: '🚀',
  security: '🔒'
}

export default function DemoVideosShowcase() {
  const [selectedVideo, setSelectedVideo] = useState(demoVideos[0])
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const handleVideoError = () => {
    setVideoError(true)
  }

  const handleVideoLoaded = () => {
    setVideoLoaded(true)
    setVideoError(false)
  }

  const PlayIcon = () => (
    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="relative bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center overflow-hidden">
            <InfoCardMatrix intensity="low" className="rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  Live Demos
                </Badge>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-midnight mb-6 tracking-tight leading-tight">
                QA Solutions in Action
              </h2>
              <p className="text-xl md:text-2xl text-midnight-300 max-w-4xl mx-auto font-light leading-relaxed">
                See real-world implementations of <span className="font-semibold text-red-600">AI-powered testing</span> and <span className="font-semibold text-orange-600">automated quality assurance</span> solutions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video List */}
          <div className="space-y-4">
            {demoVideos.map((video) => (
              <Card
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video)
                  setVideoError(false)
                }}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedVideo.id === video.id
                    ? 'border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg'
                    : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:border-red-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${categoryColors[video.category]} flex items-center justify-center`}>
                    <span className="text-sm">{categoryIcons[video.category]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-midnight text-sm">{video.title}</h3>
                    <span className="text-xs text-midnight-300">{video.duration}</span>
                  </div>
                </div>
                <p className="text-xs text-midnight-300 leading-relaxed">{video.description}</p>
              </Card>
            ))}
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border-slate-200">
              {/* Video Container */}
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                {!videoError && selectedVideo.videoUrl ? (
                  <>
                    <video
                      key={selectedVideo.id}
                      className="w-full h-full object-cover"
                      controls
                      poster={selectedVideo.thumbnail}
                      onError={handleVideoError}
                      onLoadedData={handleVideoLoaded}
                      preload="metadata"
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {!videoLoaded && !videoError && (
                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                        <div className="flex flex-col items-center text-white">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                          <p className="text-sm text-gray-300">Loading video...</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Enhanced placeholder when video is not available
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 50%), 
                                         radial-gradient(circle at 75% 75%, #f97316 0%, transparent 50%)`
                      }}></div>
                    </div>
                    
                    <div className="relative z-10 text-center">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform duration-300">
                          <PlayIcon />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <span className="text-xs">🔴</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3">{selectedVideo.title}</h3>
                      <p className="text-sm text-gray-300 text-center max-w-md leading-relaxed mb-4">
                        Interactive demo showcasing our QA automation solutions. This represents a live working system with actual features and capabilities.
                      </p>
                      
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                          <span className="text-xs text-gray-300">Duration: {selectedVideo.duration}</span>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                          <span className="text-xs text-white">{selectedVideo.category}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400">
                        💡 Full video implementation available upon request
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Details */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-midnight">{selectedVideo.title}</h3>
                  <Badge className={`bg-gradient-to-r ${categoryColors[selectedVideo.category]} text-white`}>
                    {selectedVideo.category}
                  </Badge>
                </div>
                
                <p className="text-midnight-300 mb-6 leading-relaxed">{selectedVideo.description}</p>

                {/* Key Highlights */}
                <div className="mb-6">
                  <h4 className="font-semibold text-midnight mb-3">Key Features Demonstrated</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVideo.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                        <span className="text-sm text-midnight-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="font-semibold text-midnight mb-3">Technologies Featured</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-slate-100 text-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}