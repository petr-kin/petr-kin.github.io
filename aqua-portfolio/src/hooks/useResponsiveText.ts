'use client';

import { useMemo, useCallback } from 'react';
import { useResponsive } from './useResponsive';

export interface TextSizeConfig {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  xxl?: number | string;
}

export interface ResponsiveTextOptions {
  baseSize?: number; // Base font size in px
  scaleRatio?: number; // Scale ratio for different breakpoints
  minSize?: number; // Minimum font size
  maxSize?: number; // Maximum font size
  lineHeight?: number | string; // Line height multiplier or fixed value
  fluidScaling?: boolean; // Enable fluid/viewport-based scaling
  respectUserPreference?: boolean; // Respect user's font size preferences
}

const defaultTypographyScale = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  xxl: '1.5rem',   // 24px
};

export const useResponsiveText = (options: ResponsiveTextOptions = {}) => {
  const {
    baseSize = 16,
    scaleRatio = 1.2,
    minSize = 12,
    maxSize = 32,
    lineHeight = 1.5,
    fluidScaling = false,
    respectUserPreference = true,
  } = options;

  const { getResponsiveValue, viewport, isMobile, isTablet, breakpoint } = useResponsive();

  // Generate typography scale
  const typographyScale = useMemo(() => {
    const scale: Record<string, number> = {};
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    
    breakpoints.forEach((bp, index) => {
      const multiplier = Math.pow(scaleRatio, index - 2); // md is baseline (index 2)
      scale[bp] = Math.max(minSize, Math.min(maxSize, baseSize * multiplier));
    });

    return scale;
  }, [baseSize, scaleRatio, minSize, maxSize]);

  // Calculate fluid font size
  const calculateFluidSize = useCallback((
    minSize: number,
    maxSize: number,
    minViewport: number = 320,
    maxViewport: number = 1200
  ) => {
    if (!fluidScaling || viewport.width === 0) {
      return getResponsiveValue({
        xs: minSize,
        sm: minSize + (maxSize - minSize) * 0.2,
        md: minSize + (maxSize - minSize) * 0.4,
        lg: minSize + (maxSize - minSize) * 0.6,
        xl: minSize + (maxSize - minSize) * 0.8,
        xxl: maxSize,
      });
    }

    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const intercept = minSize - slope * minViewport;
    const fluidSize = slope * viewport.width + intercept;
    
    return Math.max(minSize, Math.min(maxSize, fluidSize));
  }, [fluidScaling, viewport.width, getResponsiveValue]);

  // Get responsive font size
  const getFontSize = useCallback((sizeConfig: TextSizeConfig | number = baseSize) => {
    if (typeof sizeConfig === 'number') {
      return fluidScaling 
        ? calculateFluidSize(sizeConfig * 0.8, sizeConfig * 1.2)
        : sizeConfig;
    }

    const responsiveSize = getResponsiveValue(sizeConfig);
    return responsiveSize || typographyScale[breakpoint];
  }, [baseSize, fluidScaling, calculateFluidSize, getResponsiveValue, typographyScale, breakpoint]);

  // Get responsive line height
  const getLineHeight = useCallback((fontSize: number) => {
    if (typeof lineHeight === 'number') {
      return fontSize * lineHeight;
    }
    return lineHeight;
  }, [lineHeight]);

  // Generate text styles
  const getTextStyles = useCallback((
    sizeConfig: TextSizeConfig | number = baseSize,
    customLineHeight?: number | string
  ) => {
    const fontSize = getFontSize(sizeConfig);
    const computedLineHeight = customLineHeight || getLineHeight(typeof fontSize === 'number' ? fontSize : parseFloat(fontSize.toString()));
    
    const styles: React.CSSProperties = {
      fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
      lineHeight: computedLineHeight,
    };

    // Add responsive font size adjustments for accessibility
    if (respectUserPreference) {
      styles.fontSize = `max(${styles.fontSize}, 1rem)`;
    }

    // Mobile-specific optimizations
    if (isMobile) {
      styles.webkitTextSizeAdjust = '100%'; // Prevent iOS text size adjustment
      styles.textSizeAdjust = '100%';
    }

    return styles;
  }, [baseSize, getFontSize, getLineHeight, respectUserPreference, isMobile]);

  // Predefined text styles
  const textStyles = useMemo(() => ({
    display: getTextStyles({
      xs: typographyScale.lg,
      sm: typographyScale.xl,
      md: typographyScale.xxl,
      lg: 28,
      xl: 32,
      xxl: 36,
    }, 1.2),
    
    h1: getTextStyles({
      xs: typographyScale.lg,
      sm: typographyScale.xl,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
    }, 1.3),
    
    h2: getTextStyles({
      xs: typographyScale.md,
      sm: typographyScale.lg,
      md: 20,
      lg: 24,
      xl: 28,
      xxl: 32,
    }, 1.3),
    
    h3: getTextStyles({
      xs: typographyScale.sm,
      sm: typographyScale.md,
      md: 18,
      lg: 20,
      xl: 24,
      xxl: 28,
    }, 1.4),
    
    h4: getTextStyles({
      xs: typographyScale.sm,
      sm: typographyScale.md,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    }, 1.4),
    
    h5: getTextStyles({
      xs: typographyScale.xs,
      sm: typographyScale.sm,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
    }, 1.5),
    
    h6: getTextStyles({
      xs: typographyScale.xs,
      sm: typographyScale.sm,
      md: 12,
      lg: 14,
      xl: 16,
      xxl: 18,
    }, 1.5),
    
    body: getTextStyles({
      xs: typographyScale.sm,
      sm: typographyScale.md,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    }, 1.6),
    
    small: getTextStyles({
      xs: typographyScale.xs,
      sm: typographyScale.sm,
      md: 14,
      lg: 14,
      xl: 14,
      xxl: 16,
    }, 1.5),
    
    caption: getTextStyles({
      xs: typographyScale.xs,
      sm: typographyScale.xs,
      md: 12,
      lg: 12,
      xl: 14,
      xxl: 14,
    }, 1.4),
    
    button: getTextStyles({
      xs: typographyScale.sm,
      sm: typographyScale.md,
      md: 14,
      lg: 16,
      xl: 16,
      xxl: 18,
    }, 1.2),
  }), [typographyScale, getTextStyles]);

  // Generate CSS custom properties
  const getCSSVariables = useCallback(() => {
    const vars: Record<string, string> = {};
    
    Object.entries(textStyles).forEach(([key, styles]) => {
      vars[`--text-${key}-size`] = styles.fontSize?.toString() || '1rem';
      vars[`--text-${key}-line-height`] = styles.lineHeight?.toString() || '1.5';
    });

    // Add scale variables
    Object.entries(typographyScale).forEach(([bp, size]) => {
      vars[`--text-scale-${bp}`] = `${size}px`;
    });

    return vars;
  }, [textStyles, typographyScale]);

  // Clamp function for CSS
  const clamp = useCallback((min: number, preferred: number, max: number) => {
    return `clamp(${min}px, ${preferred}px, ${max}px)`;
  }, []);

  // Fluid font size CSS
  const fluidFont = useCallback((
    minSize: number,
    maxSize: number,
    minViewport: number = 320,
    maxViewport: number = 1200
  ) => {
    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const intercept = minSize - slope * minViewport;
    
    return `clamp(${minSize}px, ${intercept}px + ${slope * 100}vw, ${maxSize}px)`;
  }, []);

  // Responsive text classes
  const getTextClasses = useCallback((variant: keyof typeof textStyles) => {
    const classes = [`text-${variant}`];
    
    if (isMobile) classes.push(`text-${variant}--mobile`);
    if (isTablet) classes.push(`text-${variant}--tablet`);
    
    return classes.join(' ');
  }, [isMobile, isTablet]);

  // Reading optimization (increase line height and letter spacing for long text)
  const getReadingOptimizedStyles = useCallback((fontSize: number) => {
    return {
      fontSize: `${fontSize}px`,
      lineHeight: Math.max(1.6, fontSize > 18 ? 1.7 : 1.6),
      letterSpacing: fontSize > 16 ? '0.01em' : '0',
      wordSpacing: fontSize > 16 ? '0.05em' : '0',
    };
  }, []);

  return {
    // Core functions
    getFontSize,
    getLineHeight,
    getTextStyles,
    
    // Predefined styles
    textStyles,
    
    // Utilities
    getCSSVariables,
    getTextClasses,
    clamp,
    fluidFont,
    calculateFluidSize,
    getReadingOptimizedStyles,
    
    // Scale
    typographyScale,
    
    // Configuration
    options: {
      baseSize,
      scaleRatio,
      minSize,
      maxSize,
      lineHeight,
      fluidScaling,
      respectUserPreference,
    },
  };
};

// Specialized hook for headings
export const useResponsiveHeading = (level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => {
  const { textStyles, getTextClasses } = useResponsiveText();
  const headingKey = `h${level}` as keyof typeof textStyles;
  
  return {
    styles: textStyles[headingKey],
    className: getTextClasses(headingKey),
    level,
  };
};

// Hook for body text with reading optimizations
export const useResponsiveBodyText = (optimizeForReading = true) => {
  const { textStyles, getReadingOptimizedStyles } = useResponsiveText();
  
  const bodyStyles = optimizeForReading 
    ? getReadingOptimizedStyles(parseFloat(textStyles.body.fontSize?.toString() || '16'))
    : textStyles.body;
    
  return {
    styles: bodyStyles,
    className: 'text-body',
    optimized: optimizeForReading,
  };
};