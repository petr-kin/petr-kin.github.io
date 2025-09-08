'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  distance: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  isSwipe: boolean;
  isPinch: boolean;
  scale: number;
  rotation: number;
}

export interface GestureCallbacks {
  onSwipeStart?: (state: GestureState) => void;
  onSwipeMove?: (state: GestureState) => void;
  onSwipeEnd?: (state: GestureState) => void;
  onSwipeLeft?: (state: GestureState) => void;
  onSwipeRight?: (state: GestureState) => void;
  onSwipeUp?: (state: GestureState) => void;
  onSwipeDown?: (state: GestureState) => void;
  onPinchStart?: (state: GestureState) => void;
  onPinchMove?: (state: GestureState) => void;
  onPinchEnd?: (state: GestureState) => void;
  onTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
}

export interface UseGesturesOptions extends GestureCallbacks {
  swipeThreshold?: number;
  velocityThreshold?: number;
  longPressDelay?: number;
  preventScroll?: boolean;
  enableHaptics?: boolean;
  minPinchDistance?: number;
}

export const useGestures = (options: UseGesturesOptions = {}) => {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.5,
    longPressDelay = 500,
    preventScroll = false,
    enableHaptics = false,
    minPinchDistance = 50,
    ...callbacks
  } = options;

  const [isActive, setIsActive] = useState(false);
  const gestureStateRef = useRef<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    distance: 0,
    direction: null,
    isSwipe: false,
    isPinch: false,
    scale: 1,
    rotation: 0,
  });

  const touchStartTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const velocityTrackerRef = useRef<Array<{x: number, y: number, time: number}>>([]);
  const initialPinchDistanceRef = useRef<number>(0);
  const lastTouchesRef = useRef<TouchList | null>(null);

  // Haptic feedback function
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics) return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [enableHaptics]);

  // Calculate distance between two touches
  const getDistanceBetweenTouches = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two touches
  const getAngleBetweenTouches = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  }, []);

  // Calculate velocity from recent movements
  const calculateVelocity = useCallback((): { x: number; y: number } => {
    const tracker = velocityTrackerRef.current;
    if (tracker.length < 2) return { x: 0, y: 0 };

    const recent = tracker.slice(-3); // Use last 3 points for stability
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const timeDiff = last.time - first.time;
    if (timeDiff === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / timeDiff,
      y: (last.y - first.y) / timeDiff,
    };
  }, []);

  // Determine swipe direction
  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): GestureState['direction'] => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (Math.max(absX, absY) < swipeThreshold) return null;
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [swipeThreshold]);

  // Update gesture state
  const updateGestureState = useCallback((touch: Touch, touches: TouchList) => {
    const state = gestureStateRef.current;
    const currentTime = Date.now();
    
    // Update position
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;
    state.deltaX = state.currentX - state.startX;
    state.deltaY = state.currentY - state.startY;
    state.distance = Math.sqrt(state.deltaX * state.deltaX + state.deltaY * state.deltaY);
    state.direction = getSwipeDirection(state.deltaX, state.deltaY);
    state.isSwipe = state.distance > swipeThreshold;

    // Handle pinch gestures
    if (touches.length === 2) {
      const currentDistance = getDistanceBetweenTouches(touches);
      if (initialPinchDistanceRef.current > 0) {
        state.scale = currentDistance / initialPinchDistanceRef.current;
        state.isPinch = Math.abs(currentDistance - initialPinchDistanceRef.current) > minPinchDistance;
      }
      state.rotation = getAngleBetweenTouches(touches);
    }

    // Track velocity
    velocityTrackerRef.current.push({
      x: state.currentX,
      y: state.currentY,
      time: currentTime
    });

    // Limit velocity tracker size
    if (velocityTrackerRef.current.length > 10) {
      velocityTrackerRef.current = velocityTrackerRef.current.slice(-10);
    }

    const velocity = calculateVelocity();
    state.velocityX = velocity.x;
    state.velocityY = velocity.y;

    return state;
  }, [swipeThreshold, getSwipeDirection, getDistanceBetweenTouches, getAngleBetweenTouches, minPinchDistance, calculateVelocity]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventScroll) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const currentTime = Date.now();
    
    touchStartTimeRef.current = currentTime;
    setIsActive(true);

    // Initialize gesture state
    const state = gestureStateRef.current;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;
    state.deltaX = 0;
    state.deltaY = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    state.distance = 0;
    state.direction = null;
    state.isSwipe = false;
    state.scale = 1;
    state.rotation = 0;
    state.isPinch = false;

    // Handle pinch initialization
    if (event.touches.length === 2) {
      initialPinchDistanceRef.current = getDistanceBetweenTouches(event.touches);
      callbacks.onPinchStart?.(state);
    }

    // Clear velocity tracker
    velocityTrackerRef.current = [{
      x: touch.clientX,
      y: touch.clientY,
      time: currentTime
    }];

    // Start long press timer
    if (callbacks.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        callbacks.onLongPress?.(state);
        triggerHaptic('medium');
      }, longPressDelay);
    }

    callbacks.onSwipeStart?.(state);
    lastTouchesRef.current = event.touches;
  }, [preventScroll, callbacks, getDistanceBetweenTouches, triggerHaptic, longPressDelay]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isActive) return;

    if (preventScroll) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const state = updateGestureState(touch, event.touches);

    // Clear long press timer on movement
    if (longPressTimerRef.current && state.distance > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    callbacks.onSwipeMove?.(state);

    // Handle pinch gestures
    if (event.touches.length === 2 && state.isPinch) {
      callbacks.onPinchMove?.(state);
    }

    lastTouchesRef.current = event.touches;
  }, [isActive, preventScroll, updateGestureState, callbacks]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isActive) return;

    setIsActive(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const state = gestureStateRef.current;
    const touchDuration = Date.now() - touchStartTimeRef.current;

    // Handle tap (quick touch without movement)
    if (touchDuration < 200 && state.distance < 10) {
      callbacks.onTap?.(state);
      triggerHaptic('light');
    }

    // Handle swipe gestures
    if (state.isSwipe && (Math.abs(state.velocityX) > velocityThreshold || Math.abs(state.velocityY) > velocityThreshold)) {
      switch (state.direction) {
        case 'left':
          callbacks.onSwipeLeft?.(state);
          break;
        case 'right':
          callbacks.onSwipeRight?.(state);
          break;
        case 'up':
          callbacks.onSwipeUp?.(state);
          break;
        case 'down':
          callbacks.onSwipeDown?.(state);
          break;
      }
      triggerHaptic('light');
    }

    // Handle pinch end
    if (lastTouchesRef.current && lastTouchesRef.current.length === 2) {
      callbacks.onPinchEnd?.(state);
    }

    callbacks.onSwipeEnd?.(state);

    // Reset pinch distance
    initialPinchDistanceRef.current = 0;
    lastTouchesRef.current = null;
  }, [isActive, callbacks, triggerHaptic, velocityThreshold]);

  const handleTouchCancel = useCallback((event: TouchEvent) => {
    setIsActive(false);
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    initialPinchDistanceRef.current = 0;
    lastTouchesRef.current = null;
  }, []);

  // Create gesture handlers for elements
  const createGestureHandlers = useCallback(() => {
    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      style: {
        touchAction: preventScroll ? 'none' : 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none' as const,
      } as React.CSSProperties,
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, preventScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    isActive,
    gestureState: gestureStateRef.current,
    createGestureHandlers,
    triggerHaptic,
  };
};