import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Activity, Zap, BarChart3 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'default' | 'chart' | 'kpi' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'default',
  size = 'md',
  message,
  className
}) => {
  const sizeClasses = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const renderContent = () => {
    switch (variant) {
      case 'chart':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <BarChart3 className={cn(iconSizes[size], 'text-blue-400 animate-pulse')} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
            </div>
            <div className="text-blue-200/80 text-sm font-medium">
              {message || 'Lade Chart-Daten...'}
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        );
      
      case 'kpi':
        return (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Activity className={cn(iconSizes[size], 'text-green-400 animate-spin')} />
              <div className="absolute inset-0 border-2 border-green-400/30 rounded-full animate-pulse" />
            </div>
            <div className="text-green-200/80 text-sm font-medium">
              {message || 'Berechne KPIs...'}
            </div>
          </div>
        );
      
      case 'minimal':
        return (
          <div className="flex items-center justify-center">
            <Loader2 className={cn(iconSizes[size], 'text-blue-400 animate-spin')} />
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center animate-pulse">
                <Zap className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium mb-1">
                {message || 'Lade Daten...'}
              </div>
              <div className="text-blue-200/60 text-sm">
                Bitte warten Sie einen Moment
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      'glass-card-light rounded-2xl backdrop-blur-xl border border-white/10',
      className
    )}>
      {renderContent()}
    </div>
  );
};

interface SkeletonProps {
  variant?: 'card' | 'chart' | 'list' | 'text';
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'card',
  count = 1,
  className
}) => {
  const renderSkeleton = (index: number) => {
    switch (variant) {
      case 'chart':
        return (
          <div key={index} className="glass-card-light rounded-2xl p-6 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                <div className="h-6 bg-white/20 rounded animate-pulse w-32" />
              </div>
              <div className="h-4 bg-white/20 rounded animate-pulse w-24" />
            </div>
            <div className="h-64 bg-white/10 rounded-xl animate-pulse" />
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className="flex items-center space-x-4 p-4 glass-card-light rounded-xl backdrop-blur-xl border border-white/10">
            <div className="w-10 h-10 bg-white/20 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-white/20 rounded animate-pulse w-1/2" />
            </div>
            <div className="h-8 bg-white/20 rounded animate-pulse w-16" />
          </div>
        );
      
      case 'text':
        return (
          <div key={index} className="space-y-3">
            <div className="h-4 bg-white/20 rounded animate-pulse w-full" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-4/6" />
          </div>
        );
      
      default: // card
        return (
          <div key={index} className="glass-card-light rounded-2xl p-6 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/20 rounded animate-pulse w-24" />
                  <div className="h-3 bg-white/20 rounded animate-pulse w-16" />
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-white/20 rounded animate-pulse w-20" />
              <div className="h-4 bg-white/20 rounded animate-pulse w-16" />
              <div className="h-4 bg-white/20 rounded animate-pulse w-32" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  variant?: 'default' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  label,
  className
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500';
      case 'minimal':
        return 'bg-blue-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-blue-200/80 font-medium">{label}</span>
          <span className="text-sm text-white font-bold">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-700 ease-out rounded-full',
            getVariantClasses()
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface PulseAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  delay = 0,
  className
}) => {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className }) => {
  return (
    <div className={cn(
      'relative overflow-hidden bg-white/10 rounded-lg',
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

// Add shimmer animation to global CSS
const shimmerStyle = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}