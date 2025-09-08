'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface VideoCase {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: 'demo' | 'healing' | 'setup' | 'results';
  views: string;
  uploadDate: string;
  highlights: string[];
  transcript: string[];
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

const CaseStudyVideoMockups = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [playbackStates, setPlaybackStates] = useState<Record<string, PlaybackState>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const videos: VideoCase[] = useMemo(() => [
    {
      id: 'ai-healing-demo',
      title: 'AI Test Healing in Action',
      description: 'Watch as AI automatically detects and fixes broken selectors in real-time during test execution.',
      duration: '3:24',
      thumbnail: '/icons/ai-robot.svg',
      category: 'healing',
      views: '12.5K',
      uploadDate: '3 days ago',
      highlights: ['Real-time selector analysis', 'Automatic DOM pattern recognition', 'Zero downtime healing'],
      transcript: [
        'Starting test execution with known broken selector...',
        'Test fails - selector ".submit-btn" not found',
        'AI Doctor activates healing protocol',
        'Analyzing DOM structure for alternatives',
        'Found semantic match: button[data-testid="submit"]',
        'Test automatically re-runs with new selector',
        'Test passes - healing complete in 2.3 seconds'
      ]
    },
    {
      id: 'playwright-setup',
      title: 'Zero-Config Playwright Setup',
      description: 'Complete Playwright test environment setup with AI Doctor integration in under 5 minutes.',
      duration: '4:12',
      thumbnail: '⚡',
      category: 'setup',
      views: '8.9K',
      uploadDate: '1 week ago',
      highlights: ['One-command installation', 'Auto-configuration', 'Built-in AI healing'],
      transcript: [
        'Installing Playwright with AI Doctor...',
        'npm install @playwright/test ai-test-doctor',
        'Automatic browser installation',
        'Configuring AI healing settings',
        'Running first test with AI protection',
        'Setup complete - ready for production'
      ]
    },
    {
      id: 'cross-browser-testing',
      title: 'Cross-Browser AI Testing',
      description: 'Demonstrating consistent AI healing across Chrome, Firefox, and Safari browsers.',
      duration: '5:18',
      thumbnail: '🌐',
      category: 'demo',
      views: '15.2K',
      uploadDate: '5 days ago',
      highlights: ['Multi-browser execution', 'Consistent healing', 'Performance comparison'],
      transcript: [
        'Executing test suite across all browsers...',
        'Chrome: 98% success rate with 3 healings',
        'Firefox: 97% success rate with 2 healings',
        'Safari: 96% success rate with 4 healings',
        'Cross-browser healing patterns identified',
        'All browsers passing with AI assistance'
      ]
    },
    {
      id: 'performance-results',
      title: 'Before vs After: AI Impact',
      description: 'Comprehensive analysis showing 80% reduction in test maintenance time with AI healing.',
      duration: '2:56',
      thumbnail: '📊',
      category: 'results',
      views: '20.1K',
      uploadDate: '2 weeks ago',
      highlights: ['80% maintenance reduction', '94% healing success rate', 'ROI analysis'],
      transcript: [
        'Analyzing 6 months of testing data...',
        'Before AI: 40 hours/week maintenance',
        'After AI: 8 hours/week maintenance',
        'Test stability improved from 78% to 96%',
        'Developer productivity increased 3x',
        'ROI achieved in first month'
      ]
    },
    {
      id: 'visual-testing',
      title: 'AI-Powered Visual Testing',
      description: 'Advanced visual regression testing with intelligent change detection and auto-healing.',
      duration: '4:45',
      thumbnail: '👁️',
      category: 'demo',
      views: '11.3K',
      uploadDate: '4 days ago',
      highlights: ['Visual AI analysis', 'Smart change detection', 'Auto-baseline updates'],
      transcript: [
        'Starting visual regression test suite...',
        'Comparing current UI with baseline images',
        'AI detects intentional design changes',
        'Auto-updating baselines for approved changes',
        'Flagging unexpected visual differences',
        'Visual test suite: 100% accurate'
      ]
    },
    {
      id: 'api-healing',
      title: 'API Test Healing & Recovery',
      description: 'Intelligent API test healing when endpoints change or response formats evolve.',
      duration: '3:38',
      thumbnail: '🔧',
      category: 'healing',
      views: '9.7K',
      uploadDate: '6 days ago',
      highlights: ['API contract evolution', 'Response format adaptation', 'Endpoint discovery'],
      transcript: [
        'API endpoint returns modified response format...',
        'Test expects old JSON structure',
        'AI analyzes new response schema',
        'Auto-adapts test assertions to new format',
        'Maintains test coverage integrity',
        'API evolution handled seamlessly'
      ]
    }
  ], []);

  const categories = [
    { id: 'all', label: 'All Videos', count: videos.length },
    { id: 'demo', label: 'Demos', count: videos.filter(v => v.category === 'demo').length },
    { id: 'healing', label: 'AI Healing', count: videos.filter(v => v.category === 'healing').length },
    { id: 'setup', label: 'Setup', count: videos.filter(v => v.category === 'setup').length },
    { id: 'results', label: 'Results', count: videos.filter(v => v.category === 'results').length }
  ];

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  useEffect(() => {
    // Initialize playback states
    const initialStates: Record<string, PlaybackState> = {};
    videos.forEach(video => {
      const [minutes, seconds] = video.duration.split(':').map(Number);
      const totalDuration = minutes * 60 + seconds;
      initialStates[video.id] = {
        isPlaying: false,
        currentTime: 0,
        duration: totalDuration,
        progress: 0
      };
    });
    setPlaybackStates(initialStates);
  }, [videos]);

  const togglePlayback = (videoId: string) => {
    setPlaybackStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        isPlaying: !prev[videoId]?.isPlaying
      }
    }));

    // Simulate video progress
    if (!playbackStates[videoId]?.isPlaying) {
      const interval = setInterval(() => {
        setPlaybackStates(prev => {
          const current = prev[videoId];
          if (!current?.isPlaying || current.currentTime >= current.duration) {
            clearInterval(interval);
            return {
              ...prev,
              [videoId]: {
                ...current,
                isPlaying: false,
                currentTime: current.currentTime >= current.duration ? 0 : current.currentTime
              }
            };
          }

          const newTime = current.currentTime + 1;
          return {
            ...prev,
            [videoId]: {
              ...current,
              currentTime: newTime,
              progress: (newTime / current.duration) * 100
            }
          };
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'demo': return '#06b6d4';
      case 'healing': return '#10b981';
      case 'setup': return '#8b5cf6';
      case 'results': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const VideoPlayer = ({ video }: { video: VideoCase }) => {
    const state = playbackStates[video.id];
    if (!state) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl overflow-hidden"
      >
        {/* Video Display */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {/* Fake Video Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className="text-6xl"
              animate={state.isPlaying ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Image 
                src={video.thumbnail}
                alt={`${video.title} thumbnail`}
                width={48}
                height={48}
                loading="lazy"
              />
            </motion.div>
            
            {/* Play/Pause Overlay */}
            <motion.button
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
              onClick={() => togglePlayback(video.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                {state.isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
            </motion.button>

            {/* Live Indicators */}
            {state.isPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-white text-xs bg-red-500 px-2 py-1 rounded">LIVE</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center gap-3 text-white text-sm">
              <span>{formatTime(state.currentTime)}</span>
              <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  style={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span>{video.duration}</span>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h4 className="font-semibold text-white mb-2">{video.title}</h4>
          <p className="text-slate-300 text-sm mb-3">{video.description}</p>
          
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <span>{video.views} views</span>
            <span>{video.uploadDate}</span>
          </div>

          {/* Transcript */}
          {state.isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-800 rounded-lg p-3 overflow-hidden"
            >
              <div className="text-xs text-slate-300 mb-2">Live Transcript:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {video.transcript.map((line, index) => {
                  const shouldShow = index <= Math.floor((state.progress / 100) * video.transcript.length);
                  return (
                    <motion.div
                      key={index}
                      className={`text-xs ${shouldShow ? 'text-white' : 'text-slate-500'}`}
                      animate={shouldShow ? { opacity: 1 } : { opacity: 0.3 }}
                    >
                      {line}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-midnight mb-2">Case Study Video Library</h3>
          <p className="text-slate-600">Watch AI-powered testing in action with interactive video demonstrations</p>
        </div>

        <div className="p-8">
          {/* Category Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-cyan-100 text-cyan-700 border-2 border-cyan-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.label} ({category.count})
                </motion.button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <AnimatePresence>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    {video.thumbnail.startsWith('/') ? (
                      <Image 
                        src={video.thumbnail}
                        alt={`${video.title} thumbnail`}
                        width={64}
                        height={64}
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-4xl">{video.thumbnail}</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div 
                      className="absolute top-2 left-2 text-xs px-2 py-1 rounded text-white font-medium"
                      style={{ backgroundColor: getCategoryColor(video.category) }}
                    >
                      {video.category.toUpperCase()}
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-midnight mb-2 line-clamp-2">{video.title}</h4>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{video.views} views</span>
                      <span>{video.uploadDate}</span>
                    </div>

                    {/* Highlights */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {video.highlights.slice(0, 2).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white rounded-full text-xs text-slate-600 border border-slate-200"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expanded Video Player */}
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-midnight">Now Playing</h4>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {(() => {
                  const video = videos.find(v => v.id === selectedVideo);
                  return video ? <VideoPlayer video={video} /> : null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyVideoMockups;