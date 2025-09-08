'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  escapeDeactivates?: boolean;
  onEscape?: () => void;
}

/**
 * Hook to trap focus within a container for better accessibility
 * Useful for modals, dialogs, and other overlay components
 */
export const useFocusTrap = ({
  enabled = true,
  autoFocus = true,
  restoreFocus = true,
  escapeDeactivates = true,
  onEscape,
}: UseFocusTrapOptions = {}) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'summary',
      'details[open]',
      'audio[controls]',
      'video[controls]',
      'iframe',
      'object',
      'embed',
      'area[href]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]',
      '[role="checkbox"]',
      '[role="radio"]'
    ].join(', ');

    const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    
    return Array.from(elements).filter(element => {
      // Filter out elements that are not visible or not interactive
      const style = getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('inert') &&
        element.offsetParent !== null
      );
    });
  }, []);

  // Handle tab key navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    // Handle Escape key
    if (event.key === 'Escape' && escapeDeactivates) {
      event.preventDefault();
      onEscape?.();
      return;
    }

    // Handle Tab key
    if (event.key === 'Tab') {
      // If no element is focused within the trap, focus the first element
      if (!containerRef.current.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      // Shift + Tab (backward)
      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab (forward)
      else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [enabled, escapeDeactivates, onEscape, getFocusableElements]);

  // Focus first element when trap is activated
  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  // Set up focus trap
  useEffect(() => {
    if (!enabled) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    // Focus the first element if autoFocus is enabled
    if (autoFocus) {
      // Use setTimeout to ensure the container is rendered
      const timeoutId = setTimeout(focusFirstElement, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [enabled, autoFocus, restoreFocus, focusFirstElement]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to previously focused element
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    };
  }, [enabled, handleKeyDown, restoreFocus]);

  return {
    containerRef,
    focusFirstElement,
    focusableElements: containerRef.current ? getFocusableElements(containerRef.current) : [],
  };
};

/**
 * Higher-order component to add focus trap functionality
 */
export const withFocusTrap = <P extends object>(
  Component: React.ComponentType<P>,
  focusTrapOptions?: UseFocusTrapOptions
) => {
  const FocusTrapWrapper = React.forwardRef<HTMLElement, P>((props, ref) => {
    const { containerRef } = useFocusTrap(focusTrapOptions);

    return <Component {...props} ref={ref || containerRef} />;
  });

  FocusTrapWrapper.displayName = `withFocusTrap(${Component.displayName || Component.name})`;
  return FocusTrapWrapper;
};

export default useFocusTrap;