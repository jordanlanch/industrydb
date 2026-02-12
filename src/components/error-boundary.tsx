'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureError } from '@/lib/sentry';
import { useTranslations } from 'next-intl';

interface ErrorBoundaryTranslations {
  title?: string;
  description?: string;
  componentStack?: string;
  reloadPage?: string;
  goHome?: string;
  tryAgain?: string;
  dashboardError?: string;
  dashboardErrorDescription?: string;
  reload?: string;
  dashboard?: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  translations?: ErrorBoundaryTranslations;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component to catch React errors and display fallback UI
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    captureError(error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {this.props.translations?.title || 'Something went wrong'}
            </h1>

            <p className="text-gray-600 mb-6">
              {this.props.translations?.description || 'We encountered an unexpected error. Our team has been notified and we\'re working to fix it.'}
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-left">
                <p className="text-sm font-mono text-red-800 mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-red-700">
                    <summary className="cursor-pointer hover:text-red-900">
                      {this.props.translations?.componentStack || 'Component Stack'}
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.props.translations?.reloadPage || 'Reload Page'}
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                className="flex-1"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                {this.props.translations?.goHome || 'Go Home'}
              </Button>
            </div>

            {this.props.onReset && (
              <Button
                onClick={this.handleReset}
                variant="ghost"
                className="mt-3 w-full"
              >
                {this.props.translations?.tryAgain || 'Try Again'}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized ErrorBoundary for Dashboard with custom styling
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);

    captureError(error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {this.props.translations?.dashboardError || 'Unable to load this section'}
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              {this.props.translations?.dashboardErrorDescription || 'An error occurred while loading this part of the dashboard.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 rounded text-left">
                <p className="text-xs font-mono text-red-800">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.props.translations?.reload || 'Reload'}
              </Button>

              <Button
                onClick={() => (window.location.href = '/dashboard')}
                size="sm"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                {this.props.translations?.dashboard || 'Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Localized ErrorBoundary using useTranslations hook
 */
export function LocalizedErrorBoundary(props: Omit<Props, 'translations'>) {
  const t = useTranslations('components.errorBoundary');
  return (
    <ErrorBoundary
      {...props}
      translations={{
        title: t('title'),
        description: t('description'),
        componentStack: t('componentStack'),
        reloadPage: t('reloadPage'),
        goHome: t('goHome'),
        tryAgain: t('tryAgain'),
      }}
    />
  );
}

/**
 * Localized DashboardErrorBoundary using useTranslations hook
 */
export function LocalizedDashboardErrorBoundary(props: Omit<Props, 'translations'>) {
  const t = useTranslations('components.errorBoundary');
  return (
    <DashboardErrorBoundary
      {...props}
      translations={{
        dashboardError: t('dashboardError'),
        dashboardErrorDescription: t('dashboardErrorDescription'),
        reload: t('reload'),
        dashboard: t('dashboard'),
      }}
    />
  );
}

export default ErrorBoundary;
