'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface UseFocusTrapOptions {
  active?: boolean;
  focusFirstOnMount?: boolean;
  returnFocusOnDeactivate?: boolean;
  allowOutsideClick?: boolean;
  escapeKeyDeactivates?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export const useFocusTrap = (options: UseFocusTrapOptions = {}) => {
  const {
    active = true,
    focusFirstOnMount = true,
    returnFocusOnDeactivate = true,
    allowOutsideClick = false,
    escapeKeyDeactivates = true,
    onActivate,
    onDeactivate,
  } = options;

  const trapRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isActivatedRef = useRef(false);

  // Get all focusable elements within the trap
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!trapRef.current) return [];

    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
      'details > summary:first-of-type',
      'audio[controls]',
      'video[controls]',
    ].join(', ');

    const elements = Array.from(trapRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      // Check if element is actually visible and focusable
      const computedStyle = window.getComputedStyle(element);
      const isVisible = computedStyle.display !== 'none' && 
                       computedStyle.visibility !== 'hidden' && 
                       element.offsetWidth > 0 && 
                       element.offsetHeight > 0;
      
      return isVisible && !element.hasAttribute('aria-hidden');
    });
  }, []);

  // Focus first element in trap
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus last element in trap
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle tab navigation
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || !isActivatedRef.current) return;

    switch (event.key) {
      case 'Tab':
        handleTabKey(event);
        break;
      case 'Escape':
        if (escapeKeyDeactivates) {
          event.preventDefault();
          deactivate();
        }
        break;
    }
  }, [active, handleTabKey, escapeKeyDeactivates]);

  // Handle clicks outside the trap
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!active || !isActivatedRef.current || allowOutsideClick) return;

    const target = event.target as Node;
    
    if (trapRef.current && !trapRef.current.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
      focusFirstElement();
    }
  }, [active, allowOutsideClick, focusFirstElement]);

  // Activate the focus trap
  const activate = useCallback(() => {
    if (isActivatedRef.current || !active) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    isActivatedRef.current = true;
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside, true);

    // Focus first element if requested
    if (focusFirstOnMount) {
      // Use setTimeout to ensure the trap element is rendered
      setTimeout(() => {
        focusFirstElement();
      }, 0);
    }

    onActivate?.();
  }, [active, focusFirstOnMount, handleKeyDown, handleClickOutside, focusFirstElement, onActivate]);

  // Deactivate the focus trap
  const deactivate = useCallback(() => {
    if (!isActivatedRef.current) return;

    isActivatedRef.current = false;
    
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleClickOutside, true);

    // Return focus to previously focused element
    if (returnFocusOnDeactivate && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }

    onDeactivate?.();
  }, [handleKeyDown, handleClickOutside, returnFocusOnDeactivate, onDeactivate]);

  // Effect to handle activation/deactivation
  useEffect(() => {
    if (active) {
      activate();
    } else {
      deactivate();
    }

    return () => {
      deactivate();
    };
  }, [active, activate, deactivate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivate();
    };
  }, [deactivate]);

  return {
    trapRef,
    activate,
    deactivate,
    focusFirstElement,
    focusLastElement,
    isActive: isActivatedRef.current,
  };
};