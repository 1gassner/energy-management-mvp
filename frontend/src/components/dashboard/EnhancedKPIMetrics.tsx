import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassHeading, GlassText } from '@/components/ui/GlassTypography';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Leaf, 
  Euro, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';

export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  previousValue?: number;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  icon?: React.ReactNode;
  description?: string;
  category?: 'energy' | 'cost' | 'efficiency' | 'environment' | 'performance';
  lastUpdated?: Date;
  forecast?: {
    value: number;
    confidence: number;
    period: string;
  };
}

export interface EnhancedKPIMetricsProps {
  metrics: KPIMetric[];
  layout?: 'grid' | 'list' | 'compact';
  columns?: 2 | 3 | 4 | 6;
  showTrends?: boolean;
  showTargets?: boolean;
  showForecasts?: boolean;
  showLastUpdated?: boolean;
  animated?: boolean;
  className?: string;
  onMetricClick?: (metric: KPIMetric) => void;
}

export const EnhancedKPIMetrics: React.FC<EnhancedKPIMetricsProps> = ({
  metrics,
  layout = 'grid',
  columns = 3,
  showTrends = true,
  showTargets = true,
  showForecasts = false,
  showLastUpdated = false,
  animated = true,
  className,
  onMetricClick
}) => {
  // Group metrics by category
  const groupedMetrics = useMemo(() => {
    const groups: Record<string, KPIMetric[]> = {};
    metrics.forEach(metric => {
      const category = metric.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(metric);
    });
    return groups;
  }, [metrics]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'cost': return <Euro className="w-5 h-5" />;
      case 'efficiency': return <Target className="w-5 h-5" />;
      case 'environment': return <Leaf className="w-5 h-5" />;
      case 'performance': return <BarChart3 className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'energy': return 'hechingen-primary';
      case 'cost': return 'hechingen-heritage';
      case 'efficiency': return 'hechingen-success';
      case 'environment': return 'hechingen-success';
      case 'performance': return 'hechingen-primary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'glass-text-muted bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string, trendPercent?: number) => {
    if (!trendPercent) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className={clsx(
          'w-4 h-4',
          trendPercent > 10 ? 'text-red-400' : 'text-green-400'
        )} />;
      case 'down':
        return <TrendingDown className={clsx(
          'w-4 h-4',
          trendPercent > 10 ? 'text-green-400' : 'text-red-400'
        )} />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toLocaleString('de-DE')}${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const renderMetricCard = (metric: KPIMetric, compact = false) => {
    const cardVariant = getCategoryColor(metric.category || 'default');
    
    return (
      <GlassCard
        key={metric.id}
        theme={cardVariant}
        className={clsx(
          'relative overflow-hidden group transition-all duration-300',
          animated && 'hover:scale-105 hover:-translate-y-1',
          onMetricClick && 'cursor-pointer',
          compact ? 'p-4' : 'p-6'
        )}
        onClick={() => onMetricClick?.(metric)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {metric.icon && (
              <div className="glass-card-light p-2 rounded-lg">
                {metric.icon}
              </div>
            )}
            <div>
              <GlassHeading 
                level={compact ? 4 : 3} 
                size={compact ? 'sm' : 'md'} 
                className="mb-1"
              >
                {metric.title}
              </GlassHeading>
              {metric.description && !compact && (
                <GlassText variant="muted" size="xs">
                  {metric.description}
                </GlassText>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {metric.status && (
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              getStatusColor(metric.status)
            )}>
              {getStatusIcon(metric.status)}
              <span className="capitalize">{metric.status}</span>
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="glass-text-primary font-bold text-2xl lg:text-3xl">
            {formatValue(metric.value, metric.unit)}
          </div>
          
          {/* Trend */}
          {showTrends && metric.trend && metric.trendPercent && (
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metric.trend, metric.trendPercent)}
              <span className={clsx(
                'text-sm font-medium',
                metric.trend === 'up' 
                  ? (metric.trendPercent > 10 ? 'text-red-400' : 'text-green-400')
                  : metric.trend === 'down'
                  ? (metric.trendPercent > 10 ? 'text-green-400' : 'text-red-400')
                  : 'glass-text-muted'
              )}>
                {metric.trendPercent}% 
                {metric.trend === 'up' ? ' mehr' : metric.trend === 'down' ? ' weniger' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Target Progress */}
        {showTargets && metric.target && typeof metric.value === 'number' && !compact && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="glass-text-secondary">Ziel-Fortschritt</span>
              <span className="glass-text-primary font-medium">
                {((metric.value / metric.target) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-glass-bg-light rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-hechingen-blue-500 to-hechingen-green-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Forecast */}
        {showForecasts && metric.forecast && !compact && (
          <div className="mb-4 p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="glass-text-secondary text-xs">Prognose {metric.forecast.period}</div>
                <div className="glass-text-primary font-medium">
                  {formatValue(metric.forecast.value, metric.unit)}
                </div>
              </div>
              <div className="text-right">
                <div className="glass-text-muted text-xs">Vertrauen</div>
                <div className="glass-text-primary font-medium">
                  {metric.forecast.confidence}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {showLastUpdated && metric.lastUpdated && !compact && (
          <div className="flex items-center gap-2 glass-text-muted text-xs">
            <Clock className="w-3 h-3" />
            <span>
              Aktualisiert: {metric.lastUpdated.toLocaleString('de-DE')}
            </span>
          </div>
        )}

        {/* Hover Effect */}
        {onMetricClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-hechingen-blue-500/10 to-hechingen-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </GlassCard>
    );
  };

  const containerClasses = clsx(
    layout === 'grid' && `grid gap-6`,
    layout === 'grid' && columns === 2 && 'grid-cols-1 md:grid-cols-2',
    layout === 'grid' && columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    layout === 'grid' && columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    layout === 'grid' && columns === 6 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    layout === 'list' && 'space-y-4',
    layout === 'compact' && 'grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
    className
  );

  if (layout === 'grid' || layout === 'compact') {
    return (
      <div className={containerClasses}>
        {metrics.map(metric => renderMetricCard(metric, layout === 'compact'))}
      </div>
    );
  }

  // Grouped layout
  return (
    <div className={clsx('space-y-8', className)}>
      {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
        <div key={category}>
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="glass-card-hechingen-primary p-2 rounded-lg">
              {getCategoryIcon(category)}
            </div>
            <GlassHeading level={2} size="xl" className="capitalize">
              {category === 'energy' && 'Energie'}
              {category === 'cost' && 'Kosten'}
              {category === 'efficiency' && 'Effizienz'}
              {category === 'environment' && 'Umwelt'}
              {category === 'performance' && 'Leistung'}
              {!['energy', 'cost', 'efficiency', 'environment', 'performance'].includes(category) && category}
            </GlassHeading>
          </div>

          {/* Category Metrics */}
          <div className={clsx(
            'grid gap-6',
            categoryMetrics.length === 1 && 'grid-cols-1',
            categoryMetrics.length === 2 && 'grid-cols-1 md:grid-cols-2',
            categoryMetrics.length >= 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}>
            {categoryMetrics.map(metric => renderMetricCard(metric))}
          </div>
        </div>
      ))}
    </div>
  );
};