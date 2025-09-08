'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'data' | 'test' | 'ai' | 'connection';
  connections: number[];
  lifespan: number;
  maxLifespan: number;
  opacity: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const ParticleSystemBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>(0);
  const mousePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const fpsRef = useRef<number>(60);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const poolRef = useRef<Particle[]>([]);
  const [isInteractive, setIsInteractive] = useState(true);
  const [particleCount, setParticleCount] = useState(100);
  const [connectionDistance] = useState(120);
  const [mouseInfluenceRadius] = useState(150);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const particleColors = {
    data: '#06b6d4',
    test: '#10b981',
    ai: '#8b5cf6',
    connection: '#f59e0b'
  };

  const particleSymbols = {
    data: '{}',
    test: '✓',
    ai: '⚡',
    connection: '◆'
  };

  // Detect mobile and reduced motion
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Reduce particle count on mobile
      if (isMobileDevice) {
        setParticleCount(30); // Reduced from 100
        setIsInteractive(false); // Disable mouse interaction
      }
    };

    const checkReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);
      
      if (prefersReducedMotion) {
        setParticleCount(10); // Minimal particles
        setIsInteractive(false);
      }
    };

    checkMobile();
    checkReducedMotion();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // FPS monitoring and auto-adjustment
  const updateFPS = (timestamp: number) => {
    frameCountRef.current++;
    
    if (timestamp - lastTimeRef.current >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / (timestamp - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = timestamp;
      
      // Auto-adjust particle count based on FPS
      if (fpsRef.current < 30 && particleCount > 20) {
        setParticleCount(prev => Math.max(20, prev - 10));
      } else if (fpsRef.current > 50 && particleCount < (isMobile ? 30 : 100)) {
        setParticleCount(prev => Math.min(isMobile ? 30 : 100, prev + 5));
      }
    }
  };

  // Particle pooling system
  const getParticleFromPool = (): Particle | null => {
    return poolRef.current.pop() || null;
  };

  const returnParticleToPool = (particle: Particle) => {
    poolRef.current.push(particle);
  };

  // Initialize particles
  const initializeParticles = () => {
    const particles: Particle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < particleCount; i++) {
      const types: Array<'data' | 'test' | 'ai' | 'connection'> = ['data', 'test', 'ai', 'connection'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 2,
        color: particleColors[type],
        type,
        connections: [],
        lifespan: Math.random() * 100,
        maxLifespan: 100 + Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
    
    particlesRef.current = particles;
  };

  // Update particle positions and connections
  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const particles = particlesRef.current;
    const mousePos = mousePositionRef.current;

    particles.forEach((particle, index) => {
      // Clear previous connections
      particle.connections = [];

      // Update lifespan
      particle.lifespan += 0.5;
      if (particle.lifespan >= particle.maxLifespan) {
        // Respawn particle
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.lifespan = 0;
        particle.opacity = 0;
      }

      // Fade in/out based on lifespan
      const lifespanRatio = particle.lifespan / particle.maxLifespan;
      if (lifespanRatio < 0.1) {
        particle.opacity = lifespanRatio * 10;
      } else if (lifespanRatio > 0.9) {
        particle.opacity = (1 - lifespanRatio) * 10;
      } else {
        particle.opacity = Math.min(1, particle.opacity + 0.01);
      }

      // Mouse interaction
      if (isInteractive && mousePos.x > 0 && mousePos.y > 0) {
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluenceRadius) {
          const force = (1 - distance / mouseInfluenceRadius) * 2;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
          
          // Increase opacity near mouse
          particle.opacity = Math.min(1, particle.opacity + 0.1);
          
          // Speed up particles near mouse
          particle.vx *= 1.02;
          particle.vy *= 1.02;
        }
      }

      // Apply velocity with damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off walls
      if (particle.x <= 0 || particle.x >= canvas.width) {
        particle.vx = -particle.vx;
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      }
      if (particle.y <= 0 || particle.y >= canvas.height) {
        particle.vy = -particle.vy;
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      }

      // Find connections to nearby particles
      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = other.x - particle.x;
        const dy = other.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          particle.connections.push(j);
          
          // Special interaction between AI and test particles
          if (particle.type === 'ai' && other.type === 'test') {
            // AI particles attract test particles
            other.vx += (particle.x - other.x) * 0.0001;
            other.vy += (particle.y - other.y) * 0.0001;
          }
        }
      }

      // Add random movement for organic feel
      particle.vx += (Math.random() - 0.5) * 0.01;
      particle.vy += (Math.random() - 0.5) * 0.01;

      // Limit maximum velocity
      const maxSpeed = 2;
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }
    });
  };

  // Draw particles and connections
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw connections
    particles.forEach((particle) => {
      particle.connections.forEach(connectedIndex => {
        const other = particles[connectedIndex];
        const dx = other.x - particle.x;
        const dy = other.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const opacity = (1 - distance / connectionDistance) * particle.opacity * other.opacity * 0.3;

        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        
        // Create gradient for connection lines
        const gradient = ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
        gradient.addColorStop(0, particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, other.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // Draw particles
    particles.forEach(particle => {
      // Draw glow effect
      ctx.beginPath();
      const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3);
      glowGradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 0.3 * 255).toString(16).padStart(2, '0'));
      glowGradient.addColorStop(1, particle.color + '00');
      ctx.fillStyle = glowGradient;
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
      ctx.fill();

      // Draw particle symbol
      if (particle.size > 3) {
        ctx.font = `${particle.size * 2}px monospace`;
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particleSymbols[particle.type], particle.x, particle.y);
      }
    });

    // Draw data flow patterns around mouse
    if (isInteractive && mousePositionRef.current.x > 0) {
      const mousePos = mousePositionRef.current;
      const time = Date.now() * 0.001;
      
      // Draw ripple effect
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const radius = (time * 30 + i * 20) % 150;
        const opacity = Math.max(0, 1 - radius / 150);
        ctx.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  // Animation loop with FPS monitoring
  const animate = (timestamp: number = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;

    // Skip frame if reduced motion
    if (reducedMotion) return;

    updateFPS(timestamp);

    // Use requestIdleCallback for non-critical updates when FPS is low
    if (fpsRef.current < 20) {
      const idleCallback = () => {
        updateParticles(ctx);
        drawParticles(ctx);
      };
      
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(idleCallback);
      } else {
        setTimeout(idleCallback, 16);
      }
    } else {
      updateParticles(ctx);
      drawParticles(ctx);
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    mousePositionRef.current = { x: 0, y: 0 };
  };

  // Handle resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize particles if canvas size changed significantly
    if (particlesRef.current.length === 0 || 
        Math.abs(particlesRef.current.length - particleCount) > 10) {
      initializeParticles();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    initializeParticles();

    // Start animation
    animate();

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, isInteractive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-30 pointer-events-auto"
        style={{ background: 'transparent' }}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg pointer-events-auto">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Particles: {particleCount}</label>
            <input
              type="range"
              min="50"
              max="200"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="interactive"
              checked={isInteractive}
              onChange={(e) => setIsInteractive(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="interactive" className="text-sm text-slate-700">
              Mouse Interaction
            </label>
          </div>
          <div className="text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Data Flow
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-aqua-500"></span>
              Test Execution
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              AI Processing
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Connections
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystemBackground;