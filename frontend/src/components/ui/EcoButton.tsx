import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EcoButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'gradient';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const EcoButton: React.FC<EcoButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  color = 'green',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  onClick,
  type = 'button'
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-xl gap-2",
    md: "px-4 py-3 text-sm rounded-2xl gap-2",
    lg: "px-6 py-4 text-base rounded-2xl gap-3",
    xl: "px-8 py-5 text-lg rounded-3xl gap-3"
  };

  const colorConfig = {
    green: {
      gradient: 'from-emerald-500 to-green-500',
      solid: 'bg-emerald-500 hover:bg-emerald-600',
      text: 'text-emerald-500',
      ring: 'focus:ring-emerald-500/50',
      shadow: 'shadow-emerald-500/30'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      solid: 'bg-blue-500 hover:bg-blue-600',
      text: 'text-blue-500',
      ring: 'focus:ring-blue-500/50',
      shadow: 'shadow-blue-500/30'
    },
    purple: {
      gradient: 'from-purple-500 to-violet-500',
      solid: 'bg-purple-500 hover:bg-purple-600',
      text: 'text-purple-500',
      ring: 'focus:ring-purple-500/50',
      shadow: 'shadow-purple-500/30'
    },
    orange: {
      gradient: 'from-orange-500 to-yellow-500',
      solid: 'bg-orange-500 hover:bg-orange-600',
      text: 'text-orange-500',
      ring: 'focus:ring-orange-500/50',
      shadow: 'shadow-orange-500/30'
    },
    gradient: {
      gradient: 'from-emerald-500 via-blue-500 to-purple-500',
      solid: 'bg-gradient-to-r from-emerald-500 to-blue-500',
      text: 'text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text',
      ring: 'focus:ring-emerald-500/50',
      shadow: 'shadow-emerald-500/30'
    }
  };

  const config = colorConfig[color];

  const variantClasses = {
    primary: cn(
      "text-white shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1",
      `bg-gradient-to-r ${config.gradient} hover:shadow-2xl`,
      config.ring,
      `hover:${config.shadow}`
    ),
    secondary: cn(
      "eco-button secondary",
      "text-slate-200 hover:text-white",
      config.ring
    ),
    ghost: cn(
      "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20",
      config.ring
    ),
    outline: cn(
      "border-2 bg-transparent hover:bg-white/5",
      `border-${color}-500/50 ${config.text} hover:border-${color}-500`,
      config.ring
    )
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        widthClass,
        disabled && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Shine effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700" />
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex items-center gap-2 relative z-10",
        loading && "opacity-0"
      )}>
        {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
      </div>
    </button>
  );
};

export default EcoButton;