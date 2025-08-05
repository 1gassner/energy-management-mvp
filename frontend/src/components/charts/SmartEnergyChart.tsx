import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassHeading, GlassText } from '@/components/ui/GlassTypography';
import { GlassButton } from '@/components/ui/GlassButton';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Calendar, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Download,
  Maximize2
} from 'lucide-react';

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  predicted?: number;
  target?: number;
  category?: string;
  building?: string;
  [key: string]: any;
}

export interface SmartEnergyChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'combo';
  
  // Chart configuration
  showPrediction?: boolean;
  showTarget?: boolean;
  showTrend?: boolean;
  showComparison?: boolean;
  
  // Data options
  valueKey?: string;
  timeRange?: '24h' | '7d' | '30d' | '1y';
  aggregation?: 'hour' | 'day' | 'week' | 'month';
  
  // Visual options
  height?: number;
  color?: string;
  gradient?: boolean;
  animated?: boolean;
  
  // Interactive features
  onTimeRangeChange?: (range: string) => void;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  onExport?: () => void;
  
  // Layout
  className?: string;
  compact?: boolean;
}

export const SmartEnergyChart: React.FC<SmartEnergyChartProps> = ({
  data,
  title,
  subtitle,
  type = 'line',
  showPrediction = false,
  showTarget = false,
  showTrend = true,
  showComparison = false,
  valueKey = 'value',
  timeRange = '24h',
  aggregation = 'hour',
  height = 300,
  color = '#2563eb',
  gradient = true,
  animated = true,
  onTimeRangeChange,
  onDataPointClick,
  onExport,
  className,
  compact = false
}) => {
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set(['value']));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate trend and statistics
  const chartStats = useMemo(() => {
    if (!data.length) return null;

    const values = data.map(d => d[valueKey]);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2] || latest;
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
    const trendPercent = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;

    return {
      latest,
      previous,
      average,
      max,
      min,
      trend,
      trendPercent: Math.abs(trendPercent),
      isPositiveTrend: trend === 'up'
    };
  }, [data, valueKey]);

  // Chart colors based on Hechingen theme
  const chartColors = {
    primary: '#2563eb',
    secondary: '#16a34a',
    accent: '#eab308',
    warning: '#f59e0b',
    error: '#ef4444',
    muted: '#64748b'
  };

  const timeRangeOptions = [
    { value: '24h', label: '24 Stunden' },
    { value: '7d', label: '7 Tage' },
    { value: '30d', label: '30 Tage' },
    { value: '1y', label: '1 Jahr' }
  ];

  const toggleLine = (lineKey: string) => {
    const newSelected = new Set(selectedLines);
    if (newSelected.has(lineKey)) {
      newSelected.delete(lineKey);
    } else {
      newSelected.add(lineKey);
    }
    setSelectedLines(newSelected);
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      name?: string;
    }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="glass-card-medium p-3 border border-glass-border-subtle rounded-lg shadow-xl">
        <p className="glass-text-primary font-medium mb-2">
          {label ? new Date(label).toLocaleString('de-DE') : 'Keine Zeit'}
        </p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="glass-text-secondary">{entry.name}:</span>
            <span className="glass-text-primary font-medium">
              {entry.value.toLocaleString()} kWh
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    const chartProps = {
      height,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              {gradient && (
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            />
            <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {selectedLines.has('value') && (
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke={color}
                fillOpacity={1}
                fill={gradient ? "url(#colorValue)" : color}
                name="Verbrauch"
                animationDuration={animated ? 1000 : 0}
              />
            )}
            
            {showPrediction && selectedLines.has('predicted') && (
              <Area
                type="monotone"
                dataKey="predicted"
                stroke={chartColors.accent}
                strokeDasharray="5 5"
                fillOpacity={0.1}
                fill={chartColors.accent}
                name="Prognose"
              />
            )}
            
            {showTarget && selectedLines.has('target') && (
              <Area
                type="monotone"
                dataKey="target"
                stroke={chartColors.secondary}
                strokeDasharray="2 2"
                fillOpacity={0.05}
                fill={chartColors.secondary}
                name="Zielwert"
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar 
              dataKey={valueKey} 
              fill={color}
              name="Verbrauch"
              radius={[2, 2, 0, 0]}
              animationDuration={animated ? 1000 : 0}
            />
          </BarChart>
        );

      case 'pie':
        interface PieDataItem {
          name: string;
          value: number;
        }
        const pieData = data.reduce((acc: PieDataItem[], item) => {
          const existing = acc.find(d => d.name === item.category);
          if (existing) {
            existing.value += item[valueKey];
          } else {
            acc.push({
              name: item.category || 'Unbekannt',
              value: item[valueKey]
            });
          }
          return acc;
        }, [] as PieDataItem[]);

        return (
          <PieChart height={height}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 100)}
              fill={color}
              dataKey="value"
              animationDuration={animated ? 1000 : 0}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={Object.values(chartColors)[index % Object.values(chartColors).length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      default: // line
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            />
            <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {selectedLines.has('value') && (
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                name="Verbrauch"
                animationDuration={animated ? 1000 : 0}
              />
            )}
            
            {showPrediction && selectedLines.has('predicted') && (
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={chartColors.accent}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Prognose"
              />
            )}
            
            {showTarget && selectedLines.has('target') && (
              <Line
                type="monotone"
                dataKey="target"
                stroke={chartColors.secondary}
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="Zielwert"
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <GlassCard 
      className={clsx(
        'relative',
        isFullscreen && 'fixed inset-4 z-50',
        className
      )}
      padding={compact ? 'md' : 'lg'}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <GlassHeading level={3} size="lg" className="mb-1">
            {title}
          </GlassHeading>
          {subtitle && (
            <GlassText variant="secondary" size="sm">
              {subtitle}
            </GlassText>
          )}
        </div>

        {/* Chart Stats */}
        {showTrend && chartStats && !compact && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="glass-text-primary font-bold text-lg">
                {chartStats.latest.toLocaleString()} kWh
              </div>
              <div className={clsx(
                'flex items-center gap-1 text-sm font-medium',
                chartStats.isPositiveTrend ? 'text-red-400' : 'text-green-400'
              )}>
                {chartStats.isPositiveTrend ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {chartStats.trendPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="glass-select text-sm"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Line Toggles */}
          {(showPrediction || showTarget) && !compact && (
            <div className="flex items-center gap-1">
              {showPrediction && (
                <button
                  onClick={() => toggleLine('predicted')}
                  className={clsx(
                    'p-1 rounded text-xs transition-colors',
                    selectedLines.has('predicted')
                      ? 'glass-button-secondary'
                      : 'glass-text-muted hover:glass-text-primary'
                  )}
                  title="Prognose anzeigen/ausblenden"
                >
                  {selectedLines.has('predicted') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              )}
              {showTarget && (
                <button
                  onClick={() => toggleLine('target')}
                  className={clsx(
                    'p-1 rounded text-xs transition-colors',
                    selectedLines.has('target')
                      ? 'glass-button-secondary'
                      : 'glass-text-muted hover:glass-text-primary'
                  )}
                  title="Zielwert anzeigen/ausblenden"
                >
                  <Target className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Export */}
          {onExport && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={onExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </GlassButton>
          )}

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="glass-button-secondary p-2"
            title={isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Stats */}
      {!compact && chartStats && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-glass-border-subtle">
          <div className="text-center">
            <div className="glass-text-muted text-xs">Durchschnitt</div>
            <div className="glass-text-primary font-medium">
              {chartStats.average.toFixed(0)} kWh
            </div>
          </div>
          <div className="text-center">
            <div className="glass-text-muted text-xs">Maximum</div>
            <div className="glass-text-primary font-medium">
              {chartStats.max.toLocaleString()} kWh
            </div>
          </div>
          <div className="text-center">
            <div className="glass-text-muted text-xs">Minimum</div>
            <div className="glass-text-primary font-medium">
              {chartStats.min.toLocaleString()} kWh
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};