'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAccessibilityOptions {
  announcePageChanges?: boolean;
  focusOnMount?: boolean;
  skipLinks?: boolean;
  reducedMotion?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const {
    announcePageChanges = true,
    focusOnMount = false,
    skipLinks = true,
    reducedMotion = true,
  } = options;

  const announcementRef = useRef<HTMLDivElement>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!announcePageChanges) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('class', 'sr-only');
    liveRegion.id = 'accessibility-announcements';
    
    document.body.appendChild(liveRegion);

    return () => {
      if (document.getElementById('accessibility-announcements')) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [announcePageChanges]);

  // Announce content changes
  const announce = useCallback((message: string) => {
    const liveRegion = document.getElementById('accessibility-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, []);

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Skip to main content
  const skipToMain = useCallback(() => {
    const mainElement = document.querySelector('main') as HTMLElement;
    if (mainElement) {
      mainElement.focus();
      mainElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Keyboard navigation helper
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    actions: Record<string, () => void>
  ) => {
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }, []);

  // Focus trap for modals
  const createFocusTrap = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    if (focusOnMount) {
      const mainElement = document.querySelector('main, [role="main"], h1') as HTMLElement;
      if (mainElement) {
        mainElement.focus();
      }
    }
  }, [focusOnMount]);

  // Add skip links
  useEffect(() => {
    if (!skipLinks) return;

    const existingSkipLink = document.getElementById('skip-to-main');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.id = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      skipToMain();
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (document.getElementById('skip-to-main')) {
        document.body.removeChild(skipLink);
      }
    };
  }, [skipLinks, skipToMain]);

  return {
    announce,
    focusElement,
    skipToMain,
    prefersReducedMotion,
    handleKeyDown,
    createFocusTrap,
  };
};

export default useAccessibility;