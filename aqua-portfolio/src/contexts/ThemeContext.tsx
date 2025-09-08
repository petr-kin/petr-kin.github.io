'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider = ({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'aqua-theme' 
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on user preference and system preference
  const calculateActualTheme = (userTheme: Theme): 'light' | 'dark' => {
    if (userTheme === 'auto') {
      return getSystemTheme();
    }
    return userTheme;
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey) as Theme;
        if (stored && ['light', 'dark', 'auto'].includes(stored)) {
          setThemeState(stored);
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
      }
    }
  }, [storageKey]);

  // Update actual theme when user theme or system theme changes
  useEffect(() => {
    const newActualTheme = calculateActualTheme(theme);
    setActualTheme(newActualTheme);

    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newActualTheme);
      
      // Update meta theme-color for mobile browsers
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute(
          'content', 
          newActualTheme === 'dark' ? '#1a1a1a' : '#ffffff'
        );
      }
    }
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        
        // Update document class
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newActualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { actualTheme } = useTheme();
  
  return {
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    
    // CSS variables that can be used in styles
    vars: {
      '--theme-bg': actualTheme === 'dark' ? '#1a1a1a' : '#ffffff',
      '--theme-text': actualTheme === 'dark' ? '#ffffff' : '#1a1a1a',
      '--theme-border': actualTheme === 'dark' ? '#333333' : '#e5e5e5',
      '--theme-accent': actualTheme === 'dark' ? '#06b6d4' : '#0891b2',
    },
    
    // Utility classes
    classes: {
      bg: actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
      text: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
      border: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      card: actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    },
  };
};