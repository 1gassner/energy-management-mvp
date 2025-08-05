/**
 * API Service Interface for CityPulse
 * 
 * This interface defines the contract that both Mock and Real API services must implement.
 * Ensures consistency across different implementations.
 */

import type { 
  User, 
  Building, 
  Sensor, 
  EnergyData, 
  Alert, 
  AnalyticsData,
  DashboardStats 
} from '@/types';

export interface ApiServiceInterface {
  // Authentication
  login(email: string, password: string): Promise<{
    user: User;
    token: string;
    refreshToken?: string;
  }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken?(refreshToken: string): Promise<{ token: string; refreshToken: string }>;

  // Buildings
  getBuildings(): Promise<Building[]>;
  getBuilding(id: string): Promise<Building>;
  updateBuilding?(id: string, updates: Partial<Building>): Promise<Building>;
  createBuilding?(building: Omit<Building, 'id'>): Promise<Building>;

  // Sensors
  getSensors(filters?: SensorFilters): Promise<Sensor[]>;
  getSensor(id: string): Promise<Sensor>;
  getBuildingSensors(buildingId: string): Promise<Sensor[]>;
  createSensor?(sensor: Omit<Sensor, 'id'>): Promise<Sensor>;
  updateSensor?(id: string, updates: Partial<Sensor>): Promise<Sensor>;
  deleteSensor?(id: string): Promise<void>;

  // Energy Data
  getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]>;
  getEnergyConsumption?(buildingId: string, options?: EnergyDataOptions): Promise<EnergyData[]>;
  getEnergyProduction?(buildingId: string, options?: EnergyDataOptions): Promise<EnergyData[]>;

  // Analytics
  getDashboardStats(): Promise<DashboardStats>;
  getAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<AnalyticsData>;
  getPredictions?(buildingId?: string, days?: number): Promise<Array<{date: string; value: number; confidence?: number}>>;
  getTrends?(buildingId?: string, period?: string): Promise<Array<{date: string; value: number; change?: number}>>;

  // Alerts
  getAlerts(filters?: AlertFilters): Promise<Alert[]>;
  updateAlert(id: string, updates: AlertUpdate): Promise<Alert>;
  createAlert?(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert>;
  markAlertAsRead?(id: string): Promise<Alert>;
  resolveAlert?(id: string): Promise<Alert>;

  // Real-time (optional for implementations that support it)
  connectWebSocket?(): void;
  disconnectWebSocket?(): void;
  subscribeToSensorUpdates?(buildingId: string, callback: (data: Sensor) => void): () => void;
  subscribeToAlerts?(callback: (alert: Alert) => void): () => void;
  subscribeToEnergyData?(buildingId: string, callback: (data: EnergyData) => void): () => void;

  // Admin functions (optional)
  getUsers?(): Promise<User[]>;
  createUser?(user: Omit<User, 'id'>): Promise<User>;
  updateUser?(id: string, updates: Partial<User>): Promise<User>;
  deleteUser?(id: string): Promise<void>;
}

// Filter and option types
export interface SensorFilters {
  buildingId?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'error';
  limit?: number;
  offset?: number;
}

export interface AlertFilters {
  buildingId?: string;
  type?: 'critical' | 'warning' | 'info';
  status?: 'unread' | 'read' | 'resolved';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  limit?: number;
  offset?: number;
}

export interface AlertUpdate {
  isRead?: boolean;
  isResolved?: boolean;
}

export interface EnergyDataOptions {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
}

// Response wrapper types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'sensor_update' | 'alert' | 'energy_data' | 'system_status';
  data: Sensor | Alert | EnergyData | Record<string, unknown>;
  timestamp: string;
  buildingId?: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Utility types for API operations
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method: ApiMethod;
  url: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  key?: string;
}

// Service configuration
export interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cache: CacheConfig;
  headers: Record<string, string>;
}