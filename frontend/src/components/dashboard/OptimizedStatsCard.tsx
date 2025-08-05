import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUpIcon, TrendingDownIcon } from '../ui/DynamicIcon';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  unit?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'emerald';
}

// Memoized value formatter
const formatValue = memo((val: string | number): string => {
  if (typeof val === 'number') {
    return val.toLocaleString('de-DE');
  }
  return val;
});

// Memoized color mapping
const useIconColorClass = (color: StatsCardProps['color']) => {
  return useMemo(() => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      cyan: 'text-cyan-600',
      emerald: 'text-emerald-600'
    };
    return colorMap[color || 'blue'];
  }, [color]);
};

// Memoized trend component
const TrendIndicator = memo(({ trend }: { trend: NonNullable<StatsCardProps['trend']> }) => (
  <div className="flex items-center mt-2">
    {trend.isPositive ? (
      <TrendingUpIcon size={16} className="text-green-500 mr-1" />
    ) : (
      <TrendingDownIcon size={16} className="text-red-500 mr-1" />
    )}
    <span className={cn(
      'text-xs font-medium',
      trend.isPositive ? 'text-green-600' : 'text-red-600'
    )}>
      {trend.isPositive ? '+' : ''}{Math.abs(trend.value)}%
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
      {trend.label || 'gegenüber letztem Monat'}
    </span>
  </div>
));

// Main optimized stats card component
const OptimizedStatsCard = memo<StatsCardProps>(({
  title,
  value,
  icon,
  trend,
  className,
  unit,
  color = 'blue'
}) => {
  const iconColorClass = useIconColorClass(color);
  const formattedValue = useMemo(() => formatValue(value), [value]);

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('h-6 w-6 flex-shrink-0', iconColorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 mb-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formattedValue}
          </div>
          {unit && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </div>
          )}
        </div>
        {trend && <TrendIndicator trend={trend} />}
      </CardContent>
    </Card>
  );
});

// Display names for debugging
OptimizedStatsCard.displayName = 'OptimizedStatsCard';
TrendIndicator.displayName = 'TrendIndicator';
formatValue.displayName = 'formatValue';

export default OptimizedStatsCard;