'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  loadingState?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  isRetrying: boolean;
}

export class DataErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isRetrying: false 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DataErrorBoundary caught an error:', error, errorInfo);
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with services like Sentry, LogRocket, etc.
      console.error('Production error logged:', { error, errorInfo });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // If custom retry function is provided, use it
      if (this.props.onRetry) {
        await this.props.onRetry();
      }
      
      // Reset error state after successful retry
      this.retryTimeoutId = setTimeout(() => {
        this.setState({ 
          hasError: false, 
          error: undefined, 
          isRetrying: false 
        });
      }, 1000);
      
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({ isRetrying: false });
    }
  };

  render() {
    // Show loading state if provided
    if (this.props.loadingState) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load data
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              {this.state.error?.message || 'An unexpected error occurred while loading the content.'}
            </p>
            
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {this.state.isRetrying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {this.props.retryLabel || 'Try Again'}
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataErrorBoundary;