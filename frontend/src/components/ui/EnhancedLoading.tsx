import React from 'react';
import { Loader2, AlertCircle, Wifi, WifiOff, Clock, TrendingUp } from 'lucide-react';
import { useApiLoadingState } from '@/hooks/useApi';

// Loading Spinner with different states
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  showProgress?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'text-blue-500', 
  text,
  showProgress = false,
  className = ''
}: LoadingSpinnerProps) {
  const loadingState = useApiLoadingState();
  
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} ${color} animate-spin`} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
        {showProgress && loadingState.progress !== undefined && (
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingState.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton Components
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = false,
  animate = true
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded-full' : 'rounded'} ${
        animate ? 'animate-pulse' : ''
      } ${className}`}
      style={{ width: widthStyle, height: heightStyle }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="60%" />
        <div className="space-y-2">
          <Skeleton height="1rem" width="100%" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="90%" />
        </div>
        <div className="flex space-x-2">
          <Skeleton height="2rem" width="4rem" rounded />
          <Skeleton height="2rem" width="5rem" rounded />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4, className = '' }: { 
  rows?: number; 
  columns?: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="2rem" width={colIndex === 0 ? '25%' : '15%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="40%" />
        <div className="h-64 relative">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton 
                key={index} 
                height={`${Math.random() * 150 + 50}px`} 
                width="6%" 
                animate
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Skeleton height="1rem" width="15%" />
          <Skeleton height="1rem" width="15%" />
        </div>
      </div>
    </div>
  );
}

// Loading States with Context
interface LoadingStateProps {
  loading: boolean;
  error?: Error | null;
  empty?: boolean;
  retry?: () => void;
  className?: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function LoadingState({
  loading,
  error,
  empty,
  retry,
  className = '',
  children,
  loadingComponent,
  errorComponent,
  emptyComponent
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Daten werden geladen..." showProgress />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <ErrorDisplay error={error} onRetry={retry} />
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className={className}>
        {emptyComponent || (
          <EmptyState />
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

// Error Display Component
interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const getErrorIcon = () => {
    if (error.name === 'NetworkError') {
      return <WifiOff className="h-12 w-12 text-red-500" />;
    }
    if (error.name === 'TimeoutError') {
      return <Clock className="h-12 w-12 text-orange-500" />;
    }
    return <AlertCircle className="h-12 w-12 text-red-500" />;
  };

  const getErrorColor = () => {
    if (error.name === 'TimeoutError') return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
    return 'border-red-200 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className={`p-6 rounded-lg border ${getErrorColor()} max-w-md w-full text-center`}>
        <div className="flex justify-center mb-4">
          {getErrorIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {error.name === 'NetworkError' ? 'Verbindungsfehler' : 
           error.name === 'TimeoutError' ? 'Timeout' : 'Fehler'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = 'Keine Daten verfügbar',
  description = 'Es sind derzeit keine Daten vorhanden.',
  action,
  icon,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          {icon || <TrendingUp className="h-12 w-12 text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Global Loading Indicator
export function GlobalLoadingIndicator() {
  const loadingState = useApiLoadingState();
  
  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ 
            width: `${loadingState.progress || 0}%`,
            transition: 'width 0.3s ease-out'
          }}
        />
      </div>
    </div>
  );
}

// Connection Status Indicator
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;