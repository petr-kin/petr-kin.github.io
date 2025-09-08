import { StateCreator } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';
export type MotionPreference = 'auto' | 'reduce' | 'none';
export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeState {
  currentTheme: ThemeMode;
  systemTheme: 'light' | 'dark';
  colors: ThemeColors;
  accentColor: string;
  fontSize: FontSize;
  fontFamily: string;
  motionPreference: MotionPreference;
  reducedMotion: boolean;
  highContrast: boolean;
  customCSS: string;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

export interface ThemeActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: string) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setCustomCSS: (css: string) => void;
  setColorBlindness: (type: ThemeState['colorBlindness']) => void;
  resetTheme: () => void;
  getComputedTheme: () => 'light' | 'dark';
  updateSystemPreferences: () => void;
}

export type ThemeSlice = {
  theme: ThemeState;
} & ThemeActions;

// Default theme colors
const lightColors: ThemeColors = {
  primary: '#0ea5e9',
  secondary: '#64748b',
  accent: '#06b6d4',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const darkColors: ThemeColors = {
  primary: '#0ea5e9',
  secondary: '#94a3b8',
  accent: '#06b6d4',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const initialThemeState: ThemeState = {
  currentTheme: 'system',
  systemTheme: 'light',
  colors: lightColors,
  accentColor: '#06b6d4',
  fontSize: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  motionPreference: 'auto',
  reducedMotion: false,
  highContrast: false,
  customCSS: '',
  colorBlindness: 'none',
};

export const createThemeSlice: StateCreator<ThemeSlice, [['zustand/immer', never]], [], ThemeSlice> = (set, get) => ({
  theme: initialThemeState,

  setTheme: (theme) =>
    set((state) => {
      state.theme.currentTheme = theme;
      
      // Update colors based on computed theme
      const computedTheme = get().getComputedTheme();
      state.theme.colors = computedTheme === 'dark' ? darkColors : lightColors;
      
      // Apply theme to document
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', computedTheme);
        document.documentElement.classList.toggle('dark', computedTheme === 'dark');
      }
    }),

  toggleTheme: () =>
    set((state) => {
      const currentComputed = get().getComputedTheme();
      const newTheme = currentComputed === 'light' ? 'dark' : 'light';
      get().setTheme(newTheme);
    }),

  setSystemTheme: (theme) =>
    set((state) => {
      state.theme.systemTheme = theme;
      
      // If current theme is system, update colors
      if (state.theme.currentTheme === 'system') {
        state.theme.colors = theme === 'dark' ? darkColors : lightColors;
        
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      }
    }),

  setAccentColor: (color) =>
    set((state) => {
      state.theme.accentColor = color;
      state.theme.colors.accent = color;
      
      if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--color-accent', color);
      }
    }),

  setFontSize: (size) =>
    set((state) => {
      state.theme.fontSize = size;
      
      if (typeof window !== 'undefined') {
        const sizeMap = {
          xs: '14px',
          sm: '15px',
          md: '16px',
          lg: '18px',
          xl: '20px',
        };
        document.documentElement.style.setProperty('--font-size-base', sizeMap[size]);
      }
    }),

  setFontFamily: (family) =>
    set((state) => {
      state.theme.fontFamily = family;
      
      if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--font-family-base', family);
      }
    }),

  setMotionPreference: (preference) =>
    set((state) => {
      state.theme.motionPreference = preference;
      state.theme.reducedMotion = preference === 'reduce' || preference === 'none';
      
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-motion', preference);
        document.documentElement.classList.toggle('reduce-motion', state.theme.reducedMotion);
      }
    }),

  setReducedMotion: (reduced) =>
    set((state) => {
      state.theme.reducedMotion = reduced;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('reduce-motion', reduced);
      }
    }),

  setHighContrast: (highContrast) =>
    set((state) => {
      state.theme.highContrast = highContrast;
      
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('high-contrast', highContrast);
      }
    }),

  setCustomCSS: (css) =>
    set((state) => {
      state.theme.customCSS = css;
      
      if (typeof window !== 'undefined') {
        // Remove existing custom styles
        const existingStyle = document.getElementById('custom-theme-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Add new custom styles
        if (css.trim()) {
          const styleElement = document.createElement('style');
          styleElement.id = 'custom-theme-styles';
          styleElement.textContent = css;
          document.head.appendChild(styleElement);
        }
      }
    }),

  setColorBlindness: (type) =>
    set((state) => {
      state.theme.colorBlindness = type;
      
      if (typeof window !== 'undefined') {
        // Remove existing colorblindness classes
        document.documentElement.classList.remove(
          'colorblind-protanopia',
          'colorblind-deuteranopia',
          'colorblind-tritanopia',
          'colorblind-achromatopsia'
        );
        
        // Add new colorblindness class
        if (type !== 'none') {
          document.documentElement.classList.add(`colorblind-${type}`);
        }
      }
    }),

  resetTheme: () =>
    set((state) => {
      const systemTheme = state.theme.systemTheme;
      state.theme = { ...initialThemeState, systemTheme };
      
      if (typeof window !== 'undefined') {
        // Reset all theme-related attributes and classes
        document.documentElement.setAttribute('data-theme', systemTheme);
        document.documentElement.className = document.documentElement.className
          .split(' ')
          .filter(cls => !cls.startsWith('colorblind-') && cls !== 'dark' && cls !== 'reduce-motion' && cls !== 'high-contrast')
          .join(' ');
        
        if (systemTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        
        // Reset CSS custom properties
        const customStyle = document.getElementById('custom-theme-styles');
        if (customStyle) {
          customStyle.remove();
        }
      }
    }),

  getComputedTheme: () => {
    const state = get();
    
    if (state.theme.currentTheme === 'system') {
      return state.theme.systemTheme;
    }
    
    if (state.theme.currentTheme === 'auto') {
      // Auto theme based on time of day
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'light' : 'dark';
    }
    
    return state.theme.currentTheme as 'light' | 'dark';
  },

  updateSystemPreferences: () => {
    if (typeof window === 'undefined') return;
    
    const state = get();
    
    // Update system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark !== (state.theme.systemTheme === 'dark')) {
      get().setSystemTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Update motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion !== state.theme.reducedMotion) {
      get().setReducedMotion(prefersReducedMotion);
    }
    
    // Update contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast !== state.theme.highContrast) {
      get().setHighContrast(prefersHighContrast);
    }
  },
});