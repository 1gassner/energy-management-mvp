import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EcoKPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: 'green' | 'blue' | 'purple' | 'orange';
  progress?: number;
  className?: string;
  onClick?: () => void;
}

const EcoKPICard: React.FC<EcoKPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  color = 'green',
  progress,
  className,
  onClick
}) => {
  const colorClasses = {
    green: {
      gradient: 'from-emerald-500 to-green-500',
      bg: 'from-emerald-500/20 to-green-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-400/30',
      shadow: 'shadow-emerald-500/20',
      progress: 'bg-emerald-500'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-500/20 to-cyan-500/20',
      text: 'text-blue-400',
      border: 'border-blue-400/30',
      shadow: 'shadow-blue-500/20',
      progress: 'bg-blue-500'
    },
    purple: {
      gradient: 'from-purple-500 to-violet-500',
      bg: 'from-purple-500/20 to-violet-500/20',
      text: 'text-purple-400',
      border: 'border-purple-400/30',
      shadow: 'shadow-purple-500/20',
      progress: 'bg-purple-500'
    },
    orange: {
      gradient: 'from-orange-500 to-yellow-500',
      bg: 'from-orange-500/20 to-yellow-500/20',
      text: 'text-orange-400',
      border: 'border-orange-400/30',
      shadow: 'shadow-orange-500/20',
      progress: 'bg-orange-500'
    }
  };

  const colorConfig = colorClasses[color];

  return (
    <div
      className={cn(
        "eco-kpi-card relative group",
        `hover:${colorConfig.shadow} hover:shadow-2xl`,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Gradient top border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-70",
        colorConfig.gradient
      )} />
      
      {/* Background gradient on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl",
        colorConfig.bg
      )} />
      
      <div className="relative z-10">
        {/* Header mit Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110",
            colorConfig.gradient
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300",
              trend.isPositive 
                ? "bg-emerald-500/20 text-emerald-300" 
                : "bg-red-500/20 text-red-300"
            )}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Titel */}
        <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>

        {/* Wert */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={cn(
            "text-3xl font-bold transition-all duration-300 group-hover:scale-105",
            colorConfig.text
          )}>
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
              {unit}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-3">
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r",
                  colorConfig.gradient
                )}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            {subtitle}
          </p>
        )}

        {/* Trend Label */}
        {trend && (
          <div className="mt-2 flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              trend.isPositive ? "bg-emerald-400" : "bg-red-400"
            )} />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
              {trend.label}
            </span>
          </div>
        )}
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

EcoKPICard.displayName = 'EcoKPICard';

export default EcoKPICard;