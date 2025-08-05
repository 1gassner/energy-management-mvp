import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface CityPulseMetricCardProps {
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
  className?: string;
  compact?: boolean;
  status?: 'normal' | 'warning' | 'critical' | 'success';
}

export const CityPulseMetricCard: React.FC<CityPulseMetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'blue',
  className = '',
  compact = false,
  status = 'normal'
}) => {
  const getColorClasses = () => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600', 
      red: 'text-red-600',
      purple: 'text-purple-600',
      cyan: 'text-cyan-600',
      emerald: 'text-emerald-600'
    };
    return colorMap[color];
  };

  const getStatusBorderClass = () => {
    switch (status) {
      case 'warning':
        return 'border-l-4 border-l-orange-500';
      case 'critical':
        return 'border-l-4 border-l-red-500';
      case 'success':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('de-DE');
    }
    return val;
  };

  if (compact) {
    return (
      <Card className={cn(
        'hover:shadow-md transition-shadow duration-200',
        getStatusBorderClass(),
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              <div className="flex items-baseline space-x-1">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatValue(value)}
                </p>
                {unit && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {unit}
                  </p>
                )}
              </div>
            </div>
            <div className={cn('h-4 w-4', getColorClasses())}>
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'hover:shadow-md transition-shadow duration-200',
      getStatusBorderClass(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('h-6 w-6', getColorClasses())}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 mb-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(value)}
          </div>
          {unit && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
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
        )}
      </CardContent>
    </Card>
  );
};

export default CityPulseMetricCard;