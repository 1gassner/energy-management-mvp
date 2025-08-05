import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Leaf, 
  Building, 
  AlertTriangle,
  Activity,
  DollarSign,
  Target,
  CheckCircle
} from 'lucide-react';

interface EnergyStatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  type: 'energy' | 'co2' | 'building' | 'alert' | 'efficiency' | 'cost' | 'target' | 'status';
  className?: string;
  status?: 'online' | 'offline' | 'maintenance' | 'warning';
  target?: {
    value: number;
    achieved: boolean;
  };
}

const EnergyStatsCard: React.FC<EnergyStatsCardProps> = memo(({
  title,
  value,
  unit,
  trend,
  type,
  className,
  status,
  target
}) => {
  const formatValue = useMemo(() => {
    return (val: string | number): string => {
      if (typeof val === 'number') {
        return val.toLocaleString('de-DE');
      }
      return val;
    };
  }, []);

  const formattedValue = useMemo(() => formatValue(value), [value, formatValue]);

  const getIconAndColor = () => {
    switch (type) {
      case 'energy':
        return {
          icon: <Zap className="h-6 w-6" />,
          color: 'text-blue-600 bg-blue-100',
          bgColor: 'bg-blue-600'
        };
      case 'co2':
        return {
          icon: <Leaf className="h-6 w-6" />,
          color: 'text-green-600 bg-green-100', 
          bgColor: 'bg-green-600'
        };
      case 'building':
        return {
          icon: <Building className="h-6 w-6" />,
          color: 'text-purple-600 bg-purple-100',
          bgColor: 'bg-purple-600'
        };
      case 'alert':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          color: 'text-red-600 bg-red-100',
          bgColor: 'bg-red-600'
        };
      case 'efficiency':
        return {
          icon: <Activity className="h-6 w-6" />,
          color: 'text-orange-600 bg-orange-100',
          bgColor: 'bg-orange-600'
        };
      case 'cost':
        return {
          icon: <DollarSign className="h-6 w-6" />,
          color: 'text-emerald-600 bg-emerald-100',
          bgColor: 'bg-emerald-600'
        };
      case 'target':
        return {
          icon: <Target className="h-6 w-6" />,
          color: 'text-cyan-600 bg-cyan-100',
          bgColor: 'bg-cyan-600'
        };
      case 'status':
        return {
          icon: <CheckCircle className="h-6 w-6" />,
          color: status === 'online' 
            ? 'text-green-600 bg-green-100'
            : status === 'offline'
            ? 'text-red-600 bg-red-100'
            : status === 'maintenance'
            ? 'text-yellow-600 bg-yellow-100'
            : 'text-orange-600 bg-orange-100',
          bgColor: status === 'online' 
            ? 'bg-green-600'
            : status === 'offline'
            ? 'bg-red-600'
            : status === 'maintenance'
            ? 'bg-yellow-600'
            : 'bg-orange-600'
        };
      default:
        return {
          icon: <Activity className="h-6 w-6" />,
          color: 'text-gray-600 bg-gray-100',
          bgColor: 'bg-gray-600'
        };
    }
  };

  const { icon, color } = getIconAndColor();

  const getStatusText = () => {
    if (type === 'status' && status) {
      const statusMap = {
        online: 'Online',
        offline: 'Offline',
        maintenance: 'Wartung',
        warning: 'Warnung'
      };
      return statusMap[status];
    }
    return null;
  };

  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', color)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 mb-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {getStatusText() || formattedValue}
          </div>
          {unit && !getStatusText() && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </div>
          )}
        </div>

        {/* Target Progress */}
        {target && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Ziel: {target.value.toLocaleString('de-DE')}</span>
              <span className={target.achieved ? 'text-green-600' : 'text-orange-600'}>
                {target.achieved ? 'Erreicht ✓' : 'In Arbeit'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  target.achieved ? 'bg-green-500' : 'bg-orange-500'
                )}
                style={{ 
                  width: `${Math.min(100, (Number(value) / target.value) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? '+' : ''}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {trend.label || 'vs. vorherige Periode'}
            </span>
          </div>
        )}

        {/* Status Badge */}
        {type === 'status' && (
          <div className="mt-2">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              status === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : status === 'offline'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : status === 'maintenance'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full mr-1',
                status === 'online' ? 'bg-green-500' :
                status === 'offline' ? 'bg-red-500' :
                status === 'maintenance' ? 'bg-yellow-500' : 'bg-orange-500'
              )} />
              {getStatusText()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EnergyStatsCard.displayName = 'EnergyStatsCard';

export default EnergyStatsCard;