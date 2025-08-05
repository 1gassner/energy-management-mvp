import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedApiService, LoadingState, ApiError, NetworkError, TimeoutError, RateLimitError } from '@/services/api/enhancedApiService';
import { logger } from '@/utils/logger';

// Base API Hook Interface
interface UseApiOptions<T> {
  immediate?: boolean;
  dependencies?: unknown[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  suppressErrorToast?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

// Generic API Hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const executeCountRef = useRef(0);

  const {
    immediate = false,
    dependencies = [],
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async (): Promise<T | null> => {
    const currentExecuteCount = ++executeCountRef.current;
    
    if (!mountedRef.current) return null;
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      // Check if this is still the latest request
      if (currentExecuteCount === executeCountRef.current && mountedRef.current) {
        setData(result);
        onSuccess?.(result);
        return result;
      }
      
      return null;
    } catch (err) {
      const error = err as Error;
      
      if (currentExecuteCount === executeCountRef.current && mountedRef.current) {
        setError(error);
        onError?.(error);
        logger.error('API call failed:', error);
      }
      
      return null;
    } finally {
      if (currentExecuteCount === executeCountRef.current && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    executeCountRef.current = 0;
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refetch
  };
}

// Loading State Hook
export function useApiLoadingState() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingRequests: new Set()
  });

  useEffect(() => {
    const unsubscribe = enhancedApiService.onLoadingStateChange(setLoadingState);
    
    // Get initial state
    setLoadingState(enhancedApiService.getLoadingState());
    
    return unsubscribe;
  }, []);

  return loadingState;
}

// Specific API Hooks

// Energy Data Hook
export function useEnergyData(buildingId: string, timeRange: string, options: UseApiOptions<unknown> = {}) {
  return useApi(
    () => enhancedApiService.getEnergyData(buildingId, timeRange),
    {
      immediate: true,
      dependencies: [buildingId, timeRange],
      cache: true,
      ...options
    }
  );
}

// KPI Data Hook
export function useKPIData(buildingId: string, options: UseApiOptions<unknown> = {}) {
  return useApi(
    () => enhancedApiService.getKPIData(buildingId),
    {
      immediate: true,
      dependencies: [buildingId],
      cache: true,
      priority: 'high',
      ...options
    }
  );
}

// Historical Data Hook
export function useHistoricalData(
  buildingId: string, 
  startDate: string, 
  endDate: string, 
  options: UseApiOptions<unknown> = {}
) {
  return useApi(
    () => enhancedApiService.getHistoricalData(buildingId, startDate, endDate),
    {
      immediate: true,
      dependencies: [buildingId, startDate, endDate],
      cache: true,
      priority: 'low',
      ...options
    }
  );
}

// User Data Hook
export function useUserData(options: UseApiOptions<unknown> = {}) {
  return useApi(
    () => enhancedApiService.refreshUser(),
    {
      immediate: true,
      cache: true,
      priority: 'high',
      suppressErrorToast: true, // Don't show toast for auth failures
      ...options
    }
  );
}

// Mutation Hook for POST/PUT/DELETE operations
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => void;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  suppressErrorToast?: boolean;
}

interface UseMutationResult<TData, TVariables> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  mutate: (variables: TVariables) => Promise<TData | null>;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const { onSuccess, onError, onMutate } = options;

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    if (!mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    onMutate?.(variables);

    try {
      const result = await mutationFn(variables);
      
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result, variables);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      
      if (mountedRef.current) {
        setError(error);
        onError?.(error, variables);
        logger.error('Mutation failed:', error);
      }
      
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [mutationFn, onSuccess, onError, onMutate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
}

// Optimistic Updates Hook
interface UseOptimisticOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, rollback: () => void) => void;
  getOptimisticData: (variables: TVariables, currentData: TData | null) => TData;
}

export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOptimisticOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<TData | null>(null);
  const mountedRef = useRef(true);

  const { onSuccess, onError, getOptimisticData } = options;

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    if (!mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    // Store current data for rollback
    previousDataRef.current = data;
    
    // Apply optimistic update
    const optimisticData = getOptimisticData(variables, data);
    setData(optimisticData);

    const rollback = () => {
      if (mountedRef.current) {
        setData(previousDataRef.current);
      }
    };

    try {
      const result = await mutationFn(variables);
      
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result, variables);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      
      if (mountedRef.current) {
        rollback();
        setError(error);
        onError?.(error, variables, rollback);
        logger.error('Optimistic mutation failed:', error);
      }
      
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [data, mutationFn, onSuccess, onError, getOptimisticData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    previousDataRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
}

// Error handling utilities
export function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
      case 403:
        return 'Zugriff verweigert. Sie haben nicht die erforderlichen Berechtigungen.';
      case 404:
        return 'Die angeforderte Ressource wurde nicht gefunden.';
      case 429:
        return 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
      case 500:
        return 'Serverfehler. Das Problem wird behoben.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof NetworkError) {
    return 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.';
  }
  
  if (error instanceof TimeoutError) {
    return 'Anfrage-Timeout. Bitte versuchen Sie es erneut.';
  }
  
  if (error instanceof RateLimitError) {
    return error.message;
  }
  
  return error.message || 'Ein unbekannter Fehler ist aufgetreten';
}

export function isRetryableError(error: Error): boolean {
  if (error instanceof ApiError) {
    // Retry on server errors but not client errors
    return error.status >= 500;
  }
  
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  
  return false;
}

// Export all error types for convenience
export { ApiError, NetworkError, TimeoutError, RateLimitError };