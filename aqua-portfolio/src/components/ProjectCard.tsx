'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Github, Play } from 'lucide-react'
import { useState } from 'react'

interface ProjectCardProps {
  title: string
  summary: string
  tags: string[]
  media?: string
  mediaType?: 'image' | 'video'
  links: {
    code?: string
    demo?: string
    docs?: string
  }
  className?: string
}

export default function ProjectCard({
  title,
  summary,
  tags,
  media,
  mediaType = 'image',
  links,
  className = ''
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handleVideoInteraction = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  return (
    <motion.div
      className={`group ${className}`}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="h-full glass-card border-aqua-200/50 hover:border-aqua-300/70 transition-all duration-300 overflow-hidden">
        {/* Media Section */}
        {media && (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-aqua-50 to-aqua-100">
            {mediaType === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  poster={media.replace('.mp4', '-poster.jpg')}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  <source src={media} type="video/mp4" />
                </video>
                
                {/* Video overlay controls */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    className="rounded-full bg-white/90 hover:bg-white text-aqua-600"
                    onClick={handleVideoInteraction}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-aqua-100 to-aqua-200 flex items-center justify-center">
                {/* Placeholder icon or actual image */}
                <div className="text-4xl text-aqua-500/50">
                  🚀
                </div>
              </div>
            )}

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={isHovered ? { x: '200%' } : { x: '-100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-midnight group-hover:text-aqua-600 transition-colors duration-200">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-1 bg-aqua-50 text-aqua-700 border border-aqua-200/50 hover:bg-aqua-100 transition-colors duration-200"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-2 pt-2">
            {links.demo && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs glass-card border-aqua-200/50 hover:bg-aqua-50 group/btn"
                asChild
              >
                <motion.a
                  href={links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                  Demo
                </motion.a>
              </Button>
            )}
            
            {links.code && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs glass-card border-aqua-200/50 hover:bg-aqua-50 group/btn"
                asChild
              >
                <motion.a
                  href={links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="h-3 w-3 mr-1.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                  Code
                </motion.a>
              </Button>
            )}

            {links.docs && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs glass-card border-aqua-200/50 hover:bg-aqua-50 group/btn"
                asChild
              >
                <motion.a
                  href={links.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5 group-hover/btn:rotate-12 transition-transform duration-200" />
                  Docs
                </motion.a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}