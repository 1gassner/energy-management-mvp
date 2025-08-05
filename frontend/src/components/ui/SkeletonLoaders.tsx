import React, { memo } from 'react';

// Base skeleton component with optimized animations
const SkeletonBase: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}> = memo(({ className = '', width, height, rounded = false }) => (
  <div
    className={`
      animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
      dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
      ${rounded ? 'rounded-full' : 'rounded'}
      ${className}
    `}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite'
    }}
  />
));

// Card skeleton
export const CardSkeleton: React.FC<{
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}> = memo(({ className = '', showHeader = true, showFooter = false }) => (
  <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
    {showHeader && (
      <div className="flex items-center justify-between mb-4">
        <SkeletonBase width="60%" height={24} />
        <SkeletonBase width={80} height={20} rounded />
      </div>
    )}
    
    <div className="space-y-3">
      <SkeletonBase width="100%" height={20} />
      <SkeletonBase width="80%" height={20} />
      <SkeletonBase width="90%" height={20} />
    </div>
    
    {showFooter && (
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <SkeletonBase width={60} height={16} />
        <SkeletonBase width={100} height={32} />
      </div>
    )}
  </div>
));

// Dashboard skeleton
export const DashboardSkeleton: React.FC = memo(() => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <SkeletonBase width={300} height={32} />
      <div className="flex space-x-2">
        <SkeletonBase width={100} height={36} />
        <SkeletonBase width={100} height={36} />
      </div>
    </div>
    
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} showHeader={false} />
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <SkeletonBase width="40%" height={24} className="mb-4" />
        <SkeletonBase width="100%" height={300} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <SkeletonBase width="40%" height={24} className="mb-4" />
        <SkeletonBase width="100%" height={300} />
      </div>
    </div>
  </div>
));

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = memo(({ rows = 5, columns = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} width="100%" height={20} />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase key={colIndex} width="100%" height={16} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

// List skeleton
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
}> = memo(({ items = 5, showAvatar = false }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
        {showAvatar && <SkeletonBase width={40} height={40} rounded />}
        <div className="flex-1 space-y-2">
          <SkeletonBase width="60%" height={16} />
          <SkeletonBase width="40%" height={14} />
        </div>
        <SkeletonBase width={60} height={20} />
      </div>
    ))}
  </div>
));

// Chart skeleton with better visualization
export const ChartSkeleton: React.FC<{
  height?: number;
  type?: 'line' | 'bar' | 'pie';
}> = memo(({ height = 300, type = 'line' }) => (
  <div 
    className="flex flex-col justify-end items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4"
    style={{ height: `${height}px` }}
  >
    {type === 'line' && (
      <div className="w-full h-full relative">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-xs text-gray-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBase key={i} width={20} height={10} />
          ))}
        </div>
        
        {/* Chart area */}
        <div className="ml-10 mr-4 h-full relative">
          <svg className="w-full h-full">
            {/* Grid lines */}
            {Array.from({ length: 4 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={`${(i + 1) * 20}%`}
                x2="100%"
                y2={`${(i + 1) * 20}%`}
                stroke="rgba(156, 163, 175, 0.3)"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Animated line */}
            <path
              d="M 0 80% Q 25% 60% 50% 70% T 100% 50%"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
          </svg>
        </div>
        
        {/* X-axis */}
        <div className="flex justify-between ml-10 mr-4 mt-2 text-xs text-gray-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBase key={i} width={30} height={10} />
          ))}
        </div>
      </div>
    )}
    
    {type === 'bar' && (
      <div className="w-full h-full flex items-end justify-around px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBase
            key={i}
            width={20}
            height={`${Math.random() * 60 + 40}%`}
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )}
    
    {type === 'pie' && (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <SkeletonBase width={120} height={120} rounded />
          <div className="absolute inset-4">
            <SkeletonBase width={88} height={88} rounded className="bg-white dark:bg-gray-800" />
          </div>
        </div>
      </div>
    )}
    
    {/* Loading indicator */}
    <div className="flex items-center justify-center mt-4">
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce mr-2" />
      <span className="text-sm text-gray-500">Loading chart...</span>
    </div>
  </div>
));

// Metric card skeleton
export const MetricCardSkeleton: React.FC = memo(() => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBase width={24} height={24} />
      <SkeletonBase width={60} height={20} />
    </div>
    
    <div className="space-y-2">
      <SkeletonBase width="40%" height={32} />
      <SkeletonBase width="60%" height={16} />
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <SkeletonBase width="50%" height={14} />
        <SkeletonBase width={40} height={16} />
      </div>
    </div>
  </div>
));

// Add shimmer animation to global styles
export const SkeletonStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `}</style>
);

// Display names
SkeletonBase.displayName = 'SkeletonBase';
CardSkeleton.displayName = 'CardSkeleton';
DashboardSkeleton.displayName = 'DashboardSkeleton';
TableSkeleton.displayName = 'TableSkeleton';
ListSkeleton.displayName = 'ListSkeleton';
ChartSkeleton.displayName = 'ChartSkeleton';
MetricCardSkeleton.displayName = 'MetricCardSkeleton';