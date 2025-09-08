'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

export interface IntersectionObserverEntry extends globalThis.IntersectionObserverEntry {
  isIntersecting: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const targetRef = useRef<HTMLElement | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = (entries: globalThis.IntersectionObserverEntry[]) => {
    const [observerEntry] = entries;
    if (observerEntry) {
      setEntry(observerEntry as IntersectionObserverEntry);
      setIsIntersecting(observerEntry.isIntersecting);
    }
  };

  useEffect(() => {
    const node = targetRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) {
      return;
    }

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, threshold, root, rootMargin, frozen]);

  return {
    targetRef,
    entry,
    isIntersecting,
  };
};

// Hook for multiple elements
export const useIntersectionObserverMultiple = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  } = options;

  const [entries, setEntries] = useState<Map<Element, IntersectionObserverEntry>>(new Map());
  const targetsRef = useRef<Set<Element>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const updateEntries = (observerEntries: globalThis.IntersectionObserverEntry[]) => {
    setEntries((prevEntries) => {
      const newEntries = new Map(prevEntries);
      
      observerEntries.forEach((entry) => {
        const existingEntry = newEntries.get(entry.target);
        const shouldFreeze = existingEntry?.isIntersecting && freezeOnceVisible;
        
        if (!shouldFreeze) {
          newEntries.set(entry.target, entry as IntersectionObserverEntry);
        }
      });
      
      return newEntries;
    });
  };

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;
    
    if (!hasIOSupport) {
      return;
    }

    observerRef.current = new IntersectionObserver(updateEntries, {
      threshold,
      root,
      rootMargin,
    });

    const observer = observerRef.current;
    const targets = targetsRef.current;

    targets.forEach((target) => {
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin]);

  const observe = (element: Element) => {
    if (!element) return;
    
    targetsRef.current.add(element);
    observerRef.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    if (!element) return;
    
    targetsRef.current.delete(element);
    observerRef.current?.unobserve(element);
    
    setEntries((prevEntries) => {
      const newEntries = new Map(prevEntries);
      newEntries.delete(element);
      return newEntries;
    });
  };

  const disconnect = () => {
    observerRef.current?.disconnect();
    targetsRef.current.clear();
    setEntries(new Map());
  };

  return {
    entries,
    observe,
    unobserve,
    disconnect,
  };
};

// Hook specifically for lazy loading
export const useLazyLoad = (
  options: UseIntersectionObserverOptions & {
    onLoad?: () => void;
  } = {}
) => {
  const { onLoad, ...intersectionOptions } = options;
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.1,
    ...intersectionOptions,
  });

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
      onLoad?.();
    }
  }, [isIntersecting, hasLoaded, onLoad]);

  return {
    targetRef,
    isIntersecting,
    hasLoaded,
  };
};