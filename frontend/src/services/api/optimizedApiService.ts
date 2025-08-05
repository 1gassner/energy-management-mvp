import { IApiService, LoginCredentials, RegisterData, AuthResponse, User } from '@/types/api';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  stale?: boolean;
}

interface RequestConfig {
  cache?: boolean;
  cacheTTL?: number; // milliseconds
  retries?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  background?: boolean; // For background requests
}

class OptimizedApiService implements IApiService {
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private requestQueue: Array<{ request: () => Promise<unknown>; priority: number }> = [];
  private isProcessingQueue = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 6;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Periodically clean expired cache entries
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000); // Every 5 minutes
    
    // Monitor network status
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const startTime = performance.now();
    
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, { cache: false, priority: 'high' });
      
      performanceMonitor.trackAPICall('/auth/login', performance.now() - startTime, true);
      return response;
    } catch (error) {
      performanceMonitor.trackAPICall('/auth/login', performance.now() - startTime, false);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const startTime = performance.now();
    
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }, { cache: false, priority: 'high' });
      
      performanceMonitor.trackAPICall('/auth/register', performance.now() - startTime, true);
      return response;
    } catch (error) {
      performanceMonitor.trackAPICall('/auth/register', performance.now() - startTime, false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    }, { cache: false, priority: 'normal' });
    
    // Clear cache on logout
    this.clearCache();
  }

  async refreshUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'GET',
    }, { cache: true, cacheTTL: 5 * 60 * 1000 }); // Cache for 5 minutes
  }

  // Energy data methods with optimized caching
  async getEnergyData(buildingId: string, timeRange: string): Promise<unknown> {
    const cacheKey = `energy-${buildingId}-${timeRange}`;
    const cacheTTL = this.getCacheTTLForTimeRange(timeRange);
    
    return this.request<unknown>(`/energy/${buildingId}?timeRange=${timeRange}`, {
      method: 'GET',
    }, { 
      cache: true, 
      cacheTTL,
      priority: 'normal'
    });
  }

  async getKPIData(buildingId: string): Promise<unknown> {
    return this.request<unknown>(`/kpi/${buildingId}`, {
      method: 'GET',
    }, { 
      cache: true, 
      cacheTTL: 2 * 60 * 1000, // 2 minutes for KPI data
      priority: 'high'
    });
  }

  async getHistoricalData(buildingId: string, startDate: string, endDate: string): Promise<unknown> {
    const cacheKey = `historical-${buildingId}-${startDate}-${endDate}`;
    
    return this.request<unknown>(`/historical/${buildingId}?start=${startDate}&end=${endDate}`, {
      method: 'GET',
    }, { 
      cache: true, 
      cacheTTL: 30 * 60 * 1000, // 30 minutes for historical data
      priority: 'low' // Historical data is less urgent
    });
  }

  // Optimized request method with caching, deduplication, and performance monitoring
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      cache = false,
      cacheTTL = 5 * 60 * 1000, // 5 minutes default
      retries = 3,
      timeout = 10000,
      priority = 'normal',
      background = false
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    if (cache && options.method === 'GET') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        // If stale, fetch in background
        if (cached.stale) {
          this.backgroundRefresh(endpoint, options, config);
        }
        return cached.data;
      }
    }

    // Deduplicate identical requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = this.executeRequest<T>(url, options, {
      ...config,
      retries,
      timeout,
      priority,
      background
    });

    // Store pending request for deduplication
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful GET requests
      if (cache && options.method === 'GET') {
        this.setCache(cacheKey, result, cacheTTL);
      }

      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<T> {
    const { retries = 3, timeout = 10000, priority = 'normal' } = config;

    // Queue management for non-high priority requests
    if (priority !== 'high' && this.concurrentRequests >= this.maxConcurrentRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({
          request: () => this.executeRequest<T>(url, options, config),
          priority: priority === 'low' ? 1 : 2
        });
        
        this.requestQueue.sort((a, b) => b.priority - a.priority);
        
        // Process queue when resources are available
        this.processQueue().then(resolve).catch(reject);
      });
    }

    this.concurrentRequests++;

    try {
      return await this.makeRequest<T>(url, options, timeout, retries);
    } finally {
      this.concurrentRequests--;
      this.processQueue(); // Process any queued requests
    }
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    timeout: number,
    retries: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as unknown as T;
        }
      } catch (error) {
        lastError = error as Error;
        clearTimeout(timeoutId);

        // Don't retry on abort (timeout) or 4xx errors
        if (controller.signal.aborted || (error as any)?.status < 500) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.requestQueue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
        const { request } = this.requestQueue.shift()!;
        request(); // Fire and forget
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Cache management
  private getFromCache<T>(key: string): { data: T; stale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Expired - remove from cache
      this.cache.delete(key);
      return null;
    }

    // Mark as stale if over 70% of TTL
    const stale = age > entry.ttl * 0.7;
    
    return { data: entry.data as T, stale };
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Prevent cache from growing too large
    if (this.cache.size > 100) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      logger.info(`Cleaned ${expiredKeys.length} expired cache entries`);
    }
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Background refresh for stale cache entries
  private backgroundRefresh(endpoint: string, options: RequestInit, config: RequestConfig): void {
    // Use low priority for background refreshes
    this.request(endpoint, options, { ...config, priority: 'low', background: true })
      .catch(error => {
        logger.warn('Background refresh failed:', error);
      });
  }

  // Utility methods
  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${url}:${typeof body === 'string' ? body : JSON.stringify(body)}`;
  }

  private getCacheTTLForTimeRange(timeRange: string): number {
    // Adjust cache TTL based on time range
    switch (timeRange) {
      case 'realtime':
      case '1h':
        return 30 * 1000; // 30 seconds
      case '24h':
        return 5 * 60 * 1000; // 5 minutes
      case '7d':
        return 15 * 60 * 1000; // 15 minutes
      case '30d':
      case '1y':
        return 60 * 60 * 1000; // 1 hour
      default:
        return 5 * 60 * 1000; // 5 minutes default
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private handleNetworkChange(isOnline: boolean): void {
    if (isOnline) {
      // Refresh stale cache entries when back online
      logger.info('Network is back online, refreshing stale cache');
      this.refreshStaleCache();
    } else {
      // Clear pending requests when offline
      logger.info('Network is offline, clearing pending requests');
      this.pendingRequests.clear();
      this.requestQueue.length = 0;
    }
  }

  private refreshStaleCache(): void {
    const staleCacheKeys: string[] = [];
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl * 0.5) { // Refresh if over 50% of TTL
        staleCacheKeys.push(key);
      }
    }

    // Refresh up to 5 stale entries to avoid overwhelming the server
    staleCacheKeys.slice(0, 5).forEach(key => {
      // Parse key to extract endpoint and options
      const [method, url] = key.split(':');
      const endpoint = url.replace(this.baseUrl, '');
      
      this.backgroundRefresh(endpoint, { method }, { cache: true, priority: 'low' });
    });
  }

  // Performance monitoring methods
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
  } {
    // This would need to be implemented with proper counters
    return {
      size: this.cache.size,
      hitRate: 0, // Would calculate from counters
      totalRequests: 0,
      cacheHits: 0
    };
  }

  getNetworkStats(): {
    pendingRequests: number;
    queuedRequests: number;
    concurrentRequests: number;
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      queuedRequests: this.requestQueue.length,
      concurrentRequests: this.concurrentRequests
    };
  }

  // Pre-cache important data
  async preloadCriticalData(): Promise<void> {
    const criticalEndpoints = [
      '/auth/me',
      '/kpi/overview',
      '/energy/realtime'
    ];

    // Preload in parallel with low priority
    const preloadPromises = criticalEndpoints.map(endpoint =>
      this.request(endpoint, { method: 'GET' }, { 
        cache: true, 
        priority: 'low',
        background: true 
      }).catch(() => {
        // Ignore preload failures
      })
    );

    await Promise.allSettled(preloadPromises);
  }
}

export const optimizedApiService = new OptimizedApiService();