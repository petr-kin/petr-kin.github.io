import { StateCreator } from 'zustand';

export interface AccessibilityState {
  screenReaderMode: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announcements: string[];
  skipLinks: boolean;
  largeText: boolean;
  colorBlindnessSupport: boolean;
  autoplayDisabled: boolean;
  flashingDisabled: boolean;
  tooltipsEnabled: boolean;
  landmarksVisible: boolean;
  headingNavigation: boolean;
}

export interface AccessibilityActions {
  setScreenReaderMode: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setFocusVisible: (enabled: boolean) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
  setSkipLinks: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setColorBlindnessSupport: (enabled: boolean) => void;
  setAutoplayDisabled: (disabled: boolean) => void;
  setFlashingDisabled: (disabled: boolean) => void;
  setTooltipsEnabled: (enabled: boolean) => void;
  setLandmarksVisible: (visible: boolean) => void;
  setHeadingNavigation: (enabled: boolean) => void;
  detectAccessibilityPreferences: () => void;
  resetAccessibility: () => void;
}

export type AccessibilitySlice = {
  accessibility: AccessibilityState;
} & AccessibilityActions;

const initialAccessibilityState: AccessibilityState = {
  screenReaderMode: false,
  highContrast: false,
  keyboardNavigation: false,
  focusVisible: true,
  announcements: [],
  skipLinks: true,
  largeText: false,
  colorBlindnessSupport: false,
  autoplayDisabled: false,
  flashingDisabled: false,
  tooltipsEnabled: true,
  landmarksVisible: false,
  headingNavigation: false,
};

export const createAccessibilitySlice: StateCreator<AccessibilitySlice, [['zustand/immer', never]], [], AccessibilitySlice> = (set, get) => ({
  accessibility: initialAccessibilityState,

  setScreenReaderMode: (enabled) =>
    set((state) => {
      state.accessibility.screenReaderMode = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('screen-reader', enabled);
        
        // Announce mode change
        if (enabled) {
          get().announce('Screen reader mode enabled', 'assertive');
        }
      }
    }),

  setHighContrast: (enabled) =>
    set((state) => {
      state.accessibility.highContrast = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('high-contrast', enabled);
      }
    }),

  setKeyboardNavigation: (enabled) =>
    set((state) => {
      state.accessibility.keyboardNavigation = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('keyboard-nav', enabled);
        
        if (enabled) {
          // Add keyboard event listeners
          document.addEventListener('keydown', handleKeyboardNavigation);
        } else {
          document.removeEventListener('keydown', handleKeyboardNavigation);
        }
      }
    }),

  setFocusVisible: (enabled) =>
    set((state) => {
      state.accessibility.focusVisible = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('focus-visible', enabled);
      }
    }),

  announce: (message, priority = 'polite') =>
    set((state) => {
      state.accessibility.announcements.push(message);
      
      // Limit announcements to prevent memory issues
      if (state.accessibility.announcements.length > 10) {
        state.accessibility.announcements = state.accessibility.announcements.slice(-10);
      }
      
      if (typeof window !== 'undefined') {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('accessibility-announcements') as HTMLElement;
        if (!liveRegion) {
          liveRegion = document.createElement('div');
          liveRegion.id = 'accessibility-announcements';
          liveRegion.className = 'sr-only';
          liveRegion.setAttribute('aria-live', priority);
          liveRegion.setAttribute('aria-atomic', 'true');
          document.body.appendChild(liveRegion);
        }
        
        // Update live region
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          if (liveRegion && liveRegion.textContent === message) {
            liveRegion.textContent = '';
          }
        }, 1000);
      }
    }),

  clearAnnouncements: () =>
    set((state) => {
      state.accessibility.announcements = [];
    }),

  setSkipLinks: (enabled) =>
    set((state) => {
      state.accessibility.skipLinks = enabled;
      
      if (typeof window !== 'undefined') {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
          (link as HTMLElement).style.display = enabled ? 'block' : 'none';
        });
      }
    }),

  setLargeText: (enabled) =>
    set((state) => {
      state.accessibility.largeText = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('large-text', enabled);
        document.documentElement.style.fontSize = enabled ? '120%' : '';
      }
    }),

  setColorBlindnessSupport: (enabled) =>
    set((state) => {
      state.accessibility.colorBlindnessSupport = enabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('colorblind-support', enabled);
      }
    }),

  setAutoplayDisabled: (disabled) =>
    set((state) => {
      state.accessibility.autoplayDisabled = disabled;
      
      if (typeof window !== 'undefined' && disabled) {
        // Pause all videos and animations
        const videos = document.querySelectorAll('video');
        videos.forEach(video => video.pause());
        
        // Add CSS to disable animations
        document.documentElement.classList.toggle('no-autoplay', disabled);
      }
    }),

  setFlashingDisabled: (disabled) =>
    set((state) => {
      state.accessibility.flashingDisabled = disabled;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('no-flashing', disabled);
      }
    }),

  setTooltipsEnabled: (enabled) =>
    set((state) => {
      state.accessibility.tooltipsEnabled = enabled;
    }),

  setLandmarksVisible: (visible) =>
    set((state) => {
      state.accessibility.landmarksVisible = visible;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('landmarks-visible', visible);
      }
    }),

  setHeadingNavigation: (enabled) =>
    set((state) => {
      state.accessibility.headingNavigation = enabled;
      
      if (typeof window !== 'undefined') {
        if (enabled) {
          document.addEventListener('keydown', handleHeadingNavigation);
        } else {
          document.removeEventListener('keydown', handleHeadingNavigation);
        }
      }
    }),

  detectAccessibilityPreferences: () =>
    set((state) => {
      if (typeof window === 'undefined') return;
      
      // Detect system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const prefersLargeText = window.matchMedia('(prefers-reduced-data: reduce)').matches;
      
      if (prefersReducedMotion) {
        get().setAutoplayDisabled(true);
        get().setFlashingDisabled(true);
      }
      
      if (prefersHighContrast) {
        get().setHighContrast(true);
      }
      
      if (prefersLargeText) {
        get().setLargeText(true);
      }
      
      // Detect screen reader usage
      const hasScreenReader = navigator.userAgent.includes('NVDA') || 
                             navigator.userAgent.includes('JAWS') || 
                             navigator.userAgent.includes('VoiceOver') ||
                             window.speechSynthesis?.getVoices().length > 0;
      
      if (hasScreenReader) {
        get().setScreenReaderMode(true);
      }
      
      // Detect keyboard-only users
      let keyboardUser = false;
      const detectKeyboard = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          keyboardUser = true;
          get().setKeyboardNavigation(true);
          document.removeEventListener('keydown', detectKeyboard);
        }
      };
      
      const detectMouse = () => {
        if (!keyboardUser) {
          document.removeEventListener('keydown', detectKeyboard);
        }
        document.removeEventListener('mousemove', detectMouse);
      };
      
      document.addEventListener('keydown', detectKeyboard);
      document.addEventListener('mousemove', detectMouse);
    }),

  resetAccessibility: () =>
    set((state) => {
      // Clean up event listeners
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleKeyboardNavigation);
        document.removeEventListener('keydown', handleHeadingNavigation);
        
        // Remove accessibility classes
        document.documentElement.className = document.documentElement.className
          .split(' ')
          .filter(cls => !cls.startsWith('screen-reader') && 
                        !cls.startsWith('high-contrast') &&
                        !cls.startsWith('keyboard-nav') &&
                        !cls.startsWith('focus-visible') &&
                        !cls.startsWith('large-text') &&
                        !cls.startsWith('colorblind-support') &&
                        !cls.startsWith('no-autoplay') &&
                        !cls.startsWith('no-flashing') &&
                        !cls.startsWith('landmarks-visible'))
          .join(' ');
        
        // Reset font size
        document.documentElement.style.fontSize = '';
      }
      
      state.accessibility = initialAccessibilityState;
    }),
});

// Helper functions for keyboard navigation
function handleKeyboardNavigation(e: KeyboardEvent) {
  // Skip navigation (Alt + S)
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    const skipLink = document.querySelector('.skip-link') as HTMLElement;
    if (skipLink) {
      skipLink.focus();
      skipLink.click();
    }
  }
  
  // Focus main content (Alt + M)
  if (e.altKey && e.key === 'm') {
    e.preventDefault();
    const main = document.querySelector('main') as HTMLElement;
    if (main) {
      main.focus();
    }
  }
  
  // Focus navigation (Alt + N)
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    const nav = document.querySelector('nav') as HTMLElement;
    if (nav) {
      nav.focus();
    }
  }
}

function handleHeadingNavigation(e: KeyboardEvent) {
  // Navigate by headings (Alt + 1-6)
  if (e.altKey && e.key >= '1' && e.key <= '6') {
    e.preventDefault();
    const level = parseInt(e.key);
    const headings = document.querySelectorAll(`h${level}`);
    
    if (headings.length > 0) {
      // Find next heading after current focus
      const activeElement = document.activeElement;
      let startIndex = 0;
      
      for (let i = 0; i < headings.length; i++) {
        if (headings[i] === activeElement) {
          startIndex = (i + 1) % headings.length;
          break;
        }
      }
      
      const targetHeading = headings[startIndex] as HTMLElement;
      targetHeading.focus();
      targetHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}