import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hechingen' | 'success' | 'warning' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  label,
  error,
  helper,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const inputClasses = clsx(
    // Base glass input styles
    'glass-input glass-focus-ring',
    'transition-all duration-200',
    
    // Sizes
    size === 'sm' && 'px-3 py-2 text-sm',
    size === 'md' && 'px-4 py-2.5 text-base',
    size === 'lg' && 'px-5 py-3 text-lg',
    
    // Variants
    variant === 'hechingen' && 'border-hechingen-blue-400/30 focus:border-hechingen-blue-500/50',
    variant === 'success' && 'border-green-400/30 focus:border-green-500/50',
    variant === 'warning' && 'border-yellow-400/30 focus:border-yellow-500/50',
    variant === 'error' && 'border-red-400/30 focus:border-red-500/50',
    
    // Icon padding adjustments
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    
    // Width
    fullWidth && 'w-full',
    
    // Error state
    error && 'border-red-400/50 focus:border-red-500/60',
    
    className
  );

  const containerClasses = clsx(
    'flex flex-col gap-1',
    fullWidth && 'w-full'
  );

  const wrapperClasses = clsx(
    'relative flex items-center',
    fullWidth && 'w-full'
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="glass-text-primary font-medium text-sm">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className={wrapperClasses}>
        {leftIcon && (
          <div className="absolute left-3 z-10 flex items-center justify-center">
            <span className="glass-text-muted">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 z-10 flex items-center justify-center">
            <span className="glass-text-muted">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <div className="flex flex-col gap-1">
          {error && (
            <span className="text-red-400 text-sm font-medium">
              {error}
            </span>
          )}
          {helper && !error && (
            <span className="glass-text-muted text-sm">
              {helper}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export interface GlassTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hechingen' | 'success' | 'warning' | 'error';
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  resize?: boolean;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  size = 'md',
  variant = 'default',
  label,
  error,
  helper,
  fullWidth = false,
  resize = true,
  className,
  ...props
}, ref) => {
  const textareaClasses = clsx(
    // Base glass textarea styles  
    'glass-input glass-focus-ring',
    'transition-all duration-200',
    'min-h-[100px]',
    
    // Sizes
    size === 'sm' && 'px-3 py-2 text-sm',
    size === 'md' && 'px-4 py-2.5 text-base', 
    size === 'lg' && 'px-5 py-3 text-lg',
    
    // Variants
    variant === 'hechingen' && 'border-hechingen-blue-400/30 focus:border-hechingen-blue-500/50',
    variant === 'success' && 'border-green-400/30 focus:border-green-500/50',
    variant === 'warning' && 'border-yellow-400/30 focus:border-yellow-500/50',
    variant === 'error' && 'border-red-400/30 focus:border-red-500/50',
    
    // Width
    fullWidth && 'w-full',
    
    // Resize
    resize ? 'resize-y' : 'resize-none',
    
    // Error state
    error && 'border-red-400/50 focus:border-red-500/60',
    
    className
  );

  const containerClasses = clsx(
    'flex flex-col gap-1',
    fullWidth && 'w-full'
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="glass-text-primary font-medium text-sm">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helper) && (
        <div className="flex flex-col gap-1">
          {error && (
            <span className="text-red-400 text-sm font-medium">
              {error}
            </span>
          )}
          {helper && !error && (
            <span className="glass-text-muted text-sm">
              {helper}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export interface GlassSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hechingen' | 'success' | 'warning' | 'error';
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(({
  size = 'md',
  variant = 'default',
  label,
  error,
  helper,
  fullWidth = false,
  options = [],
  placeholder,
  children,
  className,
  ...props
}, ref) => {
  const selectClasses = clsx(
    // Base glass select styles
    'glass-select glass-focus-ring',
    'transition-all duration-200',
    'appearance-none bg-right bg-no-repeat',
    'cursor-pointer',
    
    // Sizes
    size === 'sm' && 'px-3 py-2 text-sm',
    size === 'md' && 'px-4 py-2.5 text-base',
    size === 'lg' && 'px-5 py-3 text-lg',
    
    // Variants
    variant === 'hechingen' && 'border-hechingen-blue-400/30 focus:border-hechingen-blue-500/50',
    variant === 'success' && 'border-green-400/30 focus:border-green-500/50',
    variant === 'warning' && 'border-yellow-400/30 focus:border-yellow-500/50',
    variant === 'error' && 'border-red-400/30 focus:border-red-500/50',
    
    // Width
    fullWidth && 'w-full',
    
    // Error state
    error && 'border-red-400/50 focus:border-red-500/60',
    
    className
  );

  const containerClasses = clsx(
    'flex flex-col gap-1',
    fullWidth && 'w-full'
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="glass-text-primary font-medium text-sm">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
              className="bg-slate-800 text-white"
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(error || helper) && (
        <div className="flex flex-col gap-1">
          {error && (
            <span className="text-red-400 text-sm font-medium">
              {error}
            </span>
          )}
          {helper && !error && (
            <span className="glass-text-muted text-sm">
              {helper}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';