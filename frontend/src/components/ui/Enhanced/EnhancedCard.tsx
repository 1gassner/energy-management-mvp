import React, { forwardRef, useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { logger } from '@/utils/logger';

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'energy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: string;
  children: React.ReactNode;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({
    variant = 'default',
    size = 'md',
    padding = 'md',
    loading = false,
    interactive = false,
    selected = false,
    disabled = false,
    header,
    footer,
    badge,
    scrollable = false,
    maxHeight,
    children,
    className,
    onClick,
    onKeyDown,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Handle keyboard interactions for interactive cards
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        if (onClick) {
          onClick(event as any);
        }
      }
      onKeyDown?.(event);
    }, [interactive, onClick, onKeyDown]);

    // Base card styles
    const baseStyles = `
      relative rounded-lg transition-all duration-200 ease-in-out
      ${interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    // Variant styles with proper energy-themed colors
    const variantStyles = {
      default: `
        bg-white border border-gray-200 shadow-sm
        hover:shadow-md hover:border-gray-300
        ${selected ? 'ring-2 ring-blue-500 border-blue-300' : ''}
      `,
      elevated: `
        bg-white shadow-lg border border-gray-100
        hover:shadow-xl hover:border-gray-200
        ${selected ? 'ring-2 ring-blue-500 shadow-blue-200/50' : ''}
      `,
      outlined: `
        bg-transparent border-2 border-gray-300
        hover:border-gray-400 hover:bg-gray-50
        ${selected ? 'border-blue-500 bg-blue-50' : ''}
      `,
      glass: `
        bg-white/10 backdrop-blur-md border border-white/20
        shadow-lg hover:bg-white/20 hover:border-white/30
        ${selected ? 'ring-2 ring-white/50 bg-white/30' : ''}
      `,
      energy: `
        bg-gradient-to-br from-green-50 to-blue-50
        border border-green-200/50 shadow-sm
        hover:from-green-100 hover:to-blue-100 hover:shadow-md
        ${selected ? 'ring-2 ring-green-500 border-green-300' : ''}
      `
    };

    // Size styles for responsive design
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl'
    };

    // Padding styles
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    // Interactive styles
    const interactiveStyles = interactive && !disabled ? `
      transform transition-transform duration-200
      ${isHovered ? 'scale-[1.02]' : 'scale-100'}
      ${isFocused ? 'scale-[1.02]' : ''}
      hover:scale-[1.02]
      active:scale-[0.98]
    ` : '';

    const cardClasses = clsx(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      interactiveStyles,
      className
    );

    const contentClasses = clsx(
      paddingStyles[padding],
      {
        'overflow-y-auto': scrollable,
      }
    );

    // Loading skeleton component
    const LoadingSkeleton = () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={interactive && !disabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={interactive && !disabled ? 0 : -1}
        role={interactive ? 'button' : 'article'}
        aria-disabled={disabled}
        aria-selected={selected}
        style={{ maxHeight: scrollable ? maxHeight : undefined }}
        {...props}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-2 right-2 z-10">
            {badge}
          </div>
        )}

        {/* Header */}
        {header && (
          <div className={clsx(
            'border-b border-gray-200 pb-4 mb-4',
            padding === 'none' ? 'px-6 pt-6' : '',
            variant === 'glass' ? 'border-white/20' : '',
            variant === 'energy' ? 'border-green-200/50' : ''
          )}>
            {header}
          </div>
        )}

        {/* Main content */}
        <div className={contentClasses}>
          {loading ? <LoadingSkeleton /> : children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={clsx(
            'border-t border-gray-200 pt-4 mt-4',
            padding === 'none' ? 'px-6 pb-6' : '',
            variant === 'glass' ? 'border-white/20' : '',
            variant === 'energy' ? 'border-green-200/50' : ''
          )}>
            {footer}
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="absolute inset-0 rounded-lg pointer-events-none">
            <div className="absolute top-2 left-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Interactive hover effect */}
        {interactive && !disabled && (
          <div
            className={clsx(
              'absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-200',
              'bg-gradient-to-r from-blue-500/5 to-purple-500/5',
              { 'opacity-100': isHovered || isFocused, 'opacity-0': !isHovered && !isFocused }
            )}
          />
        )}
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };
export default EnhancedCard;