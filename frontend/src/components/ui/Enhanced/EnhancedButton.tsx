import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { logger } from '@/utils/logger';

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  hapticFeedback?: boolean;
  reducedMotion?: boolean;
  'aria-label'?: string;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    hapticFeedback = true,
    reducedMotion = false,
    className,
    children,
    onClick,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches || reducedMotion);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches || reducedMotion);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, [reducedMotion]);

    // Haptic feedback for supported devices
    const triggerHapticFeedback = useCallback(() => {
      if (hapticFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10); // 10ms vibration
        } catch (error) {
          logger.debug('Haptic feedback not supported', error as Error);
        }
      }
    }, [hapticFeedback]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }

      triggerHapticFeedback();
      onClick?.(event);
    }, [loading, disabled, onClick, triggerHapticFeedback]);

    const handleMouseDown = useCallback(() => {
      setIsPressed(true);
    }, []);

    const handleMouseUp = useCallback(() => {
      setIsPressed(false);
    }, []);

    // Base styles with WCAG 2.1 compliance
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium text-center
      border rounded-lg
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      min-h-[44px] min-w-[44px]
      relative overflow-hidden
    `;

    // Variant styles with WCAG 2.1 AA/AAA contrast ratios
    const variantStyles = {
      default: `
        bg-gray-100 hover:bg-gray-200 
        text-gray-900 
        border-gray-300 hover:border-gray-400
        focus:ring-gray-500
        active:bg-gray-300
      `,
      primary: `
        bg-blue-600 hover:bg-blue-700 
        text-white 
        border-transparent
        focus:ring-blue-500
        active:bg-blue-800
      `,
      secondary: `
        bg-gray-600 hover:bg-gray-700 
        text-white 
        border-transparent
        focus:ring-gray-500
        active:bg-gray-800
      `,
      success: `
        bg-green-600 hover:bg-green-700 
        text-white 
        border-transparent
        focus:ring-green-500
        active:bg-green-800
      `,
      warning: `
        bg-yellow-600 hover:bg-yellow-700 
        text-white 
        border-transparent
        focus:ring-yellow-500
        active:bg-yellow-800
      `,
      danger: `
        bg-red-600 hover:bg-red-700 
        text-white 
        border-transparent
        focus:ring-red-500
        active:bg-red-800
      `,
      ghost: `
        bg-transparent hover:bg-gray-100 
        text-gray-700 hover:text-gray-900
        border-transparent
        focus:ring-gray-500
        active:bg-gray-200
      `
    };

    // Size styles with proper touch targets
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm min-h-[44px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
      xl: 'px-8 py-4 text-lg min-h-[52px]'
    };

    // Animation styles
    const animationStyles = prefersReducedMotion 
      ? 'transition-none' 
      : `
        transition-all duration-200 ease-in-out
        ${isPressed ? 'scale-95' : 'scale-100'}
        hover:scale-105 active:scale-95
      `;

    const buttonClasses = clsx(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      animationStyles,
      {
        'w-full': fullWidth,
        'cursor-not-allowed': disabled || loading,
        'cursor-pointer': !disabled && !loading,
      },
      className
    );

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        {...props}
      >
        {/* Loading state */}
        {loading && <LoadingSpinner />}
        
        {/* Icon left */}
        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Button content */}
        <span className={clsx({ 'opacity-0': loading && !children })}>
          {children}
        </span>
        
        {/* Icon right */}
        {icon && iconPosition === 'right' && !loading && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Ripple effect overlay */}
        {!prefersReducedMotion && (
          <span
            className={clsx(
              'absolute inset-0 rounded-lg',
              'bg-white opacity-0',
              'transition-opacity duration-200',
              { 'opacity-20': isPressed }
            )}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;