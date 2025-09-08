'use client';

import { useMemo, useCallback } from 'react';
import { useResponsive } from './useResponsive';

export interface GridOptions {
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  gap?: {
    xs?: number | string;
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    xxl?: number | string;
  };
  padding?: {
    xs?: number | string;
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    xxl?: number | string;
  };
  maxWidth?: number | string;
  minItemWidth?: number;
  aspectRatio?: number;
}

const defaultGridOptions: GridOptions = {
  columns: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 6,
  },
  gap: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    xxl: '3.5rem',
  },
  padding: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    xxl: '4rem',
  },
  maxWidth: '1200px',
  minItemWidth: 250,
};

export const useResponsiveGrid = (options: GridOptions = {}) => {
  const { getResponsiveValue, viewport, isMobile, isTablet, isDesktop } = useResponsive();
  const config = { ...defaultGridOptions, ...options };

  // Get current responsive values
  const currentColumns = getResponsiveValue(config.columns!) || 1;
  const currentGap = getResponsiveValue(config.gap!) || '1rem';
  const currentPadding = getResponsiveValue(config.padding!) || '1rem';

  // Calculate optimal columns based on available width and min item width
  const calculateOptimalColumns = useCallback((
    availableWidth: number,
    gap: string | number = currentGap,
    minWidth: number = config.minItemWidth || 250
  ) => {
    const gapValue = typeof gap === 'string' ? 
      parseFloat(gap.replace('rem', '')) * 16 : // Convert rem to px
      gap;

    // Account for gaps between items
    const totalGapWidth = (currentColumns - 1) * gapValue;
    const availableForItems = availableWidth - totalGapWidth;
    const optimalColumns = Math.floor(availableForItems / minWidth);
    
    return Math.max(1, Math.min(optimalColumns, currentColumns));
  }, [currentColumns, currentGap, config.minItemWidth]);

  // Get grid styles
  const gridStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      display: 'grid',
      gap: currentGap,
      padding: currentPadding,
      width: '100%',
      maxWidth: config.maxWidth,
      margin: '0 auto',
    };

    // Determine grid template columns
    if (config.minItemWidth && viewport.width > 0) {
      const optimalColumns = calculateOptimalColumns(viewport.width);
      styles.gridTemplateColumns = `repeat(${optimalColumns}, 1fr)`;
    } else {
      styles.gridTemplateColumns = `repeat(${currentColumns}, 1fr)`;
    }

    // Add aspect ratio if specified
    if (config.aspectRatio) {
      styles.gridAutoRows = `1fr`;
    }

    return styles;
  }, [currentColumns, currentGap, currentPadding, config.maxWidth, config.minItemWidth, config.aspectRatio, viewport.width, calculateOptimalColumns]);

  // Get item styles
  const getItemStyles = useCallback((itemOptions: {
    span?: number;
    aspectRatio?: number;
    minHeight?: number | string;
  } = {}) => {
    const styles: React.CSSProperties = {};

    if (itemOptions.span) {
      styles.gridColumn = `span ${Math.min(itemOptions.span, currentColumns)}`;
    }

    if (itemOptions.aspectRatio) {
      styles.aspectRatio = `${itemOptions.aspectRatio}`;
    } else if (config.aspectRatio) {
      styles.aspectRatio = `${config.aspectRatio}`;
    }

    if (itemOptions.minHeight) {
      styles.minHeight = itemOptions.minHeight;
    }

    return styles;
  }, [currentColumns, config.aspectRatio]);

  // Generate responsive CSS classes
  const getResponsiveClasses = useCallback((baseClass: string) => {
    const classes = [];

    if (isMobile) classes.push(`${baseClass}--mobile`);
    if (isTablet) classes.push(`${baseClass}--tablet`);
    if (isDesktop) classes.push(`${baseClass}--desktop`);

    classes.push(`${baseClass}--cols-${currentColumns}`);
    
    return classes.join(' ');
  }, [isMobile, isTablet, isDesktop, currentColumns]);

  // Generate CSS variables for dynamic styling
  const getCSSVariables = useCallback(() => {
    return {
      '--grid-columns': currentColumns.toString(),
      '--grid-gap': typeof currentGap === 'number' ? `${currentGap}px` : currentGap,
      '--grid-padding': typeof currentPadding === 'number' ? `${currentPadding}px` : currentPadding,
      '--grid-max-width': typeof config.maxWidth === 'number' ? `${config.maxWidth}px` : config.maxWidth,
      '--grid-min-item-width': `${config.minItemWidth || 250}px`,
      '--grid-aspect-ratio': config.aspectRatio?.toString() || 'auto',
    };
  }, [currentColumns, currentGap, currentPadding, config.maxWidth, config.minItemWidth, config.aspectRatio]);

  // Auto-fit grid (responsive without media queries)
  const getAutoFitStyles = useCallback((minItemWidth: number = config.minItemWidth || 250) => {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
      gap: currentGap,
      padding: currentPadding,
      width: '100%',
      maxWidth: config.maxWidth,
      margin: '0 auto',
    };
  }, [currentGap, currentPadding, config.maxWidth, config.minItemWidth]);

  // Masonry-style grid
  const getMasonryStyles = useCallback((itemHeight: number = 200) => {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
      gridAutoRows: `${itemHeight}px`,
      gap: currentGap,
      padding: currentPadding,
      width: '100%',
      maxWidth: config.maxWidth,
      margin: '0 auto',
    };
  }, [currentColumns, currentGap, currentPadding, config.maxWidth]);

  // Calculate container dimensions
  const containerDimensions = useMemo(() => {
    const paddingValue = typeof currentPadding === 'string' ? 
      parseFloat(currentPadding.replace('rem', '')) * 16 : 
      currentPadding;
    
    const gapValue = typeof currentGap === 'string' ? 
      parseFloat(currentGap.replace('rem', '')) * 16 : 
      currentGap;

    const totalPadding = typeof paddingValue === 'number' ? paddingValue * 2 : 0;
    const totalGaps = (currentColumns - 1) * (typeof gapValue === 'number' ? gapValue : 0);
    
    const availableWidth = viewport.width - totalPadding;
    const itemWidth = (availableWidth - totalGaps) / currentColumns;

    return {
      containerWidth: Math.min(viewport.width, typeof config.maxWidth === 'number' ? config.maxWidth : viewport.width),
      availableWidth,
      itemWidth: Math.max(0, itemWidth),
      totalPadding,
      totalGaps,
    };
  }, [viewport.width, currentPadding, currentGap, currentColumns, config.maxWidth]);

  return {
    // Current state
    currentColumns,
    currentGap,
    currentPadding,
    containerDimensions,

    // Styles
    gridStyles,
    getItemStyles,
    getAutoFitStyles,
    getMasonryStyles,

    // Utilities
    getResponsiveClasses,
    getCSSVariables,
    calculateOptimalColumns,

    // Configuration
    config,
  };
};

// Specialized hook for card grids
export const useCardGrid = (minCardWidth: number = 300, aspectRatio: number = 1.2) => {
  return useResponsiveGrid({
    minItemWidth: minCardWidth,
    aspectRatio,
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      xxl: 6,
    },
  });
};

// Specialized hook for gallery grids
export const useGalleryGrid = (minImageWidth: number = 200, aspectRatio: number = 1) => {
  return useResponsiveGrid({
    minItemWidth: minImageWidth,
    aspectRatio,
    gap: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '2rem',
    },
  });
};