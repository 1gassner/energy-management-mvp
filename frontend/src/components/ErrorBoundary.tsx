import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { 
      error, 
      componentStack: errorInfo.componentStack 
    });
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to your error reporting service
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Sentry.captureException(error, { contexts: { react: { errorInfo } } });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Ups, etwas ist schiefgelaufen!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
            </p>

            {import.meta.env.VITE_APP_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Technische Details (nur in Entwicklung)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  <div className="font-semibold mb-1">Stack:</div>
                  <div>{this.state.error.stack}</div>
                </div>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Erneut versuchen</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 btn-primary"
              >
                Seite neu laden
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Falls das Problem weiterhin besteht, kontaktieren Sie bitte den Support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;