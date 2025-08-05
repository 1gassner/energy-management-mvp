import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing timers with automatic cleanup
 * Prevents memory leaks from setInterval/setTimeout
 */
export const useTimerCleanup = () => {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setIntervalSafe = (callback: () => void, delay: number) => {
    const timer = setInterval(callback, delay);
    timersRef.current.add(timer);
    return timer;
  };

  const setTimeoutSafe = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timersRef.current.add(timer);
    return timer;
  };

  const clearTimer = (timer: NodeJS.Timeout) => {
    clearInterval(timer);
    clearTimeout(timer);
    timersRef.current.delete(timer);
  };

  const clearAllTimers = () => {
    timersRef.current.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    timersRef.current.clear();
  };

  // Automatic cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return {
    setIntervalSafe,
    setTimeoutSafe,
    clearTimer,
    clearAllTimers
  };
};