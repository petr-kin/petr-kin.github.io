'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * Optimized image component with blur placeholders, error handling, and performance optimization
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  blurDataURL,
  placeholder = 'blur',
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  fallbackSrc,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  }, [onError, fallbackSrc, currentSrc]);

  // Generate blur data URL if not provided
  const getBlurDataURL = useCallback((w = 10, h = 10) => {
    if (blurDataURL) return blurDataURL;
    
    // Simple shimmer effect as base64 SVG
    const shimmer = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f3f4f6"/>
            <stop offset="50%" stop-color="#e5e7eb"/>
            <stop offset="100%" stop-color="#f3f4f6"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#shimmer)"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(shimmer)}`;
  }, [blurDataURL]);

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-500 text-sm',
          className
        )}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          ...style 
        }}
      >
        <span>Image failed to load</span>
      </div>
    );
  }

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    quality,
    style,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
    ...(priority && { priority: true }),
    ...(placeholder === 'blur' && { 
      placeholder: 'blur' as const,
      blurDataURL: getBlurDataURL(width, height)
    }),
  };

  return (
    <div className={cn('relative overflow-hidden', fill && 'w-full h-full')}>
      <Image {...imageProps} alt={alt} />
      
      {/* Loading overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          aria-hidden="true"
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;