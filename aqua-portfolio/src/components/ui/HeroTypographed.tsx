import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';

const HeroWave = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Parallax transforms
  const parallaxOffset = scrollY * 0.5;
  const fadeOpacity = Math.max(0, 1 - scrollY / 800);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .mask-gradient {
          -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
        }

        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Minimalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-screen-xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="text-lg tracking-tight">
            <span className="font-semibold">PETR</span>
            <span className="font-light ml-1">KINDLMANN</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">Work</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">About</a>
            <a href="#expertise" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">Expertise</a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">Contact</a>
          </nav>

          {/* Mobile Menu */}
          <button className="md:hidden w-11 h-11 flex items-center justify-center">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
              <path d="M0 1H18M0 11H18" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden bg-white"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none" />
        
        {/* Single floating orb - extremely subtle */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]"
          style={{ animation: 'subtle-float 20s ease-in-out infinite' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-8 py-32 w-full">
          <div className="max-w-4xl">
            {/* Eyebrow text */}
            <div className="animate-in mb-8" style={{ animationDelay: '0ms' }}>
              <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                Test Intelligence Engineer
              </p>
            </div>

            {/* Main headline - Pure typography */}
            <div className="animate-in mb-8" style={{ animationDelay: '100ms' }}>
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] text-black">
                Building the
                <br />
                <span className="font-light">future of</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                  intelligent QA.
                </span>
              </h1>
            </div>

            {/* Supporting text */}
            <div className="animate-in mb-12 max-w-2xl" style={{ animationDelay: '200ms' }}>
              <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed tracking-tight">
                Self-healing test frameworks powered by machine learning. 
                <span className="text-black font-normal"> 95% healing rate.</span>
              </p>
            </div>

            {/* Metrics - Minimal presentation */}
            <div className="animate-in flex gap-12 mb-12" style={{ animationDelay: '300ms' }}>
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
            <div className="animate-in flex flex-wrap gap-4" style={{ animationDelay: '400ms' }}>
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

          {/* Right side - Minimal geometric element */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-96 h-96">
              {/* Main shape - subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl transform rotate-3 transition-transform duration-700 hover:rotate-6" />
              
              {/* Accent line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              
              {/* Small accent dot */}
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-black rounded-full" />
            </div>
          </div>
        </div>

        {/* Scroll indicator - Minimal */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: fadeOpacity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-400 to-transparent" />
          <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Scroll</span>
        </div>
      </section>
    </>
  );
};

export default HeroWave;