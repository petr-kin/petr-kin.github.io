'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Play, Sparkles, FileText, Code } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
  slug?: string;
  title: string;
  summary: string;
  tags: string[];
  media?: string;
  mediaType?: 'image' | 'video';
  metrics?: Record<string, string>;
  featured?: boolean;
  links?: {
    demo?: string;
    code?: string;
    docs?: string;
  };
}

const AdvancedProjectCard: React.FC<ProjectCardProps> = ({
  title,
  summary,
  tags,
  media,
  mediaType = 'image',
  metrics = {},
  featured = false,
  links = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const damping = 20;
  const stiffness = 150;
  
  const springX = useSpring(mouseX, { damping, stiffness });
  const springY = useSpring(mouseY, { damping, stiffness });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const x = (e.clientX - rect.left - width / 2) / width;
    const y = (e.clientY - rect.top - height / 2) / height;
    
    mouseX.set(x);
    mouseY.set(y);
    
    // For gradient effect
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {featured && (
        <div className="absolute -top-3 left-6 z-20">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
            <Sparkles className="w-3 h-3" />
            FEATURED
          </div>
        </div>
      )}
      
      <motion.div
        ref={cardRef}
        className="relative h-full bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        {/* Gradient follow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: isHovered 
              ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.05), transparent 40%)`
              : 'none'
          }}
        />
        
        {/* Media section */}
        <div className="relative h-64 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          {media ? (
            mediaType === 'video' ? (
              <video
                src={media}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src={media}
                  alt={title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Animated code lines placeholder */}
                <div className="space-y-2 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <motion.div 
                        className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full"
                        animate={{
                          width: isHovered 
                            ? `${Math.random() * 60 + 70}px` 
                            : `${Math.random() * 40 + 60}px`,
                          opacity: isHovered ? 1 : 0.7,
                        }}
                        transition={{ 
                          delay: i * 0.1,
                          duration: 0.5,
                        }}
                      />
                      {i === 2 && (
                        <div className="w-2 h-2 bg-aqua-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Play button overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <button className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-cyan-600 ml-1" />
                  </button>
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full" />
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-midnight mb-3 flex items-start justify-between">
            <span className="flex-1">{title}</span>
            <motion.div
              animate={{ 
                x: isHovered ? 2 : 0,
                y: isHovered ? -2 : 0,
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="w-5 h-5 text-cyan-500" />
            </motion.div>
          </h3>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
            {summary}
          </p>
          
          {/* Metrics - Key results */}
          {Object.keys(metrics).length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(metrics).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-cyan-600">{value}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-md border border-cyan-100"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              <FileText className="w-4 h-4" />
              Case Study
            </button>
            {links.code && (
              <a 
                href={links.code}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition-all inline-flex items-center justify-center"
              >
                <Code className="w-4 h-4" />
              </a>
            )}
            {links.demo && (
              <a 
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition-all inline-flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        
        {/* Hover state border glow */}
        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 blur-xl" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedProjectCard;