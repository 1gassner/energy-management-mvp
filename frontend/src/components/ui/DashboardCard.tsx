import React, { memo, useMemo } from 'react';
import { DashboardCardProps } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard: React.FC<DashboardCardProps> = memo(({
  title,
  value,
  unit,
  icon,
  trend
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

  return (
    <div className="kpi-glass-card p-6 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-200/80 mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-2xl font-bold text-white">
              {formattedValue}
            </p>
            {unit && (
              <p className="text-sm font-medium text-blue-300/60">{unit}</p>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-blue-200/60 ml-1">
                vs. vorherige Periode
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
});

DashboardCard.displayName = 'DashboardCard';

export default DashboardCard;