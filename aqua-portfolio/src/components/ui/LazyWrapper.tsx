'use client';

import React, { Suspense, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <motion.div
    className="flex items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-600">Loading component...</span>
    </div>
  </motion.div>
);

export const LazyWrapper = ({ children, fallback, className }: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
};

LazyWrapper.displayName = 'LazyWrapper';