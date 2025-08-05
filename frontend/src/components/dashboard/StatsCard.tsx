'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  className?: string
  unit?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'emerald'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  unit,
  color = 'blue'
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('de-DE');
    }
    return val;
  };

  const getIconColorClass = () => {
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

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('h-6 w-6 flex-shrink-0', getIconColorClass())}>
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
  )
}

export default StatsCard