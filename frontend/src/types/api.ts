import { User, LoginCredentials, RegisterData, EnergyData, Building, Sensor, Alert, AnalyticsData } from './index';

// API Service Interface
export interface IAPIService {
  // Authentication
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
  register(data: RegisterData): Promise<{ user: User; token: string }>;
  refreshUser(): Promise<User>;
  logout(): Promise<void>;
  
  // Energy Data
  getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]>;
  getLatestEnergyData(buildingId: string): Promise<EnergyData>;
  
  // Buildings
  getBuildings(): Promise<Building[]>;
  getBuilding(id: string): Promise<Building>;
  updateBuilding(id: string, data: Partial<Building>): Promise<Building>;
  
  // Sensors
  getSensors(buildingId?: string): Promise<Sensor[]>;
  getSensor(id: string): Promise<Sensor>;
  updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor>;
  
  // Alerts
  getAlerts(buildingId?: string): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert>;
  markAlertAsRead(id: string): Promise<Alert>;
  resolveAlert(id: string): Promise<Alert>;
  
  // Analytics
  getAnalytics(period: 'day' | 'week' | 'month' | 'year', buildingId?: string): Promise<AnalyticsData>;
  getDashboardStats(): Promise<DashboardStats>;
}

// WebSocket Service Interface
export interface IWebSocketService {
  connect(): void;
  disconnect(): void;
  destroy?(): void; // Optional method for proper cleanup
  subscribe(type: string, callback: (data: unknown) => void): string;
  unsubscribe(id: string): void;
  send(message: WebSocketMessage): void;
  onConnectionChange(callback: (connected: boolean) => void): () => void;
  isConnected: boolean;
  connectionState: string;
}

// WebSocket Message Interface
export interface WebSocketMessage {
  type: 'energy_update' | 'alert' | 'building_status' | 'sensor_data' | 'system_status' | 'subscribe' | 'unsubscribe' | 'authenticate';
  payload: unknown;
  timestamp: string;
  source?: string;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalEnergyProduced: number;
  totalEnergyConsumed: number;
  totalCO2Saved: number;
  totalBuildings: number;
  activeAlerts: number;
  systemEfficiency: number;
  trends: {
    energyProduction: number;
    energyConsumption: number;
    efficiency: number;
    co2Savings: number;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Environment Configuration
export interface EnvironmentConfig {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_APP_ENV: 'development' | 'production' | 'test';
  VITE_USE_MOCK_DATA: string;
  VITE_SENTRY_DSN?: string;
  VITE_GOOGLE_ANALYTICS_ID?: string;
}

// Mock Configuration
export interface MockConfig extends Record<string, unknown> {
  useMockData: boolean;
  mockDelay: number;
  failureRate: number;
  webSocketEnabled: boolean;
}

// Service Factory
export interface ServiceFactory {
  createAPIService(): IAPIService;
  createWebSocketService(): IWebSocketService;
  isMockMode(): boolean;
}