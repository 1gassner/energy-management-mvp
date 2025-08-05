import React, { Suspense, lazy, memo, useMemo, useCallback, useState, useEffect } from 'react';

// Mobile-specific chart loader with responsive breakpoints
const createMobileChartComponent = (chartType: string) => lazy(() => 
  import('recharts').then(module => ({
    default: memo(function MobileOptimizedChart({ 
      data, 
      height, 
      config: _config,
      onDataClick,
      ...props 
    }: {
      data: Array<Record<string, unknown>>;
      height: number;
      config?: Record<string, unknown>;
      onDataClick?: (data: unknown) => void;
      [key: string]: unknown;
    }) {
      const [isMobile, setIsMobile] = useState(false);
      const [isSmallMobile, setIsSmallMobile] = useState(false);

      useEffect(() => {
        const checkMobile = () => {
          setIsMobile(window.innerWidth < 768);
          setIsSmallMobile(window.innerWidth < 480);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
      }, []);

      const memoizedData = useMemo(() => data, [data]);
      
      const handleClick = useCallback((clickData: unknown) => {
        onDataClick?.(clickData);
      }, [onDataClick]);

      // Mobile-optimized styles
      const mobileStyles = useMemo(() => ({
        fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
        tickFontSize: isSmallMobile ? 8 : isMobile ? 9 : 10,
        legendFontSize: isSmallMobile ? 9 : isMobile ? 10 : 11,
        strokeWidth: isMobile ? 1.5 : 2,
        activeDotRadius: isMobile ? 3 : 4,
        margin: isMobile 
          ? { top: 10, right: 10, left: 10, bottom: 10 }
          : { top: 20, right: 30, left: 20, bottom: 20 }
      }), [isMobile, isSmallMobile]);

      const tooltipStyle = useMemo(() => ({
        backgroundColor: 'rgba(0,0,0,0.9)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        color: 'white',
        fontSize: mobileStyles.fontSize,
        padding: isMobile ? '6px' : '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }), [mobileStyles.fontSize, isMobile]);

      switch (chartType) {
        case 'line':
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.LineChart 
                data={memoizedData} 
                onClick={handleClick} 
                margin={mobileStyles.margin}
                {...props}
              >
                <module.CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)"
                  opacity={isMobile ? 0.5 : 1}
                />
                <module.XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={mobileStyles.tickFontSize}
                  interval={isMobile ? 2 : 1}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 40}
                />
                <module.YAxis 
                  label={isMobile ? undefined : { value: 'kW', angle: -90, position: 'insideLeft' }}
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={mobileStyles.tickFontSize}
                  width={isMobile ? 40 : 60}
                />
                <module.Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'white', fontSize: mobileStyles.fontSize }}
                />
                {!isMobile && (
                  <module.Legend 
                    wrapperStyle={{ 
                      fontSize: mobileStyles.legendFontSize,
                      paddingTop: '10px' 
                    }}
                  />
                )}
                <module.Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#10B981" 
                  strokeWidth={mobileStyles.strokeWidth}
                  name="Production"
                  dot={false}
                  activeDot={{ 
                    r: mobileStyles.activeDotRadius, 
                    stroke: '#10B981', 
                    strokeWidth: 2,
                    fill: '#10B981'
                  }}
                />
                <module.Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3B82F6" 
                  strokeWidth={mobileStyles.strokeWidth}
                  name="Consumption"
                  dot={false}
                  activeDot={{ 
                    r: mobileStyles.activeDotRadius, 
                    stroke: '#3B82F6', 
                    strokeWidth: 2,
                    fill: '#3B82F6'
                  }}
                />
                <module.Line 
                  type="monotone" 
                  dataKey="grid" 
                  stroke="#8B5CF6" 
                  strokeWidth={mobileStyles.strokeWidth}
                  name="Grid"
                  dot={false}
                  activeDot={{ 
                    r: mobileStyles.activeDotRadius, 
                    stroke: '#8B5CF6', 
                    strokeWidth: 2,
                    fill: '#8B5CF6'
                  }}
                />
              </module.LineChart>
            </module.ResponsiveContainer>
          );
          
        case 'bar':
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.BarChart 
                data={memoizedData} 
                onClick={handleClick} 
                margin={mobileStyles.margin}
                {...props}
              >
                <module.CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)"
                  opacity={isMobile ? 0.5 : 1}
                />
                <module.XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={mobileStyles.tickFontSize}
                  interval={0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 40}
                />
                <module.YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={mobileStyles.tickFontSize}
                  width={isMobile ? 40 : 60}
                />
                <module.Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'white', fontSize: mobileStyles.fontSize }}
                />
                {!isMobile && (
                  <module.Legend 
                    wrapperStyle={{ 
                      fontSize: mobileStyles.legendFontSize,
                      paddingTop: '10px' 
                    }}
                  />
                )}
                <module.Bar 
                  dataKey="value" 
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
              </module.BarChart>
            </module.ResponsiveContainer>
          );
          
        case 'pie':
          const outerRadius = Math.min(height * 0.35, isMobile ? 80 : 120);
          const innerRadius = isMobile ? 30 : 50;
          
          return (
            <module.ResponsiveContainer width="100%" height={height}>
              <module.PieChart margin={mobileStyles.margin}>
                <module.Pie
                  data={memoizedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  fill="#3B82F6"
                  dataKey="value"
                  label={isMobile ? false : ({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={mobileStyles.fontSize}
                />
                <module.Tooltip 
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'white', fontSize: mobileStyles.fontSize }}
                />
                {!isMobile && (
                  <module.Legend 
                    wrapperStyle={{ 
                      fontSize: mobileStyles.legendFontSize,
                      paddingTop: '10px' 
                    }}
                  />
                )}
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
        <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
          <p className="text-sm mb-2">Chart konnte nicht geladen werden</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm touch-target"
          >
            Erneut versuchen
          </button>
        </div>
      )
    };
  })
);

// Mobile-optimized chart components
const MobileLineChart = createMobileChartComponent('line');
const MobileBarChart = createMobileChartComponent('bar');
const MobilePieChart = createMobileChartComponent('pie');

// Mobile-optimized skeleton loader
const MobileChartSkeleton: React.FC<{ height: number }> = memo(({ height }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="flex items-center justify-center animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-300 rounded-full animate-spin`} />
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
          Chart wird geladen...
        </p>
      </div>
    </div>
  );
});

// Enhanced wrapper components for mobile
interface MobileChartWrapperProps {
  data: Array<Record<string, unknown>>;
  height?: number;
  config?: Record<string, unknown>;
  onDataClick?: (data: unknown) => void;
  [key: string]: unknown;
}

export const MobileLineChartOptimized: React.FC<MobileChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => {
  const [adjustedHeight, setAdjustedHeight] = useState(height);

  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768;
      const isSmallMobile = window.innerWidth < 480;
      setAdjustedHeight(isSmallMobile ? Math.min(height, 220) : isMobile ? Math.min(height, 250) : height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [height]);

  return (
    <Suspense fallback={<MobileChartSkeleton height={adjustedHeight} />}>
      <MobileLineChart data={data} height={adjustedHeight} {...props} />
    </Suspense>
  );
});

export const MobileBarChartOptimized: React.FC<MobileChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => {
  const [adjustedHeight, setAdjustedHeight] = useState(height);

  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768;
      const isSmallMobile = window.innerWidth < 480;
      setAdjustedHeight(isSmallMobile ? Math.min(height, 220) : isMobile ? Math.min(height, 250) : height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [height]);

  return (
    <Suspense fallback={<MobileChartSkeleton height={adjustedHeight} />}>
      <MobileBarChart data={data} height={adjustedHeight} {...props} />
    </Suspense>
  );
});

export const MobilePieChartOptimized: React.FC<MobileChartWrapperProps> = memo(({ 
  data, 
  height = 300,
  ...props 
}) => {
  const [adjustedHeight, setAdjustedHeight] = useState(height);

  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768;
      const isSmallMobile = window.innerWidth < 480;
      setAdjustedHeight(isSmallMobile ? Math.min(height, 200) : isMobile ? Math.min(height, 230) : height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [height]);

  return (
    <Suspense fallback={<MobileChartSkeleton height={adjustedHeight} />}>
      <MobilePieChart data={data} height={adjustedHeight} {...props} />
    </Suspense>
  );
});

// Mobile chart container with swipe gestures and performance monitoring
export const MobileChartContainer: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
  enableSwipe?: boolean;
}> = memo(({ children, title, className = '', enableSwipe = false }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Touch gesture handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (enableSwipe) {
      setTouchStart(e.touches[0].clientX);
    }
  }, [enableSwipe]);

  const handleTouchMove = useCallback(() => {
    if (enableSwipe) {
      setIsScrolling(true);
    }
  }, [enableSwipe]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (enableSwipe && !isScrolling) {
      const touchEnd = e.changedTouches[0].clientX;
      const deltaX = touchStart - touchEnd;
      
      // Handle swipe gestures for chart navigation
      if (Math.abs(deltaX) > 50) {
        console.log(deltaX > 0 ? 'Swipe left' : 'Swipe right');
      }
    }
    setIsScrolling(false);
  }, [enableSwipe, isScrolling, touchStart]);

  React.useEffect(() => {
    if (containerRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              performance.mark('mobile-chart-visible');
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
    <div 
      ref={containerRef} 
      className={`mobile-chart-container ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {title && (
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
});

// Display names for debugging
MobileLineChartOptimized.displayName = 'MobileLineChartOptimized';
MobileBarChartOptimized.displayName = 'MobileBarChartOptimized';
MobilePieChartOptimized.displayName = 'MobilePieChartOptimized';
MobileChartContainer.displayName = 'MobileChartContainer';
MobileChartSkeleton.displayName = 'MobileChartSkeleton';