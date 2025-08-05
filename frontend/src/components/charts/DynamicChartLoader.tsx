import React, { Suspense, lazy, memo, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import LoadingSpinner from '../ui/LoadingSpinner';

// Dynamic chart loader - only loads when component is in viewport
const ChartLoader = memo(({ type, ...props }: {
  type: 'line' | 'bar' | 'pie';
  [key: string]: any;
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Load chart when it becomes visible
  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);

  // Lazy load specific chart components
  const ChartComponent = lazy(async () => {
    const module = await import('recharts');
    
    return {
      default: memo(({ data, height = 300, config = {}, ...chartProps }: any) => {
        switch (type) {
          case 'line':
            return (
              <module.ResponsiveContainer width="100%" height={height}>
                <module.LineChart data={data} {...chartProps}>
                  <module.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <module.XAxis 
                    dataKey="time" 
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
                  {config.lines?.map((line: any, index: number) => (
                    <module.Line 
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      stroke={line.color}
                      strokeWidth={2}
                      name={line.name}
                      dot={false}
                      activeDot={{ r: 4, stroke: line.color, strokeWidth: 2 }}
                    />
                  )) || (
                    <>
                      <module.Line type="monotone" dataKey="production" stroke="#10B981" strokeWidth={2} name="Production" dot={false} />
                      <module.Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} name="Consumption" dot={false} />
                      <module.Line type="monotone" dataKey="grid" stroke="#8B5CF6" strokeWidth={2} name="Grid" dot={false} />
                    </>
                  )}
                </module.LineChart>
              </module.ResponsiveContainer>
            );
            
          case 'bar':
            return (
              <module.ResponsiveContainer width="100%" height={height}>
                <module.BarChart data={data} {...chartProps}>
                  <module.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <module.XAxis 
                    dataKey={config.xAxis || "name"} 
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
                  <module.Bar 
                    dataKey={config.dataKey || "value"} 
                    fill={config.color || "#3B82F6"} 
                  />
                </module.BarChart>
              </module.ResponsiveContainer>
            );
            
          case 'pie':
            return (
              <module.ResponsiveContainer width="100%" height={height}>
                <module.PieChart>
                  <module.Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(height * 0.35, 120)}
                    fill={config.color || "#3B82F6"}
                    dataKey={config.dataKey || "value"}
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
            return <div>Unsupported chart type: {type}</div>;
        }
      })
    };
  });

  return (
    <div ref={ref} style={{ minHeight: `${props.height || 300}px` }}>
      {shouldLoad ? (
        <Suspense fallback={
          <div className="flex items-center justify-center h-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinner />
              <p className="text-sm text-gray-600">Loading {type} chart...</p>
            </div>
          </div>
        }>
          <ChartComponent {...props} />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <p className="text-sm text-gray-500">Chart ready to load</p>
          </div>
        </div>
      )}
    </div>
  );
});

// Optimized chart components with intersection observer
export const DynamicLineChart = memo((props: any) => (
  <ChartLoader type="line" {...props} />
));

export const DynamicBarChart = memo((props: any) => (
  <ChartLoader type="bar" {...props} />
));

export const DynamicPieChart = memo((props: any) => (
  <ChartLoader type="pie" {...props} />
));

// Display names
DynamicLineChart.displayName = 'DynamicLineChart';
DynamicBarChart.displayName = 'DynamicBarChart';
DynamicPieChart.displayName = 'DynamicPieChart';
ChartLoader.displayName = 'ChartLoader';