import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 transform-gpu
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    overflow-hidden
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600
      hover:from-blue-600 hover:to-purple-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500
      hover:-translate-y-1 hover:scale-105
    `,
    secondary: `
      glass-premium text-white
      hover:bg-white/20 shadow-lg hover:shadow-xl
      focus:ring-gray-500 border border-white/20 hover:border-white/30
      hover:-translate-y-1
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600
      hover:from-red-600 hover:to-rose-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500
      hover:-translate-y-1 hover:scale-105
    `,
    ghost: `
      bg-transparent hover:bg-white/10
      text-gray-300 hover:text-white
      focus:ring-gray-500
      hover:-translate-y-0.5
    `,
    outline: `
      border-2 border-gray-600 bg-transparent
      hover:bg-gray-600 hover:border-gray-500
      text-gray-300 hover:text-white
      focus:ring-gray-500
      hover:-translate-y-0.5
    `
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };
  
  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick?.(e);
    }
  };
  
  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      {/* Shimmer effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={isLoading ? { x: '100%' } : { x: '-100%' }}
          transition={{
            repeat: isLoading ? Infinity : 0,
            duration: 1.5,
            ease: 'linear'
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.svg 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </motion.svg>
              <span>Loading...</span>
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
};

export default Button;