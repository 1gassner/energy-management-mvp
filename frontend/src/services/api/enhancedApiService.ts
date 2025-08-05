import { IAPIService, LoginCredentials, RegisterData, User } from '@/types/api';
import type { EnergyData, Building, Sensor, Alert, AnalyticsData } from '@/types';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performanceMonitor';
import toast from 'react-hot-toast';

// Enhanced Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Netzwerkfehler aufgetreten') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Anfrage-Timeout erreicht') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate Limit erreicht, bitte warten Sie') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Cache Entry Interface
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  stale?: boolean;
  etag?: string;
}

// Request Configuration
interface RequestConfig {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  background?: boolean;
  suppressErrorToast?: boolean;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
  signal?: AbortSignal;
}

// Loading State Management
interface LoadingState {
  isLoading: boolean;
  loadingRequests: Set<string>;
  progress?: number;
}

// Request Queue Item
interface QueuedRequest {
  id: string;
  execute: () => Promise<unknown>;
  priority: number;
  timestamp: number;
  timeout: number;
  retries: number;
  config: RequestConfig;
}

interface AuthResponse {
  user: User;
  token: string;
}

class EnhancedApiService implements IAPIService {
  private baseUrl: string;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private requestQueue: QueuedRequest[] = [];
  private loadingState: LoadingState = {
    isLoading: false,
    loadingRequests: new Set()
  };
  
  // Configuration
  private readonly maxConcurrentRequests = 8;
  private readonly maxRetries = 3;
  private readonly defaultTimeout = 15000;
  private readonly retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff
  private readonly maxCacheSize = 200;
  private readonly staleThreshold = 0.7; // 70% of TTL
  
  // State tracking
  private concurrentRequests = 0;
  private isProcessingQueue = false;
  private networkStatus: 'online' | 'offline' = 'online';
  private rateLimitResetTime = 0;
  
  // Event listeners for loading state
  private loadingStateListeners = new Set<(state: LoadingState) => void>();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
    
    // Clean cache periodically
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
    
    // Process queue periodically
    setInterval(() => this.processRequestQueue(), 100);
  }

  // Public Loading State API
  public onLoadingStateChange(listener: (state: LoadingState) => void): () => void {
    this.loadingStateListeners.add(listener);
    return () => this.loadingStateListeners.delete(listener);
  }

  public getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  // Authentication Methods with Enhanced Error Handling
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, {
      priority: 'critical',
      cache: false,
      timeout: 20000,
      retries: 2,
      suppressErrorToast: false
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, {
      priority: 'critical',
      cache: false,
      timeout: 20000,
      retries: 2,
      suppressErrorToast: false
    });
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    }, {
      priority: 'high',
      cache: false,
      timeout: 10000,
      retries: 1,
      suppressErrorToast: true
    });

    // Clear all caches and pending requests on logout
    this.clearAllCaches();
  }

  async refreshUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      priority: 'high',
      timeout: 10000
    });
  }

  // Energy Data Methods
  async getEnergyData(buildingId: string, timeRange: string): Promise<unknown> {
    return this.request<unknown>(`/energy/${buildingId}?timeRange=${timeRange}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: this.getCacheTTLForTimeRange(timeRange),
      priority: 'normal',
      timeout: 15000
    });
  }

  async getKPIData(buildingId: string): Promise<unknown> {
    return this.request<unknown>(`/kpi/${buildingId}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 2 * 60 * 1000,
      priority: 'high',
      timeout: 10000
    });
  }

  async getHistoricalData(buildingId: string, startDate: string, endDate: string): Promise<unknown> {
    return this.request<unknown>(`/historical/${buildingId}?start=${startDate}&end=${endDate}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 30 * 60 * 1000,
      priority: 'low',
      timeout: 30000
    });
  }

  // Additional required IAPIService methods
  async getLatestEnergyData(buildingId: string): Promise<EnergyData> {
    return this.request<EnergyData>(`/energy/latest/${buildingId}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 30 * 1000, // 30 seconds for latest data
      priority: 'high'
    });
  }

  async getBuildings(): Promise<Building[]> {
    return this.request<Building[]>('/buildings', {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      priority: 'normal'
    });
  }

  async getBuilding(id: string): Promise<Building> {
    return this.request<Building>(`/buildings/${id}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      priority: 'normal'
    });
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    return this.request<Building>(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, {
      cache: false,
      priority: 'high'
    });
  }

  async getSensors(buildingId?: string): Promise<Sensor[]> {
    const query = buildingId ? `?buildingId=${buildingId}` : '';
    return this.request<Sensor[]>(`/sensors${query}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 2 * 60 * 1000,
      priority: 'normal'
    });
  }

  async getSensor(id: string): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 1 * 60 * 1000,
      priority: 'normal'
    });
  }

  async updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, {
      cache: false,
      priority: 'high'
    });
  }

  async getAlerts(buildingId?: string): Promise<Alert[]> {
    const query = buildingId ? `?buildingId=${buildingId}` : '';
    return this.request<Alert[]>(`/alerts${query}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 30 * 1000, // 30 seconds for alerts
      priority: 'high'
    });
  }

  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 1 * 60 * 1000,
      priority: 'high'
    });
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/read`, {
      method: 'PATCH',
    }, {
      cache: false,
      priority: 'high'
    });
  }

  async resolveAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/resolve`, {
      method: 'PATCH',
    }, {
      cache: false,
      priority: 'high'
    });
  }

  async getAnalytics(period: 'day' | 'week' | 'month' | 'year', buildingId?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams({ period });
    if (buildingId) params.append('buildingId', buildingId);
    
    return this.request<AnalyticsData>(`/analytics?${params.toString()}`, {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: this.getAnalyticsCacheTTL(period),
      priority: 'low'
    });
  }

  async getDashboardStats(): Promise<unknown> {
    return this.request<unknown>('/dashboard/stats', {
      method: 'GET',
    }, {
      cache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute
      priority: 'high'
    });
  }

  private getAnalyticsCacheTTL(period: string): number {
    switch (period) {
      case 'day':
        return 5 * 60 * 1000; // 5 minutes
      case 'week':
        return 15 * 60 * 1000; // 15 minutes
      case 'month':
        return 30 * 60 * 1000; // 30 minutes
      case 'year':
        return 60 * 60 * 1000; // 1 hour
      default:
        return 10 * 60 * 1000;
    }
  }

  // Core Request Method with Full Enhancement
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<T> {
    const requestId = this.generateRequestId(endpoint, options);
    const cacheKey = this.getCacheKey(endpoint, options);
    
    const finalConfig: Required<RequestConfig> = {
      cache: false,
      cacheTTL: 5 * 60 * 1000,
      retries: this.maxRetries,
      timeout: this.defaultTimeout,
      priority: 'normal',
      background: false,
      suppressErrorToast: false,
      retryCondition: this.defaultRetryCondition,
      onRetry: this.defaultOnRetry,
      signal: new AbortController().signal,
      ...config
    };

    // Update loading state
    this.updateLoadingState(requestId, true);

    try {
      // Check cache first
      if (finalConfig.cache && options.method === 'GET') {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          if (cached.stale && !finalConfig.background) {
            // Start background refresh
            this.backgroundRefresh(endpoint, options, finalConfig);
          }
          return cached.data;
        }
      }

      // Check for pending identical requests (deduplication)
      if (this.pendingRequests.has(cacheKey)) {
        logger.info(`Deduplicating request: ${endpoint}`);
        return this.pendingRequests.get(cacheKey) as Promise<T>;
      }

      // Create request promise
      const requestPromise = this.executeRequestWithRetry<T>(
        endpoint,
        options,
        finalConfig,
        requestId
      );

      // Store for deduplication
      this.pendingRequests.set(cacheKey, requestPromise);

      const result = await requestPromise;

      // Cache successful GET requests
      if (finalConfig.cache && options.method === 'GET') {
        this.setCache(cacheKey, result, finalConfig.cacheTTL);
      }

      return result;
    } catch (error) {
      // Enhanced error handling
      const enhancedError = this.enhanceError(error as Error, endpoint, finalConfig);
      
      if (!finalConfig.suppressErrorToast) {
        this.showErrorToast(enhancedError);
      }
      
      throw enhancedError;
    } finally {
      // Cleanup
      this.pendingRequests.delete(cacheKey);
      this.updateLoadingState(requestId, false);
    }
  }

  // Request Execution with Retry Logic
  private async executeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    config: Required<RequestConfig>,
    requestId: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        // Check rate limit
        if (this.rateLimitResetTime > Date.now()) {
          const waitTime = this.rateLimitResetTime - Date.now();
          throw new RateLimitError(`Rate Limit aktiv. Bitte warten Sie ${Math.ceil(waitTime / 1000)} Sekunden.`);
        }

        // Queue management for non-critical requests
        if (config.priority !== 'critical' && this.shouldQueueRequest()) {
          return this.queueRequest<T>(endpoint, options, config, requestId);
        }

        // Execute the actual request
        const result = await this.executeHttpRequest<T>(endpoint, options, config);
        
        // Log successful request
        if (attempt > 0) {
          logger.info(`Request succeeded after ${attempt} retries: ${endpoint}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Handle rate limiting
        if (error instanceof RateLimitError) {
          this.rateLimitResetTime = Date.now() + 60000; // 1 minute
          throw error;
        }

        // Check if we should retry
        if (attempt < config.retries && config.retryCondition(lastError, attempt)) {
          const delay = this.getRetryDelay(attempt);
          
          // Call retry callback
          config.onRetry(lastError, attempt);
          
          logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.retries + 1}): ${endpoint}`, {
            error: lastError.message,
            attempt: attempt + 1
          });
          
          await this.delay(delay);
          continue;
        }
        
        // No more retries, throw the error
        break;
      }
    }

    throw lastError || new Error('Request failed without error details');
  }

  // HTTP Request Execution
  private async executeHttpRequest<T>(
    endpoint: string,
    options: RequestInit,
    config: Required<RequestConfig>
  ): Promise<T> {
    this.concurrentRequests++;
    
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Combine signals if provided
      const signal = config.signal.aborted ? config.signal : controller.signal;

      const requestOptions: RequestInit = {
        ...options,
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      };

      const startTime = performance.now();
      const response = await fetch(url, requestOptions);
      const duration = performance.now() - startTime;
      
      clearTimeout(timeoutId);

      // Track performance
      performanceMonitor.trackAPICall(endpoint, duration, response.ok);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      return await this.parseSuccessResponse<T>(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`Anfrage-Timeout nach ${config.timeout}ms erreicht`);
      }
      throw error;
    } finally {
      this.concurrentRequests--;
    }
  }

  // Request Queue Management
  private shouldQueueRequest(): boolean {
    return this.concurrentRequests >= this.maxConcurrentRequests;
  }

  private async queueRequest<T>(
    endpoint: string,
    options: RequestInit,
    config: Required<RequestConfig>,
    requestId: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: QueuedRequest = {
        id: requestId,
        execute: () => this.executeHttpRequest<T>(endpoint, options, config),
        priority: this.getPriorityWeight(config.priority),
        timestamp: Date.now(),
        timeout: config.timeout,
        retries: config.retries,
        config
      };

      this.requestQueue.push(queueItem);
      this.sortRequestQueue();

      // Set timeout for queued request
      setTimeout(() => {
        const index = this.requestQueue.findIndex(item => item.id === requestId);
        if (index !== -1) {
          this.requestQueue.splice(index, 1);
          reject(new TimeoutError('Request timed out in queue'));
        }
      }, config.timeout);

      // Process queue
      this.processRequestQueue();
    });
  }

  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.requestQueue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
        const request = this.requestQueue.shift()!;
        
        // Check if request hasn't timed out
        if (Date.now() - request.timestamp > request.timeout) {
          continue;
        }

        // Execute request
        request.execute().catch(error => {
          logger.error('Queued request failed:', error);
        });
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Utility Methods
  private generateRequestId(endpoint: string, options: RequestInit): string {
    return `${options.method || 'GET'}-${endpoint}-${Date.now()}-${Math.random()}`;
  }

  private getCacheKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${endpoint}:${typeof body === 'string' ? body : JSON.stringify(body)}`;
  }

  private getFromCache<T>(key: string): { data: T; stale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    const stale = age > entry.ttl * this.staleThreshold;
    return { data: entry.data as T, stale };
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Prevent cache from growing too large
    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private getCacheTTLForTimeRange(timeRange: string): number {
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
        return 5 * 60 * 1000;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private sortRequestQueue(): void {
    this.requestQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Earlier requests first for same priority
    });
  }

  private getRetryDelay(attempt: number): number {
    return this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
  }

  private defaultRetryCondition = (error: Error, attempt: number): boolean => {
    // Don't retry on client errors (4xx) except 408, 429
    if (error instanceof ApiError) {
      const status = error.status;
      if (status >= 400 && status < 500) {
        return status === 408 || status === 429; // Timeout or rate limit
      }
    }

    // Don't retry on specific error types
    if (error instanceof RateLimitError || error instanceof TimeoutError) {
      return false;
    }

    // Retry on network errors and 5xx errors
    return true;
  };

  private defaultOnRetry = (error: Error, attempt: number): void => {
    logger.warn(`Request retry ${attempt + 1}:`, error.message);
  };

  private enhanceError(error: Error, endpoint: string, config: Required<RequestConfig>): Error {
    if (error instanceof ApiError || error instanceof NetworkError || 
        error instanceof TimeoutError || error instanceof RateLimitError) {
      return error;
    }

    // Enhance generic errors with context
    const enhancedMessage = `Fehler bei API-Aufruf ${endpoint}: ${error.message}`;
    
    if (error.name === 'AbortError') {
      return new TimeoutError(enhancedMessage);
    }

    if (error.message.includes('fetch')) {
      return new NetworkError(enhancedMessage);
    }

    return new ApiError(enhancedMessage, 0, 'UNKNOWN_ERROR');
  }

  private showErrorToast(error: Error): void {
    let message = 'Ein unbekannter Fehler ist aufgetreten';
    let duration = 4000;

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          message = 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
          break;
        case 403:
          message = 'Zugriff verweigert. Sie haben nicht die erforderlichen Berechtigungen.';
          break;
        case 404:
          message = 'Die angeforderte Ressource wurde nicht gefunden.';
          break;
        case 429:
          message = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
          duration = 6000;
          break;
        case 500:
          message = 'Serverfehler. Das Problem wird behoben.';
          break;
        default:
          message = error.message;
      }
    } else if (error instanceof NetworkError) {
      message = 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.';
      duration = 6000;
    } else if (error instanceof TimeoutError) {
      message = 'Anfrage-Timeout. Bitte versuchen Sie es erneut.';
    } else if (error instanceof RateLimitError) {
      message = error.message;
      duration = 8000;
    }

    toast.error(message, { duration });
  }

  private async parseErrorResponse(response: Response): Promise<{ message: string; code?: string; details?: Record<string, unknown> }> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        return {
          message: errorData.message || errorData.error || 'Unbekannter Serverfehler',
          code: errorData.code,
          details: errorData.details
        };
      } else {
        const text = await response.text();
        return { message: text || `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as unknown as T;
    }
  }

  private updateLoadingState(requestId: string, isLoading: boolean): void {
    if (isLoading) {
      this.loadingState.loadingRequests.add(requestId);
    } else {
      this.loadingState.loadingRequests.delete(requestId);
    }

    const wasLoading = this.loadingState.isLoading;
    this.loadingState.isLoading = this.loadingState.loadingRequests.size > 0;
    this.loadingState.progress = this.calculateProgress();

    // Notify listeners if state changed
    if (wasLoading !== this.loadingState.isLoading) {
      this.notifyLoadingStateListeners();
    }
  }

  private calculateProgress(): number {
    // Simple progress calculation based on request queue
    if (this.requestQueue.length === 0) return 100;
    const completed = Math.max(0, this.maxConcurrentRequests - this.concurrentRequests);
    return Math.min(100, (completed / this.maxConcurrentRequests) * 100);
  }

  private notifyLoadingStateListeners(): void {
    for (const listener of this.loadingStateListeners) {
      try {
        listener({ ...this.loadingState });
      } catch (error) {
        logger.error('Error in loading state listener:', error);
      }
    }
  }

  private initializeNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      logger.info('Network back online, refreshing stale cache');
      this.refreshStaleCache();
    });

    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
      logger.warn('Network offline, clearing pending requests');
      this.clearPendingRequests();
    });
  }

  private refreshStaleCache(): void {
    const staleCacheKeys: string[] = [];
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl * 0.5) {
        staleCacheKeys.push(key);
      }
    }

    // Refresh up to 5 stale entries
    staleCacheKeys.slice(0, 5).forEach(key => {
      const [method, url] = key.split(':');
      const endpoint = url.replace(this.baseUrl, '');
      this.backgroundRefresh(endpoint, { method }, { cache: true, priority: 'low' });
    });
  }

  private backgroundRefresh(endpoint: string, options: RequestInit, config: RequestConfig): void {
    this.request(endpoint, options, { ...config, priority: 'low', background: true, suppressErrorToast: true })
      .catch(error => {
        logger.debug('Background refresh failed:', error.message);
      });
  }

  private clearPendingRequests(): void {
    this.pendingRequests.clear();
    this.requestQueue.length = 0;
  }

  private clearAllCaches(): void {
    this.cache.clear();
    this.clearPendingRequests();
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API Methods for Development and Debugging
  public getCacheStats(): {
    size: number;
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need request counters
      totalRequests: 0,
      cacheHits: 0
    };
  }

  public getNetworkStats(): {
    pendingRequests: number;
    queuedRequests: number;
    concurrentRequests: number;
    networkStatus: string;
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      queuedRequests: this.requestQueue.length,
      concurrentRequests: this.concurrentRequests,
      networkStatus: this.networkStatus
    };
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
      logger.info(`Cleared cache entries matching pattern: ${pattern}`);
    } else {
      this.cache.clear();
      logger.info('Cleared all cache entries');
    }
  }

  public async preloadCriticalData(): Promise<void> {
    const criticalEndpoints = [
      '/auth/me',
      '/kpi/overview',
      '/energy/realtime'
    ];

    const preloadPromises = criticalEndpoints.map(endpoint =>
      this.request(endpoint, { method: 'GET' }, {
        cache: true,
        priority: 'low',
        background: true,
        suppressErrorToast: true
      }).catch(() => {
        // Ignore preload failures
      })
    );

    await Promise.allSettled(preloadPromises);
    logger.info('Critical data preloading completed');
  }
}

export const enhancedApiService = new EnhancedApiService();
export type { RequestConfig, LoadingState, ApiError, NetworkError, TimeoutError, RateLimitError };