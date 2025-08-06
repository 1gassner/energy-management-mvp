import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'slide' | 'fade' | 'scale' | 'rotate' | 'curtain' | 'blur';
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  stagger?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'slide',
  duration = 0.5,
  direction = 'right',
  stagger = 0.1,
}) => {
  const location = useLocation();

  // Animation variants for different modes
  const variants = {
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
        y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
      },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration,
          staggerChildren: stagger,
          delayChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
        y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: duration * 0.8
        }
      }
    },

    fade: {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
        transition: {
          duration,
          staggerChildren: stagger,
          delayChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        transition: {
          duration: duration * 0.8
        }
      }
    },

    scale: {
      initial: {
        opacity: 0,
        scale: 0.8,
      },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration,
          staggerChildren: stagger,
          delayChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        scale: 1.2,
        transition: {
          duration: duration * 0.6
        }
      }
    },

    rotate: {
      initial: {
        opacity: 0,
        rotateY: -90,
        transformPerspective: 1200,
      },
      animate: {
        opacity: 1,
        rotateY: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration,
          staggerChildren: stagger,
          delayChildren: 0.2
        }
      },
      exit: {
        opacity: 0,
        rotateY: 90,
        transition: {
          duration: duration * 0.8
        }
      }
    },

    curtain: {
      initial: {
        clipPath: 'inset(0 100% 0 0)',
      },
      animate: {
        clipPath: 'inset(0 0% 0 0)',
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: stagger,
          delayChildren: 0.2
        }
      },
      exit: {
        clipPath: 'inset(0 0 0 100%)',
        transition: {
          duration: duration * 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },

    blur: {
      initial: {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 1.05,
      },
      animate: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: stagger,
          delayChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 0.95,
        transition: {
          duration: duration * 0.6
        }
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants[mode]}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Child component for staggered animations
export const PageTransitionChild: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const childVariants = {
    initial: { 
      opacity: 0, 
      y: 20 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      variants={childVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Route transition wrapper
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Modal transition wrapper
export const ModalTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}> = ({ children, isOpen, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Modal content */}
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.3
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Toast notification transition
export const ToastTransition: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  position?: 'top' | 'bottom';
}> = ({ children, isVisible, position = 'top' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: position === 'top' ? -50 : 50,
            scale: 0.8
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: position === 'top' ? -50 : 50,
            scale: 0.8
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading transition
export const LoadingTransition: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ isLoading, children, fallback }) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {fallback || (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition;