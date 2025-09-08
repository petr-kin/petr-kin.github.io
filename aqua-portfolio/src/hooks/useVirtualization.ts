'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface GridVirtualItem extends VirtualItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseVirtualizationOptions {
  itemCount: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  getScrollElement?: () => HTMLElement | null;
}

export interface UseGridVirtualizationOptions {
  itemCount: number;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
}

export const useVirtualization = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
  getScrollElement,
}: UseVirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let currentPosition = 0;

    for (let i = 0; i < itemCount; i++) {
      positions[i] = currentPosition;
      const height = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      currentPosition += height;
    }

    return positions;
  }, [itemCount, itemHeight]);

  const totalSize = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    const lastIndex = itemPositions.length - 1;
    const lastHeight = typeof itemHeight === 'function' ? itemHeight(lastIndex) : itemHeight;
    return itemPositions[lastIndex] + lastHeight;
  }, [itemPositions, itemHeight, itemCount]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (itemCount === 0) return { startIndex: 0, endIndex: 0 };

    const start = Math.max(0, 
      itemPositions.findIndex(pos => pos + (typeof itemHeight === 'function' ? itemHeight(itemPositions.indexOf(pos)) : itemHeight) >= scrollTop) - overscan
    );
    
    const end = Math.min(itemCount - 1,
      itemPositions.findIndex(pos => pos > scrollTop + containerHeight) + overscan
    );

    return {
      startIndex: start,
      endIndex: end === -1 ? itemCount - 1 : end,
    };
  }, [scrollTop, containerHeight, itemPositions, itemCount, overscan, itemHeight]);

  // Generate virtual items
  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const start = itemPositions[i];
      const size = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      
      items.push({
        index: i,
        start,
        size,
        end: start + size,
      });
    }
    
    return items;
  }, [visibleRange, itemPositions, itemHeight]);

  // Scroll to item function
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    const element = getScrollElement?.();
    if (!element || index < 0 || index >= itemCount) return;

    const itemStart = itemPositions[index];
    const itemSize = typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    
    let scrollTo = itemStart;
    
    if (align === 'center') {
      scrollTo = itemStart - (containerHeight - itemSize) / 2;
    } else if (align === 'end') {
      scrollTo = itemStart - containerHeight + itemSize;
    }
    
    element.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
  }, [getScrollElement, itemCount, itemPositions, itemHeight, containerHeight]);

  // Handle scroll events
  useEffect(() => {
    const element = getScrollElement?.();
    if (!element) return;

    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
      setIsScrolling(true);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [getScrollElement]);

  return {
    virtualItems,
    totalSize,
    scrollToItem,
    isScrolling,
    visibleRange,
  };
};

export const useGridVirtualization = ({
  itemCount,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 0,
  overscan = 5,
}: UseGridVirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate grid dimensions
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(itemCount / columnsCount);
  
  const totalWidth = columnsCount * itemWidth + (columnsCount - 1) * gap;
  const totalHeight = rowsCount * itemHeight + (rowsCount - 1) * gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(rowsCount - 1, Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan);
    
    const startCol = Math.max(0, Math.floor(scrollLeft / (itemWidth + gap)) - overscan);
    const endCol = Math.min(columnsCount - 1, Math.ceil((scrollLeft + containerWidth) / (itemWidth + gap)) + overscan);

    return { startRow, endRow, startCol, endCol };
  }, [scrollTop, scrollLeft, containerHeight, containerWidth, itemHeight, itemWidth, gap, overscan, rowsCount, columnsCount]);

  // Generate virtual items
  const virtualItems = useMemo((): GridVirtualItem[] => {
    const items: GridVirtualItem[] = [];
    
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
        const index = row * columnsCount + col;
        if (index >= itemCount) break;
        
        const x = col * (itemWidth + gap);
        const y = row * (itemHeight + gap);
        
        items.push({
          index,
          start: y,
          size: itemHeight,
          end: y + itemHeight,
          x,
          y,
          width: itemWidth,
          height: itemHeight,
        });
      }
    }
    
    return items;
  }, [visibleRange, columnsCount, itemCount, itemWidth, itemHeight, gap]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    setScrollLeft(event.currentTarget.scrollLeft);
  }, []);

  return {
    virtualItems,
    totalWidth,
    totalHeight,
    handleScroll,
    columnsCount,
    rowsCount,
  };
};