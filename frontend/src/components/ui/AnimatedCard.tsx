import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'premium' | 'energy' | 'cyber';
  animation?: 'slide' | 'scale' | 'fade' | 'bounce' | 'float';
  delay?: number;
  duration?: number;
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  variant = 'default',
  animation = 'slide',
  delay = 0,
  duration = 0.6,
  hover = true,
  tilt = false,
  glow = false,
  onClick,
  loading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring animations for smooth tilt
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), {
    stiffness: 400,
    damping: 30
  });

  // Handle mouse move for tilt effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((event.clientX - centerX) / 2);
    y.set((event.clientY - centerY) / 2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tilt) {
      x.set(0);
      y.set(0);
    }
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white shadow-lg border border-gray-200',
    glass: 'glass-card-modern shadow-2xl',
    premium: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl border border-gray-200',
    energy: 'bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 shadow-lg border border-green-200',
    cyber: 'bg-gradient-cyber shadow-2xl border border-purple-500/20',
  };

  // Animation variants
  const animationVariants = {
    slide: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    bounce: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { 
        opacity: 1, 
        scale: [0.3, 1.1, 1],
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      },
      exit: { opacity: 0, scale: 0.8 }
    },
    float: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: [20, 0, -5, 0],
        transition: {
          duration: duration,
          times: [0, 0.5, 0.8, 1]
        }
      },
      exit: { opacity: 0, y: 20 }
    }
  };

  // Hover variants
  const hoverVariants = hover ? {
    rest: { 
      scale: 1,
      y: 0,
      boxShadow: variant === 'glass' 
        ? "0 8px 32px rgba(31, 38, 135, 0.37)"
        : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
    },
    hover: { 
      scale: 1.03,
      y: -8,
      boxShadow: variant === 'glass'
        ? "0 20px 40px rgba(31, 38, 135, 0.5)"
        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className={clsx(
        'relative rounded-xl overflow-hidden cursor-pointer',
        variantClasses[variant],
        glow && 'animate-glow-pulse',
        onClick && 'cursor-pointer',
        className
      )}
      variants={animationVariants[animation]}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={hover ? "hover" : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={tilt ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      } : undefined}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      {...hoverVariants}
    >
      {/* Gradient overlay for premium effect */}
      {variant === 'premium' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <div 
          className={clsx(
            'absolute -inset-0.5 rounded-xl opacity-30 blur-lg',
            variant === 'energy' && 'bg-gradient-to-r from-green-400 to-blue-500',
            variant === 'cyber' && 'bg-gradient-to-r from-purple-400 to-pink-500',
            variant === 'premium' && 'bg-gradient-to-r from-blue-400 to-purple-500',
            variant === 'default' && 'bg-gradient-to-r from-gray-400 to-gray-600'
          )}
        />
      )}

      {/* Shimmer effect for loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            exit={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear"
            }}
          />
        )}
      </AnimatePresence>

      {/* Ripple effect on click */}
      {onClick && isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Interactive highlight */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default AnimatedCard;