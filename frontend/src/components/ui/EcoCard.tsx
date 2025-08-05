import React from 'react';
import { cn } from '@/lib/utils';

interface EcoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: 'green' | 'blue' | 'purple' | 'orange' | 'none';
  onClick?: () => void;
}

const EcoCard: React.FC<EcoCardProps> = ({
  children,
  className,
  variant = 'glass',
  size = 'md',
  hover = true,
  glow = 'none',
  onClick
}) => {
  const baseClasses = "transition-all duration-300 overflow-hidden";
  
  const variantClasses = {
    glass: "eco-card",
    solid: "eco-card-solid",
    gradient: "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-2xl border border-white/10"
  };
  
  const sizeClasses = {
    sm: "p-4 rounded-xl",
    md: "p-6 rounded-2xl",
    lg: "p-8 rounded-3xl"
  };
  
  const hoverClasses = hover ? "hover:transform hover:scale-105 cursor-pointer" : "";
  
  const glowClasses = {
    green: "hover:shadow-emerald-500/20 hover:shadow-2xl",
    blue: "hover:shadow-blue-500/20 hover:shadow-2xl",
    purple: "hover:shadow-purple-500/20 hover:shadow-2xl",
    orange: "hover:shadow-orange-500/20 hover:shadow-2xl",
    none: ""
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        hover && hoverClasses,
        glow !== 'none' && glowClasses[glow],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default EcoCard;