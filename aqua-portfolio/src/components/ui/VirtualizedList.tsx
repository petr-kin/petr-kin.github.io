'use client';

import React, { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { useVirtualization, useGridVirtualization } from '@/hooks/useVirtualization';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn, debounce } from '@/lib/utils';

// List Virtualization Component
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  width?: string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number, isScrolling: boolean) => void;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export interface VirtualizedListRef {
  scrollToItem: (index: number, align?: 'start' | 'center' | 'end') => void;
  scrollToTop: () => void;
}

function VirtualizedListComponent<T = unknown>({
    items,
    itemHeight,
    height,
    width = '100%',
    renderItem,
    overscan = 5,
    className,
    onScroll,
    loadingComponent,
    emptyComponent,
    getItemKey = (_, index) => index.toString(),
  }: VirtualizedListProps<T>, ref: React.Ref<VirtualizedListRef>) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Intersection observer for visibility optimization
    const { targetRef: visibilityRef, isIntersecting } = useIntersectionObserver({
      threshold: 0.1,
      freezeOnceVisible: false
    });

    // Debounced scroll callback for performance
    const debouncedOnScroll = useCallback(
      onScroll ? debounce((scrollTop: number, isScrollingState: boolean) => {
        onScroll(scrollTop, isScrollingState);
      }, 16) : undefined,
      [onScroll]
    );

    const {
      virtualItems,
      totalSize,
      scrollToItem,
      isScrolling,
    } = useVirtualization({
      itemCount: items.length,
      itemHeight,
      containerHeight: height,
      overscan: isIntersecting ? overscan : 0, // Reduce overscan when not visible
      getScrollElement: () => containerRef.current,
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToItem: (index: number, align: 'start' | 'center' | 'end' = 'start') => {
        scrollToItem(index, align);
      },
      scrollToTop: () => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
    }));

    // Handle scroll events
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      if (debouncedOnScroll) {
        debouncedOnScroll(event.currentTarget.scrollTop, isScrolling);
      }
    }, [debouncedOnScroll, isScrolling]);

    // Show loading state
    if (!items) {
      return (
        <div 
          className={cn('flex items-center justify-center', className)}
          style={{ height, width }}
        >
          {loadingComponent || <div>Loading...</div>}
        </div>
      );
    }

    // Show empty state
    if (items.length === 0) {
      return (
        <div 
          className={cn('flex items-center justify-center', className)}
          style={{ height, width }}
        >
          {emptyComponent || <div>No items to display</div>}
        </div>
      );
    }

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          visibilityRef.current = node;
        }}
        className={cn('overflow-auto', className)}
        style={{ height, width }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.index;
            
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  height: virtualItem.size,
                  width: '100%',
                }}
              >
                {(() => {
                  try {
                    return renderItem(item, virtualItem.index);
                  } catch (error) {
                    console.error(`Error rendering item at index ${virtualItem.index}:`, error);
                    return (
                      <div className="flex items-center justify-center h-full text-red-500 text-sm">
                        Error rendering item
                      </div>
                    );
                  }
                })()}
              </div>
            );
          })}
        </div>
      </div>
    );
}

export const VirtualizedList = forwardRef(VirtualizedListComponent) as <T = unknown>(
  props: VirtualizedListProps<T> & { ref?: React.Ref<VirtualizedListRef> }
) => React.ReactElement;

VirtualizedList.displayName = 'VirtualizedList';

// Grid Virtualization Component
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  width: number;
  height: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export const VirtualizedGrid = <T,>({
  items,
  itemWidth,
  itemHeight,
  width,
  height,
  gap = 16,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  loadingComponent,
  emptyComponent,
  getItemKey,
}: VirtualizedGridProps<T>) => {
  const {
    virtualItems,
    totalWidth,
    totalHeight,
    handleScroll: handleGridScroll,
  } = useGridVirtualization({
    itemCount: items.length,
    itemWidth,
    itemHeight,
    containerWidth: width,
    containerHeight: height,
    gap,
    overscan,
  });

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    handleGridScroll(event);
    onScroll?.(event.currentTarget.scrollTop, event.currentTarget.scrollLeft);
  };

  // Show loading state
  if (!items) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        {loadingComponent || <div>Loading...</div>}
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        {emptyComponent || <div>No items to display</div>}
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ width, height }}
      onScroll={handleScroll}
    >
      <div 
        style={{ 
          width: totalWidth, 
          height: totalHeight, 
          position: 'relative' 
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.index;
          
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: virtualItem.x,
                top: virtualItem.y,
                width: virtualItem.width,
                height: virtualItem.height,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Window Virtualization for full-screen lists
interface WindowVirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export const WindowVirtualizedList = <T,>({
  items,
  itemHeight,
  renderItem,
  overscan = 10,
  className,
  getItemKey,
}: WindowVirtualizedListProps<T>) => {
  const {
    virtualItems,
    totalSize,
  } = useVirtualization({
    itemCount: items.length,
    itemHeight,
    containerHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    overscan,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full', className)} style={{ height: totalSize }}>
      {virtualItems.map((virtualItem) => {
        const item = items[virtualItem.index];
        const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.index;
        
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
              width: '100%',
            }}
          >
            {renderItem(item, virtualItem.index)}
          </div>
        );
      })}
    </div>
  );
};

// Infinite scroll wrapper
interface InfiniteVirtualizedListProps<T> extends VirtualizedListProps<T> {
  hasNextPage?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  threshold?: number;
}

export const InfiniteVirtualizedList = <T,>({
  hasNextPage = false,
  isLoading = false,
  onLoadMore,
  threshold = 5,
  onScroll,
  ...props
}: InfiniteVirtualizedListProps<T>) => {
  const handleScroll = (scrollTop: number, isScrollingState: boolean) => {
    onScroll?.(scrollTop, isScrollingState);

    // Trigger load more when near the end
    if (hasNextPage && !isLoading && onLoadMore) {
      const scrollPercentage = scrollTop / (props.items.length * 
        (typeof props.itemHeight === 'number' ? props.itemHeight : 100));
      
      if (scrollPercentage > 1 - (threshold / props.items.length)) {
        onLoadMore();
      }
    }
  };

  return <VirtualizedList {...props} onScroll={handleScroll} />;
};