'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface UseVirtualizationOptions {
  itemCount: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  scrollingDelay?: number;
  getScrollElement?: () => Element | null;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export const useVirtualization = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
  scrollingDelay = 150,
  getScrollElement,
}: UseVirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollElementRef = useRef<Element | null>(null);

  // Memoize item size function
  const getItemSize = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index);
      }
      return itemHeight;
    },
    [itemHeight]
  );

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: Array<{ start: number; size: number }> = [];
    let start = 0;

    for (let i = 0; i < itemCount; i++) {
      const size = getItemSize(i);
      positions[i] = { start, size };
      start += size;
    }

    return positions;
  }, [itemCount, getItemSize]);

  // Calculate total size
  const totalSize = useMemo(() => {
    return itemPositions.length > 0
      ? itemPositions[itemPositions.length - 1].start + 
        itemPositions[itemPositions.length - 1].size
      : 0;
  }, [itemPositions]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (itemPositions.length === 0) {
      return { start: 0, end: 0 };
    }

    // Find first visible item
    let start = 0;
    let end = itemPositions.length - 1;

    // Binary search for start
    let low = 0;
    let high = itemPositions.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const itemEnd = itemPositions[mid].start + itemPositions[mid].size;
      
      if (itemEnd <= scrollTop) {
        low = mid + 1;
        start = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Find last visible item
    const visibleEnd = scrollTop + containerHeight;
    end = start;
    
    while (end < itemPositions.length && itemPositions[end].start < visibleEnd) {
      end++;
    }

    // Apply overscan
    start = Math.max(0, start - overscan);
    end = Math.min(itemPositions.length, end + overscan);

    return { start, end };
  }, [scrollTop, containerHeight, itemPositions, overscan]);

  // Calculate visible items
  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const position = itemPositions[i];
      if (position) {
        items.push({
          index: i,
          start: position.start,
          size: position.size,
        });
      }
    }
    
    return items;
  }, [visibleRange, itemPositions]);

  // Scroll handler
  const handleScroll = useCallback((event: Event) => {
    const element = event.target as Element;
    const newScrollTop = element.scrollTop;
    
    if (newScrollTop !== scrollTop) {
      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }

      // Set scrolling to false after delay
      scrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    }
  }, [scrollTop, scrollingDelay]);

  // Set up scroll listener
  useEffect(() => {
    const element = getScrollElement ? getScrollElement() : window;
    scrollElementRef.current = element instanceof Window ? document.documentElement : element;

    const scrollElement = scrollElementRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        if (scrollingTimeoutRef.current) {
          clearTimeout(scrollingTimeoutRef.current);
        }
      };
    }
  }, [handleScroll, getScrollElement]);

  // Scroll to item function
  const scrollToItem = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!scrollElementRef.current || index < 0 || index >= itemCount) {
        return;
      }

      const itemPosition = itemPositions[index];
      if (!itemPosition) return;

      let scrollTo = itemPosition.start;

      if (align === 'center') {
        scrollTo = itemPosition.start - (containerHeight - itemPosition.size) / 2;
      } else if (align === 'end') {
        scrollTo = itemPosition.start + itemPosition.size - containerHeight;
      }

      scrollTo = Math.max(0, Math.min(scrollTo, totalSize - containerHeight));

      if (scrollElementRef.current === document.documentElement) {
        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      } else {
        scrollElementRef.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }
    },
    [itemPositions, itemCount, containerHeight, totalSize]
  );

  // Get item offset (for absolute positioning)
  const getItemOffset = useCallback(
    (index: number): number => {
      const position = itemPositions[index];
      return position ? position.start : 0;
    },
    [itemPositions]
  );

  return {
    virtualItems,
    totalSize,
    visibleRange,
    isScrolling,
    scrollToItem,
    getItemOffset,
    scrollTop,
  };
};

// Hook for grid virtualization
export const useGridVirtualization = ({
  itemCount,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 0,
  overscan = 5,
}: {
  itemCount: number;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate columns
  const columnCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowCount = Math.ceil(itemCount / columnCount);

  // Calculate visible rows
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
  );

  // Calculate visible columns
  const startColumn = Math.max(0, Math.floor(scrollLeft / (itemWidth + gap)) - overscan);
  const endColumn = Math.min(
    columnCount,
    Math.ceil((scrollLeft + containerWidth) / (itemWidth + gap)) + overscan
  );

  // Generate visible items
  const virtualItems = useMemo(() => {
    const items = [];
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = startColumn; col < endColumn; col++) {
        const index = row * columnCount + col;
        
        if (index < itemCount) {
          items.push({
            index,
            row,
            column: col,
            x: col * (itemWidth + gap),
            y: row * (itemHeight + gap),
            width: itemWidth,
            height: itemHeight,
          });
        }
      }
    }
    
    return items;
  }, [
    startRow,
    endRow,
    startColumn,
    endColumn,
    columnCount,
    itemCount,
    itemWidth,
    itemHeight,
    gap,
  ]);

  const totalWidth = columnCount * (itemWidth + gap) - gap;
  const totalHeight = rowCount * (itemHeight + gap) - gap;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    setScrollTop(element.scrollTop);
    setScrollLeft(element.scrollLeft);
  }, []);

  return {
    virtualItems,
    totalWidth,
    totalHeight,
    handleScroll,
    columnCount,
    rowCount,
  };
};