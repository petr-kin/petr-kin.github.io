'use client';

import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

interface AnalyticsEvent {
  eventName: string;
  eventParameters: Record<string, unknown>;
  timestamp: number;
}

class Analytics {
  private enabled: boolean;
  private queue: AnalyticsEvent[] = [];
  private vitals: Record<string, WebVitalMetric> = {};

  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
    
    if (this.enabled && typeof window !== 'undefined') {
      this.initWebVitals();
    }
  }

  private initWebVitals() {
    // Measure all Web Vitals
    onCLS(this.handleVital.bind(this));
    onFCP(this.handleVital.bind(this));
    onFID(this.handleVital.bind(this));
    onLCP(this.handleVital.bind(this));
    onTTFB(this.handleVital.bind(this));
  }

  private handleVital(metric: WebVitalMetric) {
    this.vitals[metric.name] = metric;
    
    // Send to analytics service
    this.track('web_vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      metric_id: metric.id,
      navigation_type: metric.navigationType,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital [${metric.name}]:`, {
        value: metric.value,
        rating: metric.rating,
        threshold: this.getThreshold(metric.name),
      });
    }
  }

  private getThreshold(metric: string): { good: number; poor: number } {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };
    
    return thresholds[metric as keyof typeof thresholds] || { good: 0, poor: 0 };
  }

  // Track custom events
  track(eventName: string, eventParameters: Record<string, unknown> = {}) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      eventName,
      eventParameters: {
        ...eventParameters,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.queue.push(event);

    // Send to analytics service (Google Analytics, etc.)
    this.sendToAnalytics(event);
  }

  // Track page views
  pageView(url: string) {
    this.track('page_view', {
      page_url: url,
      page_title: document.title,
      page_referrer: document.referrer,
    });
  }

  // Track user interactions
  interaction(element: string, action: string, details?: Record<string, unknown>) {
    this.track('user_interaction', {
      element,
      action,
      ...details,
    });
  }

  // Track performance timing
  timing(name: string, duration: number, details?: Record<string, unknown>) {
    this.track('performance_timing', {
      timing_name: name,
      timing_duration: duration,
      ...details,
    });
  }

  // Track errors
  error(error: Error, context?: Record<string, unknown>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  // Get current Web Vitals scores
  getWebVitals(): Record<string, WebVitalMetric> {
    return { ...this.vitals };
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const vitals = Object.values(this.vitals);
    if (vitals.length === 0) return 0;

    const goodMetrics = vitals.filter(v => v.rating === 'good').length;
    return Math.round((goodMetrics / vitals.length) * 100);
  }

  // Get detailed performance report
  getPerformanceReport() {
    const vitals = this.getWebVitals();
    const score = this.getPerformanceScore();
    
    return {
      score,
      vitals,
      timestamp: Date.now(),
      recommendations: this.getRecommendations(vitals),
    };
  }

  private getRecommendations(vitals: Record<string, WebVitalMetric>): string[] {
    const recommendations: string[] = [];

    Object.entries(vitals).forEach(([name, metric]) => {
      if (metric.rating === 'poor') {
        switch (name) {
          case 'LCP':
            recommendations.push('Optimize images and lazy load content to improve Largest Contentful Paint');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time to improve First Input Delay');
            break;
          case 'CLS':
            recommendations.push('Set dimensions for images and ads to improve Cumulative Layout Shift');
            break;
          case 'FCP':
            recommendations.push('Optimize resource loading to improve First Contentful Paint');
            break;
          case 'TTFB':
            recommendations.push('Optimize server response time to improve Time to First Byte');
            break;
        }
      }
    });

    return recommendations;
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      const gtag = (window as unknown as Record<string, unknown>).gtag as (
        command: string, 
        eventName: string, 
        parameters: Record<string, unknown>
      ) => void;
      gtag('event', event.eventName, event.eventParameters);
    }

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(console.error);
    }
  }

  // Export data for external analysis
  exportData() {
    return {
      vitals: this.vitals,
      events: this.queue,
      report: this.getPerformanceReport(),
      exportedAt: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Hook for React components
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    interaction: analytics.interaction.bind(analytics),
    timing: analytics.timing.bind(analytics),
    error: analytics.error.bind(analytics),
    getWebVitals: analytics.getWebVitals.bind(analytics),
    getPerformanceScore: analytics.getPerformanceScore.bind(analytics),
    getPerformanceReport: analytics.getPerformanceReport.bind(analytics),
    exportData: analytics.exportData.bind(analytics),
  };
};

export default analytics;