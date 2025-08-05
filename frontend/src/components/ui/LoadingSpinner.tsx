import React from 'react';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-blue-600',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-[60px]">
      <div className={`loading-spinner-optimized rounded-full border-gray-300/20 border-t-current ${sizeClasses[size]} ${color}`}>
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse-optimized text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;