import React, { Suspense, lazy, memo, useMemo, useCallback } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Optimized chart loader with better error handling
const createChartComponent = (chartType: string) => lazy(() => 
  import('recharts').then(module => ({
    default: React.memo(function OptimizedChart({ 
      data, 
      height, 
      config,
      onDataClick,
      ...props 
    }: {
      data: Array<Record<string, unknown>>;
      height: number;
      config?: Record<string, unknown>;
      onDataClick?: (data: unknown) => void;
      [key: string]: unknown;
    }) {
      const memoizedData = useMemo(() => data, [data]);
      
      const handleClick = useCallback((clickData: unknown) => {
        onDataClick?.(clickData);
      }, [onDataClick]);

      switch (chartType) {
        case 'line':
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.LineChart data={memoizedData} onClick={handleClick} {...props}>
                <module.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <module.XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <module.YAxis 
                  label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <module.Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <module.Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  name="Production"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2 }}
                />
                <module.Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  name="Consumption"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <module.Line 
                  type="monotone" 
                  dataKey="grid" 
                  stroke="#8B5CF6" 
                  strokeWidth={2} 
                  name="Grid"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </module.LineChart>
            </module.ResponsiveContainer>
          );
          
        case 'bar':
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.BarChart data={memoizedData} onClick={handleClick} {...props}>
                <module.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <module.XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <module.YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <module.Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <module.Bar dataKey="value" fill="#3B82F6" />
              </module.BarChart>
            </module.ResponsiveContainer>
          );
          
        case 'pie':
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.PieChart>
                <module.Pie
                  data={memoizedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(height * 0.35, 120)}
                  fill="#3B82F6"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                />
                <module.Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </module.PieChart>
            </module.ResponsiveContainer>
          );
          
        default:
          return <div>Unsupported chart type: {chartType}</div>;
      }
    })
  }))
  .catch((error) => {
    console.error(`Failed to load ${chartType} chart:`, error);
    return { 
      default: () => (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <p>Chart failed to load</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )
    };
  })
);

// Optimized chart components
const OptimizedLineChart = createChartComponent('line');
const OptimizedBarChart = createChartComponent('bar');
const OptimizedPieChart = createChartComponent('pie');

// Chart skeleton loader
const ChartSkeleton: React.FC<{ height: number }> = memo(({ height }) => (
  <div 
    className="flex items-center justify-center animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"
    style={{ height: `${height}px` }}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="w-8 h-8 bg-gray-300 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading chart...</p>
    </div>
  </div>
));

// Enhanced wrapper components with error boundaries
interface ChartWrapperProps {
  data: Array<Record<string, unknown>>;
  height?: number;
  config?: Record<string, unknown>;
  onDataClick?: (data: unknown) => void;
  [key: string]: unknown;
}

export const LazyLineChartOptimized: React.FC<ChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => (
  <Suspense fallback={<ChartSkeleton height={height} />}>
    <OptimizedLineChart data={data} height={height} {...props} />
  </Suspense>
));

export const LazyBarChartOptimized: React.FC<ChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => (
  <Suspense fallback={<ChartSkeleton height={height} />}>
    <OptimizedBarChart data={data} height={height} {...props} />
  </Suspense>
));

export const LazyPieChartOptimized: React.FC<ChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => (
  <Suspense fallback={<ChartSkeleton height={height} />}>
    <OptimizedPieChart data={data} height={height} {...props} />
  </Suspense>
));

// Chart container with performance monitoring
export const ChartContainer: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = memo(({ children, title, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Chart is visible, can trigger performance measurement
              performance.mark('chart-visible');
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(containerRef.current);
      
      return () => observer.disconnect();
    }
  }, []);
  
  return (
    <div ref={containerRef} className={`chart-container ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
});

// Display names for debugging
LazyLineChartOptimized.displayName = 'LazyLineChartOptimized';
LazyBarChartOptimized.displayName = 'LazyBarChartOptimized';
LazyPieChartOptimized.displayName = 'LazyPieChartOptimized';
ChartContainer.displayName = 'ChartContainer';
ChartSkeleton.displayName = 'ChartSkeleton';