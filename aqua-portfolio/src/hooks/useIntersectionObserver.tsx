'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (skip || typeof window === 'undefined') return;

    const target = targetRef.current;
    if (!target) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isCurrentlyIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting) {
          setHasIntersected(true);
          
          // If triggerOnce, disconnect after first intersection
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [threshold, rootMargin, triggerOnce, skip]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected,
    // For performance, return the specific state needed
    shouldAnimate: triggerOnce ? hasIntersected : isIntersecting,
  };
};

// Batch intersection observer for multiple elements
export const useBatchIntersectionObserver = (
  elements: HTMLElement[],
  options: UseIntersectionObserverOptions = {}
) => {
  const [intersections, setIntersections] = useState<Map<HTMLElement, boolean>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false
  } = options;

  useEffect(() => {
    if (skip || typeof window === 'undefined' || elements.length === 0) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIntersections(prev => {
          const newMap = new Map(prev);
          entries.forEach(entry => {
            newMap.set(entry.target as HTMLElement, entry.isIntersecting);
          });
          return newMap;
        });

        if (triggerOnce) {
          // Remove observed elements that have intersected
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              observer.unobserve(entry.target);
            }
          });
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    elements.forEach(element => {
      observer.observe(element);
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [elements, threshold, rootMargin, triggerOnce, skip]);

  return intersections;
};

export default useIntersectionObserver;