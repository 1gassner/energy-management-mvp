import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  hover?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  animate = true,
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glassmorphism':
        return 'analytics-glass-card';
      case 'education':
        return 'card-education-purple';
      case 'pool':
        return 'card-aquatic';
      case 'sports':
        return 'card-sports';
      case 'heritage':
        return 'card-heritage';
      default:
        return 'kpi-glass-card';
    }
  };

  return (
    <div 
      className={cn(
        getVariantClasses(),
        hover && 'hover:scale-105 hover:shadow-2xl',
        animate && 'animate-fade-in-up transition-all duration-300',
        'will-change-transform',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ModernCard;