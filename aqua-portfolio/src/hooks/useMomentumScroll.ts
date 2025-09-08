'use client';

import { useRef, useCallback, useEffect } from 'react';

export interface MomentumScrollOptions {
  friction?: number;
  maxVelocity?: number;
  threshold?: number;
  onScroll?: (position: { x: number; y: number }) => void;
  onMomentumEnd?: () => void;
  bounceEnabled?: boolean;
  bounceStiffness?: number;
}

export interface ScrollBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export const useMomentumScroll = (options: MomentumScrollOptions = {}) => {
  const {
    friction = 0.95,
    maxVelocity = 50,
    threshold = 0.1,
    onScroll,
    onMomentumEnd,
    bounceEnabled = true,
    bounceStiffness = 0.1,
  } = options;

  const animationFrameRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef<ScrollBounds>({});
  const isAnimatingRef = useRef(false);
  const lastTouchRef = useRef({ x: 0, y: 0, time: 0 });
  const touchHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);

  // Apply momentum animation
  const animateMomentum = useCallback(() => {
    if (!isAnimatingRef.current) return;

    const velocity = velocityRef.current;
    const position = positionRef.current;
    const bounds = boundsRef.current;

    // Apply friction
    velocity.x *= friction;
    velocity.y *= friction;

    // Update position
    position.x += velocity.x;
    position.y += velocity.y;

    // Handle bounds and bouncing
    let bounced = false;
    if (bounds.minX !== undefined && position.x < bounds.minX) {
      if (bounceEnabled) {
        const overshoot = bounds.minX - position.x;
        position.x = bounds.minX - overshoot * bounceStiffness;
        velocity.x = -velocity.x * 0.5;
        bounced = true;
      } else {
        position.x = bounds.minX;
        velocity.x = 0;
      }
    }

    if (bounds.maxX !== undefined && position.x > bounds.maxX) {
      if (bounceEnabled) {
        const overshoot = position.x - bounds.maxX;
        position.x = bounds.maxX + overshoot * bounceStiffness;
        velocity.x = -velocity.x * 0.5;
        bounced = true;
      } else {
        position.x = bounds.maxX;
        velocity.x = 0;
      }
    }

    if (bounds.minY !== undefined && position.y < bounds.minY) {
      if (bounceEnabled) {
        const overshoot = bounds.minY - position.y;
        position.y = bounds.minY - overshoot * bounceStiffness;
        velocity.y = -velocity.y * 0.5;
        bounced = true;
      } else {
        position.y = bounds.minY;
        velocity.y = 0;
      }
    }

    if (bounds.maxY !== undefined && position.y > bounds.maxY) {
      if (bounceEnabled) {
        const overshoot = position.y - bounds.maxY;
        position.y = bounds.maxY + overshoot * bounceStiffness;
        velocity.y = -velocity.y * 0.5;
        bounced = true;
      } else {
        position.y = bounds.maxY;
        velocity.y = 0;
      }
    }

    // Notify about position change
    onScroll?.(position);

    // Check if momentum should continue
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed < threshold && !bounced) {
      isAnimatingRef.current = false;
      onMomentumEnd?.();
      return;
    }

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animateMomentum);
  }, [friction, threshold, bounceEnabled, bounceStiffness, onScroll, onMomentumEnd]);

  // Start momentum scrolling
  const startMomentum = useCallback((velocityX: number, velocityY: number) => {
    // Clamp velocity to max
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed > maxVelocity) {
      const scale = maxVelocity / speed;
      velocityX *= scale;
      velocityY *= scale;
    }

    velocityRef.current.x = velocityX;
    velocityRef.current.y = velocityY;

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animateMomentum();
    }
  }, [maxVelocity, animateMomentum]);

  // Stop momentum scrolling
  const stopMomentum = useCallback(() => {
    isAnimatingRef.current = false;
    velocityRef.current.x = 0;
    velocityRef.current.y = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Set scroll bounds
  const setBounds = useCallback((bounds: ScrollBounds) => {
    boundsRef.current = bounds;
  }, []);

  // Set position without momentum
  const setPosition = useCallback((x: number, y: number) => {
    positionRef.current.x = x;
    positionRef.current.y = y;
    onScroll?.(positionRef.current);
  }, [onScroll]);

  // Get current position
  const getPosition = useCallback(() => {
    return { ...positionRef.current };
  }, []);

  // Track touch for velocity calculation
  const trackTouch = useCallback((x: number, y: number) => {
    const now = Date.now();
    const history = touchHistoryRef.current;
    
    // Add current touch to history
    history.push({ x, y, time: now });
    
    // Keep only recent touches for velocity calculation
    const cutoffTime = now - 100; // Last 100ms
    touchHistoryRef.current = history.filter(touch => touch.time > cutoffTime);
    
    // Update position
    positionRef.current.x = x;
    positionRef.current.y = y;
    onScroll?.(positionRef.current);
  }, [onScroll]);

  // Calculate velocity from touch history
  const calculateVelocityFromHistory = useCallback(() => {
    const history = touchHistoryRef.current;
    if (history.length < 2) return { x: 0, y: 0 };

    // Use multiple points for more accurate velocity
    const recent = history.slice(-Math.min(5, history.length));
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const timeDiff = last.time - first.time;
    if (timeDiff === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / timeDiff * 16, // Convert to pixels per frame (60fps)
      y: (last.y - first.y) / timeDiff * 16,
    };
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((x: number, y: number) => {
    stopMomentum();
    touchHistoryRef.current = [{ x, y, time: Date.now() }];
    lastTouchRef.current = { x, y, time: Date.now() };
  }, [stopMomentum]);

  // Handle touch move
  const handleTouchMove = useCallback((x: number, y: number) => {
    trackTouch(x, y);
    lastTouchRef.current = { x, y, time: Date.now() };
  }, [trackTouch]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    const velocity = calculateVelocityFromHistory();
    
    // Only start momentum if there's significant velocity
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed > 0.5) {
      startMomentum(velocity.x, velocity.y);
    }
    
    touchHistoryRef.current = [];
  }, [calculateVelocityFromHistory, startMomentum]);

  // Snap to position with animation
  const snapTo = useCallback((targetX: number, targetY: number, duration = 300) => {
    stopMomentum();
    
    const startPos = { ...positionRef.current };
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentX = startPos.x + (targetX - startPos.x) * eased;
      const currentY = startPos.y + (targetY - startPos.y) * eased;
      
      setPosition(currentX, currentY);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onMomentumEnd?.();
      }
    };
    
    animate();
  }, [stopMomentum, setPosition, onMomentumEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    // State
    isAnimating: isAnimatingRef.current,
    
    // Position control
    getPosition,
    setPosition,
    setBounds,
    snapTo,
    
    // Momentum control
    startMomentum,
    stopMomentum,
    
    // Touch tracking
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    trackTouch,
    
    // Utilities
    calculateVelocityFromHistory,
  };
};