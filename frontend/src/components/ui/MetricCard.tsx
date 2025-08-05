import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ModernCard } from './ModernCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'emerald';
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaLabel?: string;
  interactive?: boolean;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'blue',
  variant = 'default',
  className = '',
  animate = true,
  onClick,
  onKeyDown,
  ariaLabel,
  interactive = false,
  loading = false
}) => {
  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-600 text-white',
      green: 'bg-green-600 text-white',
      orange: 'bg-orange-600 text-white', 
      red: 'bg-red-600 text-white',
      purple: 'bg-purple-600 text-white',
      cyan: 'bg-cyan-600 text-white',
      emerald: 'bg-emerald-600 text-white'
    };
    return colorMap[color];
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('de-DE');
    }
    return val;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && (onClick || interactive)) {
      e.preventDefault();
      onClick?.();
    }
    onKeyDown?.(e);
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    let label = `${title}: ${formatValue(value)}`;
    if (unit) label += ` ${unit}`;
    if (trend) {
      label += `. Trend: ${trend.isPositive ? 'steigend' : 'fallend'} um ${Math.abs(trend.value)}%`;
    }
    return label;
  };

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {title}
        </p>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <p className="metric-card-value" aria-hidden="true">
                {formatValue(value)}
              </p>
              {unit && (
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400" aria-hidden="true">
                  {unit}
                </p>
              )}
            </div>
            
            {trend && (
              <div className="flex items-center mt-3" aria-hidden="true">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend.isPositive 
                    ? 'metric-card-trend-positive' 
                    : 'metric-card-trend-negative'
                )}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {trend.label || 'vs. vorherige Periode'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className={cn(
        'p-4 rounded-xl flex-shrink-0 ml-4',
        getColorClasses(),
        'shadow-lg transform hover:scale-110 transition-transform duration-200'
      )}>
        {icon}
      </div>
    </div>
  );

  if (onClick || interactive) {
    return (
      <ModernCard 
        variant={variant} 
        className={cn(
          'metric-card cursor-pointer hover:shadow-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          className
        )}
        animate={animate}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={getAriaLabel()}
        aria-pressed={false}
      >
        {cardContent}
      </ModernCard>
    );
  }

  return (
    <ModernCard 
      variant={variant} 
      className={cn('metric-card', className)}
      animate={animate}
      role="img"
      aria-label={getAriaLabel()}
    >
      {cardContent}
    </ModernCard>
  );
};

export default MetricCard;