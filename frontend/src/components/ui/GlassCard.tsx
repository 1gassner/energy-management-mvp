import React from 'react';
import { clsx } from 'clsx';

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'ultra-light' | 'light' | 'medium' | 'strong';
  theme?: 'default' | 'hechingen-primary' | 'hechingen-success' | 'hechingen-heritage';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  animated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'medium',
  theme = 'default',
  className,
  onClick,
  hover = true,
  animated = true,
  padding = 'lg'
}) => {
  const baseClasses = clsx(
    // Base glass card classes based on variant and theme
    theme === 'default' && `glass-card-${variant}`,
    theme !== 'default' && `glass-card-${theme}`,
    
    // Performance optimizations
    'glass-card-optimized gpu-accelerated',
    
    // Padding classes using semantic tokens
    padding === 'none' && 'p-0',
    padding === 'sm' && 'padding-sm',
    padding === 'md' && 'padding-md',
    padding === 'lg' && 'padding-lg',
    padding === 'xl' && 'padding-xl',
    
    // Interactive states
    onClick && 'cursor-pointer button-press-feedback',
    hover && 'performance-hover performance-scale',
    
    // Animations
    animated && 'animate-glass-appear',
    
    // Layout stability
    'min-h-[80px]',
    
    // Custom classes
    className
  );

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardHeader: React.FC<GlassCardHeaderProps> = ({
  children,
  className
}) => {
  return (
    <div className={clsx('pb-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
};

export interface GlassCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardContent: React.FC<GlassCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={clsx('pt-4', className)}>
      {children}
    </div>
  );
};

export interface GlassCardTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GlassCardTitle: React.FC<GlassCardTitleProps> = ({
  children,
  size = 'lg',
  className
}) => {
  const sizeClasses = {
    sm: 'text-lg glass-heading-secondary',
    md: 'text-xl glass-heading-secondary',
    lg: 'text-2xl glass-heading-primary',
    xl: 'text-3xl glass-heading-primary'
  };

  return (
    <h3 className={clsx(sizeClasses[size], 'mb-2', className)}>
      {children}
    </h3>
  );
};

export interface GlassCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardDescription: React.FC<GlassCardDescriptionProps> = ({
  children,
  className
}) => {
  return (
    <p className={clsx('glass-text-secondary', className)}>
      {children}
    </p>
  );
};

// Compound component exports  
const GlassCardWithSubComponents = GlassCard as typeof GlassCard & {
  Header: typeof GlassCardHeader;
  Content: typeof GlassCardContent;
  Title: typeof GlassCardTitle;
  Description: typeof GlassCardDescription;
};

GlassCardWithSubComponents.Header = GlassCardHeader;
GlassCardWithSubComponents.Content = GlassCardContent;
GlassCardWithSubComponents.Title = GlassCardTitle;
GlassCardWithSubComponents.Description = GlassCardDescription;

// Re-export the enhanced component
export default GlassCardWithSubComponents;