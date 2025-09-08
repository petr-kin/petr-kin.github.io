'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, GitBranch, Brain, ArrowRight, Download } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const HeroWave = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { targetRef, isIntersecting: shouldAnimate } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Memoize expensive calculations
  const animationClasses = useMemo(() => ({
    orb1: shouldAnimate ? 'animate-float-slow' : '',
    orb2: shouldAnimate ? 'animate-float-reverse' : '',
    bounce: shouldAnimate ? 'animate-bounce' : '',
    pulse: shouldAnimate ? 'animate-pulse' : ''
  }), [shouldAnimate]);

  return (
    <section 
      ref={targetRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20"
      aria-label="Hero section"
    >
      {/* Optimized background elements with CSS animations */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div 
          className={`absolute w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-300/20 blur-3xl will-change-transform ${animationClasses.orb1}`}
          style={{ top: '10%', left: '60%' }}
        />
        <div 
          className={`absolute w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-200/20 blur-3xl will-change-transform ${animationClasses.orb2}`}
          style={{ bottom: '20%', left: '10%' }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Typography focused */}
          <div className="lg:col-span-7">
            {/* Small accent text */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-true-blue to-true-blue-600"></div>
              <span className="text-sm font-semibold text-true-blue tracking-wider uppercase">
                Test Intelligence Engineer
              </span>
            </div>

            {/* Main headline - Clean typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[1.1] text-black">
              Building the
              <br />
              <span className="font-light">future of</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                intelligent QA.
              </span>
            </h1>

            {/* Supporting text */}
            <div className="mt-8 max-w-2xl">
              <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed tracking-tight">
                Self-healing test frameworks powered by machine learning. 
                <span className="text-black font-normal"> 95% healing rate.</span>
              </p>
            </div>

            {/* Metrics - Minimal presentation */}
            <div className="flex gap-12 mt-12">
              <div>
                <div className="text-3xl font-semibold text-black">95%</div>
                <div className="text-sm text-gray-500 mt-1">Healing Rate</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-black">60%</div>
                <div className="text-sm text-gray-500 mt-1">Less Maintenance</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-black">3.5K+</div>
                <div className="text-sm text-gray-500 mt-1">Tests Automated</div>
              </div>
            </div>

            {/* CTA Buttons - Refined */}
            <div className="flex flex-wrap gap-4 mt-12">
              <button 
                className="group px-8 py-4 bg-black text-white text-sm font-medium rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="View case studies"
              >
                <span className="flex items-center gap-3">
                  View Case Studies
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              
              <button className="px-8 py-4 border border-gray-300 text-black text-sm font-medium rounded-full transition-all duration-300 hover:border-black hover:shadow-lg">
                <span className="flex items-center gap-3">
                  <Download className="w-4 h-4" />
                  Download Resume
                </span>
              </button>
            </div>
          </div>

          {/* Right side - Visual element */}
          <div className="lg:col-span-5 relative">
            {/* Deconstructed visual composition */}
            <div className="relative h-[500px]">
              {/* Main card - floating */}
              <div className="absolute top-0 right-0 w-72 h-96 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-midnight mb-2">AI-Powered Testing</h3>
                    <p className="text-sm text-slate-600">Intelligent test healing with pattern recognition</p>
                  </div>
                  
                  {/* Live animation indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-cyan-500 rounded-full ${animationClasses.pulse}`}></div>
                    <span className="text-xs text-slate-500">Live healing active</span>
                  </div>
                </div>
              </div>

              {/* Secondary card - offset */}
              <div className="absolute top-20 left-0 w-64 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur rounded-2xl p-6 transform -rotate-6">
                <GitBranch className="w-8 h-8 text-cyan-600 mb-4" />
                <div className="space-y-3">
                  <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
                  <div className="h-2 bg-slate-200 rounded-full w-1/2"></div>
                  <div className="h-2 bg-slate-200 rounded-full w-2/3"></div>
                </div>
              </div>

              {/* Floating accent elements */}
              <div className={`absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-80 z-20 will-change-transform ${animationClasses.bounce}`}></div>
              <div className={`absolute top-40 right-1/3 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg opacity-60 will-change-transform ${animationClasses.pulse}`}></div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400" role="img" aria-label="Scroll down to explore more content">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <ChevronDown className={`w-5 h-5 will-change-transform ${animationClasses.bounce}`} />
        </div>
      </div>

    </section>
  );
};

export default HeroWave;