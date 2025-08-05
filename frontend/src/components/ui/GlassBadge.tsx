import React from 'react';
import { clsx } from 'clsx';

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'hechingen';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  icon,
  pulse = false,
  removable = false,
  onRemove
}) => {
  const badgeClasses = clsx(
    // Base glass badge styles
    'inline-flex items-center gap-1 font-semibold',
    'backdrop-blur-sm -webkit-backdrop-filter',
    'border rounded-full transition-all duration-200',
    
    // Variants
    variant === 'success' && 'glass-badge-success',
    variant === 'warning' && 'glass-badge-warning', 
    variant === 'error' && 'glass-badge-error',
    variant === 'info' && [
      'bg-gradient-to-r from-blue-500/30 to-blue-600/10',
      'border-blue-400/30 text-blue-300'
    ],
    variant === 'neutral' && [
      'bg-gradient-to-r from-gray-500/30 to-gray-600/10',
      'border-gray-400/30 text-gray-300'
    ],
    variant === 'hechingen' && [
      'bg-gradient-to-r from-hechingen-blue-500/30 to-hechingen-blue-600/10',
      'border-hechingen-blue-400/30 text-hechingen-blue-300'
    ],
    
    // Sizes
    size === 'sm' && 'px-2 py-0.5 text-xs',
    size === 'md' && 'px-3 py-1 text-sm',
    size === 'lg' && 'px-4 py-1.5 text-base',
    
    // Effects
    pulse && 'glass-animate-pulse',
    
    className
  );

  return (
    <span className={badgeClasses}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );  
};

export interface GlassStatusIndicatorProps {
  status: 'online' | 'offline' | 'maintenance' | 'warning' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const GlassStatusIndicator: React.FC<GlassStatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  showLabel = true,
  animated = true,
  className
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      glowColor: 'shadow-green-500/50',
      text: 'Online',
      borderColor: 'border-green-400/30'
    },
    offline: {
      color: 'bg-gray-500', 
      glowColor: 'shadow-gray-500/50',
      text: 'Offline',
      borderColor: 'border-gray-400/30'
    },
    maintenance: {
      color: 'bg-yellow-500',
      glowColor: 'shadow-yellow-500/50', 
      text: 'Wartung',
      borderColor: 'border-yellow-400/30'
    },
    warning: {
      color: 'bg-orange-500',
      glowColor: 'shadow-orange-500/50',
      text: 'Warnung', 
      borderColor: 'border-orange-400/30'
    },
    error: {
      color: 'bg-red-500',
      glowColor: 'shadow-red-500/50',
      text: 'Fehler',
      borderColor: 'border-red-400/30'
    }
  };

  const config = statusConfig[status];
  
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const containerClasses = clsx(
    'inline-flex items-center gap-2',
    className
  );

  const dotClasses = clsx(
    dotSizes[size],
    'rounded-full border',
    config.color,
    config.borderColor,
    animated && 'animate-pulse',
    `shadow-md ${config.glowColor}`
  );

  return (
    <div className={containerClasses}>
      <div className={dotClasses} />
      {showLabel && (
        <span className="glass-text-primary text-sm font-medium">
          {label || config.text}
        </span>
      )}
    </div>
  );
};

export interface GlassMetricBadgeProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'hechingen';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassMetricBadge: React.FC<GlassMetricBadgeProps> = ({
  value,
  label,
  trend,
  trendValue,
  size = 'md',
  className
}) => {
  const containerClasses = clsx(
    'glass-card-light p-4 text-center min-w-[120px]',
    size === 'sm' && 'p-3 min-w-[100px]',
    size === 'lg' && 'p-6 min-w-[140px]',
    className
  );

  const valueClasses = clsx(
    'font-bold glass-heading-primary',
    size === 'sm' && 'text-lg',
    size === 'md' && 'text-2xl', 
    size === 'lg' && 'text-3xl'
  );

  const labelClasses = clsx(
    'glass-text-secondary font-medium mt-1',
    size === 'sm' && 'text-xs',
    size === 'md' && 'text-sm',
    size === 'lg' && 'text-base'
  );

  const trendClasses = clsx(
    'inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-1 rounded-full',
    trend === 'up' && 'bg-green-500/20 text-green-400 border border-green-500/30',
    trend === 'down' && 'bg-red-500/20 text-red-400 border border-red-500/30', 
    trend === 'neutral' && 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  );

  const TrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7h-10" />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className={containerClasses}>
      <div className={valueClasses}>{value}</div>
      <div className={labelClasses}>{label}</div>
      {trend && trendValue && (
        <div className={trendClasses}>
          <TrendIcon />
          {trendValue}
        </div>
      )}
    </div>
  );
};