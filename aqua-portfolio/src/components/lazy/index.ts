import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const LazyProblemSolutionFlow = lazy(() => import('../ui/ProblemSolutionFlow'));
export const LazyTimelineJourney = lazy(() => import('../ui/TimelineJourney'));
export const LazyParticleSystemBackground = lazy(() => import('../ui/ParticleSystemBackground'));
export const LazyLoadingStateTheater = lazy(() => import('../ui/LoadingStateTheater'));
export const LazyVirtualizedList = lazy(() => import('../ui/VirtualizedList').then(module => ({ default: module.VirtualizedList })));
export const LazyDragDropTestBuilder = lazy(() => import('../ui/DragDropTestBuilder'));

// Analytics and non-critical components
// Note: Analytics, EmailCapture, and ContactForm components not yet implemented