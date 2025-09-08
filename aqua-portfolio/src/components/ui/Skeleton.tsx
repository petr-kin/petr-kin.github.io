'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton = ({
  className,
  width,
  height,
  rounded = false,
  animate = true,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-800',
        animate && 'animate-pulse',
        rounded && 'rounded-full',
        !rounded && 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonText = ({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={cn('space-y-2', className)}>
    {[...Array(lines)].map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? '75%' : '100%'}
        className="h-4"
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <Skeleton
    width={size}
    height={size}
    rounded
    className={className}
  />
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4 p-6', className)}>
    <div className="flex items-center space-x-4">
      <SkeletonAvatar size={50} />
      <div className="space-y-2 flex-1">
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <Skeleton height={200} width="100%" className="rounded-lg" />
    <div className="flex space-x-2">
      <Skeleton height={32} width={80} className="rounded-md" />
      <Skeleton height={32} width={100} className="rounded-md" />
    </div>
  </div>
);

export const SkeletonBlogPost = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4', className)}>
    {/* Header */}
    <div className="space-y-2">
      <Skeleton height={32} width="80%" />
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size={32} />
        <div className="space-y-1">
          <Skeleton height={16} width={120} />
          <Skeleton height={14} width={80} />
        </div>
      </div>
    </div>
    
    {/* Content */}
    <Skeleton height={200} width="100%" className="rounded-lg" />
    <SkeletonText lines={4} />
    
    {/* Tags */}
    <div className="flex space-x-2">
      <Skeleton height={24} width={60} className="rounded-full" />
      <Skeleton height={24} width={80} className="rounded-full" />
      <Skeleton height={24} width={70} className="rounded-full" />
    </div>
  </div>
);

export const SkeletonCaseStudy = ({ className }: { className?: string }) => (
  <div className={cn('space-y-6', className)}>
    {/* Hero section */}
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Skeleton height={24} width={100} className="rounded-md" />
        <Skeleton height={20} width={80} />
      </div>
      <Skeleton height={40} width="90%" />
      <Skeleton height={24} width="70%" />
    </div>
    
    {/* Main image */}
    <Skeleton height={300} width="100%" className="rounded-xl" />
    
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={32} width="100%" />
          <Skeleton height={16} width="80%" />
        </div>
      ))}
    </div>
    
    {/* Content sections */}
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton height={24} width="40%" />
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonProjectGrid = ({ 
  count = 6, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) => (
  <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton height={200} width="100%" className="rounded-lg" />
        <div className="space-y-2">
          <Skeleton height={24} width="80%" />
          <SkeletonText lines={2} />
          <div className="flex space-x-2">
            <Skeleton height={20} width={50} className="rounded-md" />
            <Skeleton height={20} width={60} className="rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonNavigation = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-between p-4', className)}>
    <Skeleton height={32} width={120} />
    <div className="flex space-x-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} height={16} width={60} />
      ))}
    </div>
    <Skeleton height={36} width={36} rounded />
  </div>
);

export default Skeleton;