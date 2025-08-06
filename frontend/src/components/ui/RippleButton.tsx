import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rippleColor?: string;
  glowEffect?: boolean;
  floating?: boolean;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  rippleColor,
  glowEffect = false,
  floating = false,
  onClick,
  disabled,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: RippleEffect = {
      id: rippleIdRef.current++,
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      createRipple(event);
      onClick?.(event);
    }
  }, [disabled, loading, onClick, createRipple]);

  // Variant styles
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 
      hover:from-blue-600 hover:to-blue-700
      text-white border-transparent
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-gradient-to-r from-gray-500 to-gray-600
      hover:from-gray-600 hover:to-gray-700  
      text-white border-transparent
      shadow-lg hover:shadow-xl
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-600
      hover:from-green-600 hover:to-emerald-700
      text-white border-transparent
      shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600
      hover:from-red-600 hover:to-rose-700
      text-white border-transparent
      shadow-lg hover:shadow-xl
    `,
    ghost: `
      bg-transparent hover:bg-gray-100
      text-gray-700 hover:text-gray-900
      border border-gray-300 hover:border-gray-400
    `,
    glass: `
      glass-premium text-white
      border border-white/20 hover:border-white/30
      shadow-xl hover:shadow-2xl
    `,
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]',
    xl: 'px-10 py-5 text-xl min-h-[52px]',
  };

  // Glow effect classes
  const glowClasses = {
    primary: 'hover:shadow-blue-500/25',
    secondary: 'hover:shadow-gray-500/25',
    success: 'hover:shadow-green-500/25',
    danger: 'hover:shadow-red-500/25',
    ghost: '',
    glass: 'hover:shadow-white/25',
  };

  // Default ripple colors
  const defaultRippleColors = {
    primary: 'rgba(255, 255, 255, 0.6)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    success: 'rgba(255, 255, 255, 0.6)',
    danger: 'rgba(255, 255, 255, 0.6)',
    ghost: 'rgba(0, 0, 0, 0.1)',
    glass: 'rgba(255, 255, 255, 0.3)',
  };

  const currentRippleColor = rippleColor || defaultRippleColors[variant];

  return (
    <motion.button
      ref={buttonRef}
      className={clsx(
        // Base styles
        'relative overflow-hidden rounded-lg font-semibold',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transform-gpu backface-visibility-hidden',
        
        // Variant styles
        variantClasses[variant],
        sizeClasses[size],
        
        // Glow effect
        glowEffect && glowClasses[variant],
        glowEffect && 'hover:shadow-2xl',
        
        // Floating effect
        floating && 'hover:-translate-y-1',
        
        className
      )}
      initial={floating ? { y: 0 } : undefined}
      whileHover={floating ? { y: -2 } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Background gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
        initial={{ x: '-100%' }}
        animate={{ x: loading ? '100%' : '-100%' }}
        transition={{ 
          repeat: loading ? Infinity : 0,
          duration: 1.5,
          ease: 'linear'
        }}
      />

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: currentRippleColor,
              width: 0,
              height: 0,
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ 
              width: 200, 
              height: 200, 
              opacity: 0,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content container */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {/* Loading spinner */}
        {loading && (
          <motion.svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
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
          </motion.svg>
        )}

        {/* Left icon */}
        {icon && iconPosition === 'left' && !loading && (
          <motion.span 
            className="flex-shrink-0"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Button text */}
        <motion.span
          className={clsx(loading && 'opacity-70')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.span>

        {/* Right icon */}
        {icon && iconPosition === 'right' && !loading && (
          <motion.span 
            className="flex-shrink-0"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ 
          x: '100%', 
          opacity: 1,
          transition: { duration: 0.6, ease: 'easeInOut' }
        }}
      />

      {/* Focus ring */}
      <motion.div
        className={clsx(
          'absolute inset-0 rounded-lg ring-2 ring-offset-2 opacity-0',
          variant === 'primary' && 'ring-blue-500',
          variant === 'secondary' && 'ring-gray-500',
          variant === 'success' && 'ring-green-500',
          variant === 'danger' && 'ring-red-500',
          variant === 'ghost' && 'ring-gray-500',
          variant === 'glass' && 'ring-white/50'
        )}
        whileFocus={{ opacity: 1 }}
      />
    </motion.button>
  );
};

export default RippleButton;