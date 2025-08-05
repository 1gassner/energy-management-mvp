import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Brush, Cell,
  Treemap
} from 'recharts';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  ZoomIn, RotateCcw, Filter, 
  TrendingUp,
  Eye, EyeOff, Maximize2
} from 'lucide-react';
import type { DrillDownChartData, TreeMapData } from '@/types';

interface DrillDownChartProps {
  data: DrillDownChartData;
  onDrillDown: (dataPoint: Record<string, unknown>) => void;
  onDrillUp: () => void;
  chartType?: 'line' | 'bar' | 'area' | 'composed';
  height?: number;
}

export const DrillDownChart: React.FC<DrillDownChartProps> = ({
  data,
  onDrillDown,
  onDrillUp,
  chartType = 'line',
  height = 400
}) => {
  const [zoomDomain, setZoomDomain] = useState<{ left?: number; right?: number }>({});
  // const [visibleSeries] = useState<string[]>([]);

  const handleChartClick = (data: { activePayload?: Array<{ payload: Record<string, unknown> }> }) => {
    if (data && data.activePayload) {
      onDrillDown(data.activePayload[0].payload);
    }
  };

  const resetZoom = () => {
    setZoomDomain({});
  };

  // const toggleSeries = (seriesName: string) => {
  //   setVisibleSeries(prev =>
  //     prev.includes(seriesName)
  //       ? prev.filter(s => s !== seriesName)
  //       : [...prev, seriesName]
  //   );
  // };

  const renderChart = () => {
    const commonProps = {
      data: data.data,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
      onClick: handleChartClick
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
            />
            <Bar 
              dataKey="value" 
              fill="#3B82F6"
              cursor="pointer"
            >
              {data.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
              ))}
            </Bar>
            {data.level < 2 && <Brush dataKey="name" height={30} />}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
            <Brush dataKey="name" height={30} />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="value" fill="#3B82F6" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="trend" 
              stroke="#10B981"
              strokeWidth={2}
            />
            <Brush dataKey="name" height={30} />
          </ComposedChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              domain={zoomDomain.left !== undefined && zoomDomain.right !== undefined ? [zoomDomain.left, zoomDomain.right] : ['dataMin', 'dataMax']}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
            <Brush 
              dataKey="name" 
              height={30}
              onChange={(domain) => setZoomDomain({ left: domain?.startIndex, right: domain?.endIndex })}
            />
          </LineChart>
        );
    }
  };

  return (
    <ModernCard variant="glassmorphism" className="p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {data.breadcrumb.join(' > ')}
          </h3>
          <p className="text-sm text-gray-600">
            Level {data.level} | {data.metadata.totalRecords} Datenpunkte
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {data.level > 0 && (
            <button
              onClick={onDrillUp}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Eine Ebene zurück"
            >
              <TrendingUp className="w-4 h-4 rotate-180" />
            </button>
          )}
          
          <button
            onClick={resetZoom}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            title="Chart vergrößern"
          >
            <Maximize2 className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Chart Filters */}
      {data.availableFilters.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {data.availableFilters.map((filter) => (
                <select
                  key={filter.id}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  defaultValue={filter.value}
                >
                  <option value="">{filter.name}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Chart Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Zeitraum: {data.metadata.timeRange.start} - {data.metadata.timeRange.end}</span>
          <span>Aggregation: {data.metadata.aggregationLevel}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Drill-Down verfügbar</span>
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>
    </ModernCard>
  );
};

interface CorrelationHeatmapProps {
  data: Array<{
    x: string;
    y: string;
    value: number;
    correlation: number;
  }>;
  width?: number;
  height?: number;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  data
  // width = 600,
  // height = 400
}) => {
  const [selectedCell, setSelectedCell] = useState<{ x: string; y: string; value: number } | null>(null);

  // Transform data for heatmap visualization
  const heatmapData = useMemo(() => {
    const uniqueX = [...new Set(data.map(d => d.x))];
    const uniqueY = [...new Set(data.map(d => d.y))];
    
    return uniqueY.map(y => {
      const row: Record<string, unknown> = { name: y };
      uniqueX.forEach(x => {
        const item = data.find(d => d.x === x && d.y === y);
        row[x] = item ? item.correlation : 0;
      });
      return row;
    });
  }, [data]);

  const getColor = (value: number) => {
    const intensity = Math.abs(value);
    if (value > 0) {
      return `rgba(34, 197, 94, ${intensity})`; // Green for positive correlation
    } else {
      return `rgba(239, 68, 68, ${intensity})`; // Red for negative correlation
    }
  };

  return (
    <ModernCard variant="glassmorphism" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Korrelations-Heatmap</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Positive Korrelation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Negative Korrelation</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="p-2"></th>
              {[...new Set(data.map(d => d.x))].map(x => (
                <th key={x} className="p-2 text-xs font-medium text-gray-700 rotate-45 whitespace-nowrap">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, i) => (
              <tr key={i}>
                <td className="p-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {String(row.name)}
                </td>
                {[...new Set(data.map(d => d.x))].map(x => {
                  const value = (row as any)[x] as number;
                  return (
                    <td 
                      key={x}
                      className="p-0 relative cursor-pointer"
                      onClick={() => setSelectedCell({ x, y: String(row.name), value })}
                    >
                      <div 
                        className="w-12 h-12 flex items-center justify-center text-xs font-medium border border-gray-200"
                        style={{ backgroundColor: getColor(value) }}
                      >
                        {value ? value.toFixed(2) : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Korrelationsdetails</h4>
          <div className="text-sm text-blue-800">
            <div><strong>{selectedCell.x}</strong> ↔ <strong>{selectedCell.y}</strong></div>
            <div>Korrelation: {selectedCell.value?.toFixed(3)}</div>
            <div>
              Stärke: {Math.abs(selectedCell.value || 0) > 0.7 ? 'Stark' : 
                      Math.abs(selectedCell.value || 0) > 0.3 ? 'Mittel' : 'Schwach'}
            </div>
          </div>
        </div>
      )}
    </ModernCard>
  );
};

interface TreemapChartProps {
  data: TreeMapData[];
  width?: number;
  height?: number;
  onSelect?: (data: TreeMapData) => void;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  // width = 600,
  height = 400,
  onSelect: _onSelect
}) => {
  const [selectedItem] = useState<TreeMapData | null>(null);


  return (
    <ModernCard variant="glassmorphism" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hierarchische Datenansicht</h3>
        {selectedItem && (
          <div className="text-sm bg-blue-50 px-3 py-2 rounded-lg">
            <strong>{selectedItem.name}</strong>: {selectedItem.value.toLocaleString()} ({selectedItem.percentage.toFixed(1)}%)
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4/3}
          stroke="#ffffff"
          content={<CustomTreemapContent />}
        />
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color || '#3B82F6' }}
            ></div>
            <span className="truncate">{item.name}</span>
            <span className="text-gray-500">({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </ModernCard>
  );
};

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  if (!payload || width < 30 || height < 20) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color || '#3B82F6'}
        fillOpacity={0.8}
        stroke="#ffffff"
        strokeWidth={1}
        className="cursor-pointer hover:fill-opacity-100"
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(width / 8, height / 4, 12)}
          fill="#ffffff"
          fontWeight="bold"
        >
          {payload.name}
        </text>
      )}
      {width > 80 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(width / 10, height / 6, 10)}
          fill="#ffffff"
        >
          {payload.value.toLocaleString()}
        </text>
      )}
    </g>
  );
};

interface MultiAxisChartProps {
  data: Array<{
    name: string;
    primary: number;
    secondary: number;
    tertiary?: number;
  }>;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel?: string;
  height?: number;
}

export const MultiAxisChart: React.FC<MultiAxisChartProps> = ({
  data,
  primaryLabel,
  secondaryLabel,
  tertiaryLabel,
  height = 400
}) => {
  const [visibleSeries, setVisibleSeries] = useState({
    primary: true,
    secondary: true,
    tertiary: !!tertiaryLabel
  });

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({ ...prev, [series]: !prev[series] }));
  };

  return (
    <ModernCard variant="glassmorphism" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Multi-Achsen Analyse</h3>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => toggleSeries('primary')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              visibleSeries.primary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {visibleSeries.primary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{primaryLabel}</span>
          </button>
          
          <button
            onClick={() => toggleSeries('secondary')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              visibleSeries.secondary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {visibleSeries.secondary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{secondaryLabel}</span>
          </button>
          
          {tertiaryLabel && (
            <button
              onClick={() => toggleSeries('tertiary')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                visibleSeries.tertiary ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {visibleSeries.tertiary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{tertiaryLabel}</span>
            </button>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              name === 'primary' ? primaryLabel : 
              name === 'secondary' ? secondaryLabel : 
              tertiaryLabel
            ]}
          />
          <Legend />
          
          {visibleSeries.primary && (
            <Bar 
              yAxisId="left" 
              dataKey="primary" 
              fill="#3B82F6" 
              name={primaryLabel}
              fillOpacity={0.8}
            />
          )}
          
          {visibleSeries.secondary && (
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="secondary" 
              stroke="#10B981"
              strokeWidth={3}
              name={secondaryLabel}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          )}
          
          {visibleSeries.tertiary && tertiaryLabel && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="tertiary"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
              name={tertiaryLabel}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ModernCard>
  );
};

export default DrillDownChart;