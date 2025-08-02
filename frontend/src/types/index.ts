// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'public';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

// Energy Management Types
export interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string;
  consumption: number; // kWh
  production: number; // kWh (solar, etc.)
  efficiency: number; // percentage
  co2Saved: number; // kg
}

export interface Building {
  id: string;
  name: string;
  type: 'rathaus' | 'grundschule' | 'realschule' | 'other';
  address: string;
  capacity: number; // max kWh
  status: 'online' | 'offline' | 'maintenance';
  sensors: Sensor[];
  lastUpdate: string;
}

export interface Sensor {
  id: string;
  buildingId: string;
  type: 'temperature' | 'humidity' | 'energy' | 'solar' | 'battery' | 'services' | 'traffic' | 'security' | 'education' | 'health' | 'environment';
  name: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'error';
  lastReading: string;
}

// Alert Types
export interface Alert {
  id: string;
  buildingId: string;
  type: 'warning' | 'error' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

// Analytics Types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  totalConsumption: number;
  totalProduction: number;
  totalSaved: number;
  efficiency: number;
  co2Reduction: number;
  predictions: PredictionData[];
  trends: TrendData[];
}

export interface PredictionData {
  date: string;
  predictedConsumption: number;
  predictedProduction: number;
  confidence: number; // percentage
}

export interface TrendData {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

// WebSocket Message Types
// WebSocket payload types
export interface EnergyUpdatePayload {
  totalEnergy?: number;
  co2Saved?: number;
  buildingId?: string;
}

export interface AlertPayload {
  alertCount?: number;
  message?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  buildingId?: string;
}

export interface SystemStatusPayload {
  status?: 'online' | 'offline' | 'maintenance';
  buildingId?: string;
}

export interface SensorDataPayload {
  sensorId: string;
  value: number;
  timestamp: string;
  unit: string;
}

export type WebSocketPayload = EnergyUpdatePayload | AlertPayload | SystemStatusPayload | SensorDataPayload | Record<string, unknown>;

export interface WebSocketMessage {
  type: 'energy_update' | 'alert' | 'building_status' | 'sensor_data' | 'system_status';
  payload: WebSocketPayload;
  timestamp: string;
  source?: string;
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

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  consumption: number;
  production: number;
  efficiency: number;
}

// Component Props Types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

// Environment Variables
export interface EnvironmentConfig {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_APP_ENV: 'development' | 'production' | 'test';
  VITE_USE_MOCK_DATA: string;
  VITE_MOCK_DELAY?: string;
  VITE_MOCK_FAILURE_RATE?: string;
  VITE_WS_ENABLED?: string;
  VITE_SENTRY_DSN?: string;
  VITE_GOOGLE_ANALYTICS_ID?: string;
}