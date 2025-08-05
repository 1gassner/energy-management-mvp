import React from 'react';
import { clsx } from 'clsx';

export interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'hechingen-primary' | 'hechingen-success' | 'hechingen-heritage';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  ghost?: boolean;
  animated?: boolean;
  href?: string;
  target?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ghost = false,
  animated = true,
  href,
  target
}) => {
  const baseClasses = clsx(
    // Base glass button style
    'glass-focus-ring',
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'border border-transparent rounded-lg',
    'backdrop-blur-md -webkit-backdrop-filter',
    
    // Core variants
    variant === 'primary' && !ghost && 'glass-button-primary',
    variant === 'secondary' && !ghost && 'glass-button-secondary',
    variant === 'hechingen-primary' && !ghost && 'glass-button-hechingen-primary',
    variant === 'hechingen-success' && !ghost && 'glass-button-hechingen-success',
    variant === 'hechingen-heritage' && !ghost && 'glass-button-hechingen-heritage',
    variant === 'success' && !ghost && [
      'bg-gradient-to-r from-green-500/80 to-green-600/80',
      'hover:from-green-600/90 hover:to-green-700/90',
      'border-green-400/30 text-white',
      'shadow-lg hover:shadow-green-500/25'
    ],
    variant === 'warning' && !ghost && [
      'bg-gradient-to-r from-yellow-500/80 to-orange-500/80', 
      'hover:from-yellow-600/90 hover:to-orange-600/90',
      'border-yellow-400/30 text-white',
      'shadow-lg hover:shadow-yellow-500/25'
    ],
    variant === 'danger' && !ghost && [
      'bg-gradient-to-r from-red-500/80 to-red-600/80',
      'hover:from-red-600/90 hover:to-red-700/90', 
      'border-red-400/30 text-white',
      'shadow-lg hover:shadow-red-500/25'
    ],
    
    // Ghost variants
    ghost && variant === 'primary' && 'glass-button-ghost-primary',
    ghost && variant === 'secondary' && 'glass-button-ghost-secondary',
    ghost && variant === 'hechingen-primary' && 'glass-button-ghost-hechingen',
    
    // Sizes with proper spacing
    size === 'xs' && 'px-2 py-1 text-xs min-h-[24px]',
    size === 'sm' && 'px-3 py-1.5 text-sm min-h-[32px]',
    size === 'md' && 'px-4 py-2 text-base min-h-[40px]',
    size === 'lg' && 'px-6 py-3 text-lg min-h-[48px]',
    size === 'xl' && 'px-8 py-4 text-xl min-h-[56px]',
    
    // States
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait',
    
    // Animation enhancement
    animated && !disabled && !loading && 'hover:transform hover:scale-105 active:scale-95',
    
    className
  );

  const content = (
    <>
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-1">{leftIcon}</span>}
      <span className="flex-1">{children}</span>
      {!loading && rightIcon && <span className="ml-1">{rightIcon}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={baseClasses}
        onClick={disabled || loading ? undefined : onClick}
        aria-disabled={disabled || loading}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {content}
    </button>
  );
};

export interface GlassButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export const GlassButtonGroup: React.FC<GlassButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  fullWidth = false
}) => {
  return (
    <div
      className={clsx(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        fullWidth && 'w-full',
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          className: clsx(
            child.props.className,
            orientation === 'horizontal' && index === 0 && 'rounded-r-none',
            orientation === 'horizontal' && index > 0 && index < React.Children.count(children) - 1 && 'rounded-none',
            orientation === 'horizontal' && index === React.Children.count(children) - 1 && 'rounded-l-none',
            orientation === 'vertical' && index === 0 && 'rounded-b-none',
            orientation === 'vertical' && index > 0 && index < React.Children.count(children) - 1 && 'rounded-none',
            orientation === 'vertical' && index === React.Children.count(children) - 1 && 'rounded-t-none',
            fullWidth && 'flex-1'
          )
        });
      })}
    </div>
  );
};