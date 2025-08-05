import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EcoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'ghost' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const EcoInput = forwardRef<HTMLInputElement, EcoInputProps>(({
  label,
  error,
  helper,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  inputSize = 'md',
  fullWidth = true,
  className,
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base"
  };

  const variantClasses = {
    default: "eco-input",
    ghost: "bg-transparent border-transparent hover:border-white/20 focus:border-emerald-500/50",
    outline: "bg-transparent border-2 border-slate-600 hover:border-slate-500 focus:border-emerald-500"
  };

  const baseInputClasses = cn(
    "transition-all duration-300 focus:outline-none",
    sizeClasses[inputSize],
    variantClasses[variant],
    fullWidth && "w-full",
    Icon && iconPosition === 'left' && "pl-11",
    Icon && iconPosition === 'right' && "pr-11",
    error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
    props.disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-200 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon className={cn(
              "w-5 h-5 transition-colors duration-300",
              error ? "text-red-400" : "text-slate-400",
              "group-focus-within:text-emerald-400"
            )} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={baseInputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon className={cn(
              "w-5 h-5 transition-colors duration-300",
              error ? "text-red-400" : "text-slate-400"
            )} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <span className="w-1 h-1 bg-red-400 rounded-full" />
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
});

EcoInput.displayName = 'EcoInput';

export default EcoInput;