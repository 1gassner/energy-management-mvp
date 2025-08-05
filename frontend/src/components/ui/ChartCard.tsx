import React from 'react';
import { cn } from '@/lib/utils';
import { ModernCard } from './ModernCard';
import { Activity } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  headerAction?: React.ReactNode;
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  icon,
  variant = 'default',
  className = '',
  headerAction,
  loading = false
}) => {
  return (
    <ModernCard variant={variant} className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="modern-card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="modern-card-content relative">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-gray-600 dark:text-gray-400">Lade Daten...</span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </ModernCard>
  );
};

export default ChartCard;