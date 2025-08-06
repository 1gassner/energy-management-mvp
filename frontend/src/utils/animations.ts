import { Variants } from 'framer-motion';

// Common easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeSharp: [0.4, 0, 0.6, 1],
  easeBack: [0.18, 0.89, 0.32, 1.28],
  easeElastic: [0.68, -0.55, 0.265, 1.55],
  easeBounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// Animation durations
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
  slowest: 1,
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: durations.instant,
      ease: easings.easeOut,
    },
  },
};

// Button variants
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: durations.instant,
      ease: easings.easeOut,
    },
  },
};

// Modal variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: durations.normal,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Backdrop variants
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

// Slide variants
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: durations.normal },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: durations.fast },
    },
  }),
};

// Fade variants
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Scale variants
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      duration: durations.normal,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Bounce variants
export const bounceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: [0, 1.2, 1],
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
      duration: durations.slow,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

// Staggered container variants
export const staggeredContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Staggered item variants
export const staggeredItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

// Loading variants
export const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Pulse variants
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Float variants
export const floatVariants: Variants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Shake variants
export const shakeVariants: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.6,
      ease: easings.easeOut,
    },
  },
};

// Success variants
export const successVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: 0.2,
        type: 'tween',
        duration: 0.6,
        ease: easings.easeOut,
      },
      opacity: {
        delay: 0.2,
        duration: 0.2,
      },
    },
  },
};

// Error variants
export const errorVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
      duration: 0.6,
    },
  },
};

// Utility functions
export const createStaggeredAnimation = (
  children: number,
  staggerDelay: number = 0.1,
  childDelay: number = 0
) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childDelay,
    },
  },
});

export const createSlideAnimation = (
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 50
) => {
  const directions = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  };
};

export const createScaleAnimation = (
  initialScale: number = 0.8,
  springConfig?: { stiffness: number; damping: number }
) => ({
  hidden: {
    opacity: 0,
    scale: initialScale,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: springConfig?.stiffness ?? 400,
      damping: springConfig?.damping ?? 25,
    },
  },
});

export const createRotateAnimation = (
  initialRotation: number = -180,
  finalRotation: number = 0
) => ({
  hidden: {
    opacity: 0,
    rotate: initialRotation,
  },
  visible: {
    opacity: 1,
    rotate: finalRotation,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
});

// Responsive animation variants
export const getResponsiveVariants = (isMobile: boolean) => ({
  hover: isMobile ? {} : cardHoverVariants.hover,
  tap: cardHoverVariants.tap,
});

// Presets for common animations
export const animationPresets = {
  // Entrance animations
  slideUp: createSlideAnimation('up'),
  slideDown: createSlideAnimation('down'),
  slideLeft: createSlideAnimation('left'),
  slideRight: createSlideAnimation('right'),
  
  // Scale animations
  scaleIn: createScaleAnimation(),
  scaleInSmall: createScaleAnimation(0.95),
  scaleInLarge: createScaleAnimation(0.5),
  
  // Rotate animations
  rotateIn: createRotateAnimation(),
  rotateInQuarter: createRotateAnimation(-90),
  
  // Combined animations
  slideScaleUp: {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  },
  
  slideRotateIn: {
    hidden: {
      opacity: 0,
      x: -50,
      rotate: -45,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  },
};

export default {
  easings,
  durations,
  pageVariants,
  cardHoverVariants,
  buttonVariants,
  modalVariants,
  backdropVariants,
  slideVariants,
  fadeVariants,
  scaleVariants,
  bounceVariants,
  staggeredContainer,
  staggeredItem,
  loadingVariants,
  pulseVariants,
  floatVariants,
  shakeVariants,
  successVariants,
  errorVariants,
  animationPresets,
  createStaggeredAnimation,
  createSlideAnimation,
  createScaleAnimation,
  createRotateAnimation,
  getResponsiveVariants,
};