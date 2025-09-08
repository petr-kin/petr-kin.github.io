'use client';

import React, { Suspense, ComponentType, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/Skeleton';

interface LazyBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  minHeight?: number;
}

/**
 * LazyBoundary - Lazy load components when they enter the viewport
 * Provides performance optimization by only rendering heavy components when needed
 */
export const LazyBoundary: React.FC<LazyBoundaryProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  className,
  minHeight = 200,
}) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: triggerOnce,
  });

  const shouldRender = isIntersecting;

  return (
    <div 
      ref={targetRef as React.RefObject<HTMLDivElement>} 
      className={className}
      style={{ minHeight: shouldRender ? 'auto' : minHeight }}
    >
      {shouldRender ? (
        <Suspense fallback={fallback || <LazyFallback minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        fallback || <LazyFallback minHeight={minHeight} />
      )}
    </div>
  );
};

/**
 * Higher-order component to wrap components with lazy loading
 */
export const withLazyBoundary = <P extends object>(
  Component: ComponentType<P>,
  options?: Omit<LazyBoundaryProps, 'children'>
) => {
  const LazyComponent = React.forwardRef<HTMLElement, P>((props, ref) => (
    <LazyBoundary {...options}>
      <Component {...props as P} />
    </LazyBoundary>
  ));

  LazyComponent.displayName = `withLazyBoundary(${Component.displayName || Component.name})`;
  return LazyComponent;
};

/**
 * Lazy loading wrapper specifically for heavy components
 */
export const LazyHeavyComponent: React.FC<{
  component: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  props?: Record<string, unknown>;
  fallback?: ReactNode;
  threshold?: number;
  minHeight?: number;
}> = ({ 
  component, 
  props = {}, 
  fallback,
  threshold = 0.1,
  minHeight = 300 
}) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
  });

  const [LazyComponent, setLazyComponent] = React.useState<ComponentType<Record<string, unknown>> | null>(null);

  React.useEffect(() => {
    if (isIntersecting && !LazyComponent) {
      component().then((module) => {
        setLazyComponent(() => module.default);
      }).catch((error) => {
        console.error('Failed to load lazy component:', error);
      });
    }
  }, [isIntersecting, LazyComponent, component]);

  return (
    <div 
      ref={targetRef as React.RefObject<HTMLDivElement>}
      style={{ minHeight: LazyComponent ? 'auto' : minHeight }}
    >
      {LazyComponent ? (
        <LazyComponent {...props} />
      ) : (
        fallback || <LazyFallback minHeight={minHeight} />
      )}
    </div>
  );
};

/**
 * Lazy loading for images with intersection observer
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}> = ({
  src,
  alt,
  className,
  width,
  height,
  blurDataURL,
  placeholder = 'empty',
  threshold = 0.1,
  onLoad,
  onError,
}) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
  });

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={targetRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isIntersecting ? (
        <>
          {/* Blur placeholder */}
          {placeholder === 'blur' && blurDataURL && !isLoaded && (
            <img
              src={blurDataURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm"
              aria-hidden="true"
            />
          )}
          
          {/* Actual image */}
          <img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } w-full h-full object-cover`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
          
          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              <span>Failed to load image</span>
            </div>
          )}
        </>
      ) : (
        /* Placeholder while not intersecting */
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Section-based lazy loading for large page sections
 */
export const LazySectionBoundary: React.FC<{
  children: ReactNode;
  sectionName: string;
  fallbackHeight?: number;
  className?: string;
}> = ({ 
  children, 
  sectionName, 
  fallbackHeight = 400,
  className 
}) => {
  return (
    <LazyBoundary
      threshold={0.05}
      rootMargin="100px"
      triggerOnce={true}
      className={className}
      minHeight={fallbackHeight}
      fallback={
        <div 
          className="flex items-center justify-center bg-gray-50 rounded-lg"
          style={{ minHeight: fallbackHeight }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {sectionName}...</p>
          </div>
        </div>
      }
    >
      {children}
    </LazyBoundary>
  );
};

/**
 * Default fallback component
 */
const LazyFallback: React.FC<{ minHeight?: number }> = ({ minHeight = 200 }) => (
  <div 
    className="flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"
    style={{ minHeight }}
  >
    <div className="text-center space-y-3">
      <Skeleton width={200} height={20} />
      <Skeleton width={150} height={16} />
      <Skeleton width={100} height={16} />
    </div>
  </div>
);

export default LazyBoundary;