// Advanced request caching and deduplication system
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  promise?: Promise<T>;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
  maxAge?: number; // Maximum age before forcing refresh
  dedupe?: boolean; // Deduplicate concurrent requests
}

class RequestCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private maxCacheSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Generate cache key from URL and options
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    const headers = options?.headers ? JSON.stringify(options.headers) : '';
    return `${method}:${url}:${body}:${headers}`;
  }

  // Clean expired entries
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt < now) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.cache.delete(key));
    
    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Check if entry is stale
  private isStale(entry: CacheEntry, maxAge?: number): boolean {
    const age = Date.now() - entry.timestamp;
    return maxAge ? age > maxAge : false;
  }

  // Cached fetch with advanced options
  async fetch<T = any>(
    url: string, 
    options: RequestInit & CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.defaultTTL,
      staleWhileRevalidate = true,
      maxAge,
      dedupe = true,
      ...fetchOptions
    } = options;

    const key = this.generateKey(url, fetchOptions);
    const now = Date.now();

    // Clean up expired entries
    this.cleanup();

    // Check for existing cache entry
    const cached = this.cache.get(key);
    
    if (cached) {
      const isExpired = cached.expiresAt < now;
      const isStaleData = this.isStale(cached, maxAge);
      
      if (!isExpired && !isStaleData) {
        // Fresh data, return immediately
        return cached.data;
      }
      
      if (staleWhileRevalidate && !isExpired) {
        // Return stale data but trigger background refresh
        this.backgroundRefresh(url, fetchOptions, key, ttl);
        return cached.data;
      }
    }

    // Check for pending request deduplication
    if (dedupe && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Make new request
    const requestPromise = this.makeRequest<T>(url, fetchOptions)
      .then(data => {
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: now,
          expiresAt: now + ttl
        });
        
        // Remove from pending requests
        this.pendingRequests.delete(key);
        
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        
        // If we have stale data, return it instead of throwing
        if (cached && staleWhileRevalidate) {
          console.warn('Request failed, returning stale data:', error);
          return cached.data;
        }
        
        throw error;
      });

    // Store pending request for deduplication
    if (dedupe) {
      this.pendingRequests.set(key, requestPromise);
    }

    return requestPromise;
  }

  // Background refresh without blocking
  private async backgroundRefresh(
    url: string, 
    options: RequestInit, 
    cacheKey: string, 
    ttl: number
  ): Promise<void> {
    try {
      const data = await this.makeRequest(url, options);
      const now = Date.now();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: now,
        expiresAt: now + ttl
      });
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }

  // Actual HTTP request
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Manual cache management
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.pendingRequests.clear();
      return;
    }

    const regex = new RegExp(pattern);
    const toDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });
  }

  // Prefetch data
  async prefetch(url: string, options?: RequestInit & CacheOptions): Promise<void> {
    try {
      await this.fetch(url, options);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let size = 0;
    this.cache.forEach((entry, key) => {
      size += key.length * 2; // Rough string size estimation
      size += JSON.stringify(entry.data).length * 2;
    });
    return size;
  }
}

// Singleton instance
export const requestCache = new RequestCache();

// Hook for React components
export const useRequestCache = () => {
  const cachedFetch = async <T = any>(
    url: string, 
    options?: RequestInit & CacheOptions
  ): Promise<T> => {
    return requestCache.fetch<T>(url, options);
  };

  return {
    fetch: cachedFetch,
    invalidate: (pattern?: string) => requestCache.invalidate(pattern),
    prefetch: (url: string, options?: RequestInit & CacheOptions) => 
      requestCache.prefetch(url, options),
    stats: () => requestCache.getStats()
  };
};

// Utility functions
export const prefetchCriticalData = async () => {
  const criticalEndpoints = [
    '/api/energy/current',
    '/api/buildings/status',
    '/api/alerts/active'
  ];

  await Promise.allSettled(
    criticalEndpoints.map(endpoint => 
      requestCache.prefetch(endpoint, { ttl: 30000 }) // 30 seconds
    )
  );
};

export default requestCache;