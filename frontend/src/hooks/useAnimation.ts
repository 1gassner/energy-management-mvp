import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpring, useTransform, useMotionValue, SpringOptions } from 'framer-motion';

// Hook for intersection observer animations
export const useInViewAnimation = (
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isInView };
};

// Hook for mouse position tracking
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

// Hook for parallax scrolling effects
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      setOffset(window.pageYOffset * speed);
    };

    const handleScroll = () => {
      requestAnimationFrame(updateOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
};

// Hook for card tilt effect
export const useCardTilt = (maxTilt: number = 10) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(y, [-100, 100], [maxTilt, -maxTilt]),
    { stiffness: 400, damping: 30 }
  );

  const rotateY = useSpring(
    useTransform(x, [-100, 100], [-maxTilt, maxTilt]),
    { stiffness: 400, damping: 30 }
  );

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((event.clientX - centerX) / 2);
    y.set((event.clientY - centerY) / 2);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
  };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

// Hook for typing animation
export const useTypewriter = (
  text: string,
  speed: number = 50,
  delay: number = 0
) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, index + 1));
        index++;

        if (index >= text.length) {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

// Hook for staggered animations
export const useStaggeredAnimation = (
  count: number,
  delay: number = 0.1,
  duration: number = 0.5
) => {
  const [triggered, setTriggered] = useState(false);

  const getDelay = useCallback((index: number) => {
    return triggered ? index * delay : 0;
  }, [triggered, delay]);

  const trigger = useCallback(() => {
    setTriggered(true);
  }, []);

  const reset = useCallback(() => {
    setTriggered(false);
  }, []);

  return {
    triggered,
    getDelay,
    trigger,
    reset,
    duration,
  };
};

// Hook for bounce animation
export const useBounceAnimation = (
  trigger: boolean,
  intensity: number = 1.2,
  duration: number = 0.6
) => {
  const scale = useSpring(1, {
    stiffness: 300,
    damping: 10,
  });

  useEffect(() => {
    if (trigger) {
      scale.set(intensity);
      setTimeout(() => scale.set(1), duration * 1000);
    }
  }, [trigger, intensity, duration, scale]);

  return scale;
};

// Hook for shake animation
export const useShakeAnimation = (trigger: boolean) => {
  const x = useMotionValue(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger && !isShaking) {
      setIsShaking(true);
      const shakeSequence = [0, -10, 10, -10, 10, -5, 5, 0];
      let index = 0;

      const interval = setInterval(() => {
        x.set(shakeSequence[index]);
        index++;

        if (index >= shakeSequence.length) {
          clearInterval(interval);
          setIsShaking(false);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [trigger, isShaking, x]);

  return { x, isShaking };
};

// Hook for loading animation
export const useLoadingAnimation = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return dots;
};

// Hook for counter animation
export const useCounterAnimation = (
  target: number,
  duration: number = 2000,
  start: boolean = true
) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!start) return;

    const startTime = Date.now();
    const startValue = current;
    const difference = target - startValue;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.round(startValue + difference * easeOut);
      
      setCurrent(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [target, duration, start]);

  return current;
};

// Hook for reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for animated presence with cleanup
export const useAnimatedPresence = <T>(
  items: T[],
  keyExtractor: (item: T) => string | number,
  exitDuration: number = 300
) => {
  const [animatedItems, setAnimatedItems] = useState<T[]>(items);
  const [exitingItems, setExitingItems] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    const newKeys = new Set(items.map(keyExtractor));
    const currentKeys = new Set(animatedItems.map(keyExtractor));
    
    // Find items that are exiting
    const exiting = new Set<string | number>();
    currentKeys.forEach(key => {
      if (!newKeys.has(key)) {
        exiting.add(key);
      }
    });

    if (exiting.size > 0) {
      setExitingItems(exiting);
      
      setTimeout(() => {
        setAnimatedItems(items);
        setExitingItems(new Set());
      }, exitDuration);
    } else {
      setAnimatedItems(items);
    }
  }, [items, keyExtractor, exitDuration]);

  return {
    animatedItems,
    exitingItems,
    isExiting: (item: T) => exitingItems.has(keyExtractor(item)),
  };
};

// Hook for spring-based toggle
export const useSpringToggle = (
  initialValue: boolean = false,
  config?: SpringOptions
) => {
  const [isToggled, setIsToggled] = useState(initialValue);
  const springValue = useSpring(isToggled ? 1 : 0, config);

  const toggle = useCallback(() => {
    setIsToggled(prev => !prev);
  }, []);

  const setToggle = useCallback((value: boolean) => {
    setIsToggled(value);
  }, []);

  return {
    isToggled,
    springValue,
    toggle,
    setToggle,
  };
};

export default {
  useInViewAnimation,
  useMousePosition,
  useParallax,
  useCardTilt,
  useScrollAnimation,
  useTypewriter,
  useStaggeredAnimation,
  useBounceAnimation,
  useShakeAnimation,
  useLoadingAnimation,
  useCounterAnimation,
  useReducedMotion,
  useAnimatedPresence,
  useSpringToggle,
};