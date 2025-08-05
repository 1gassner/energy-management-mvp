// Enhanced API Response Types for CityPulse Hechingen

// Base Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId?: string;
  version?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MetadataResponse {
  lastUpdated: string;
  source: string;
  accuracy?: number;
  confidence?: number;
  version: string;
}

// Authentication Responses
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'user' | 'buergermeister' | 'gebaeude_manager' | 'buerger';
    permissions: string[];
    lastLogin?: string;
    avatar?: string;
    preferences?: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
        alerts: boolean;
      };
    };
  };
  token: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RegisterResponse extends LoginResponse {
  activationRequired?: boolean;
  activationToken?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
  settings: Record<string, unknown>;
  stats?: {
    loginCount: number;
    lastActivity: string;
    energySavingsTracked: number;
  };
}

// Building and Location Responses
export interface BuildingResponse {
  id: string;
  name: string;
  type: 'school' | 'administrative' | 'sports' | 'cultural' | 'residential' | 'commercial';
  address: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  area: number; // m²
  constructionYear?: number;
  energyClass?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  status: 'active' | 'inactive' | 'maintenance' | 'renovation';
  metadata: MetadataResponse;
  sensors?: SensorSummary[];
  energyProfile?: {
    averageConsumption: number; // kWh/day
    peakConsumption: number;
    baselineConsumption: number;
    efficiency: number; // %
  };
}

export interface SensorSummary {
  id: string;
  type: string;
  location: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastReading?: string;
  batteryLevel?: number;
}

// Energy Data Responses
export interface EnergyDataPoint {
  timestamp: string;
  consumption: number; // kWh
  production?: number; // kWh (for solar/renewable)
  cost?: number; // EUR
  co2Emissions?: number; // kg CO2
  temperature?: number; // °C
  humidity?: number; // %
  occupancy?: number; // people count
}

export interface EnergyDataResponse {
  buildingId: string;
  buildingName: string;
  timeRange: {
    start: string;
    end: string;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  data: EnergyDataPoint[];
  summary: {
    totalConsumption: number;
    totalProduction?: number;
    totalCost: number;
    totalCO2: number;
    averageConsumption: number;
    peakConsumption: {
      value: number;
      timestamp: string;
    };
    efficiency: number;
  };
  metadata: MetadataResponse;
  forecast?: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    confidence: number;
  };
}

// KPI and Analytics Responses
export interface KPIResponse {
  buildingId?: string;
  period: {
    start: string;
    end: string;
    type: 'realtime' | 'hour' | 'day' | 'week' | 'month' | 'year';
  };
  energy: {
    consumption: {
      total: number; // kWh
      average: number;
      peak: number;
      trend: number; // % change
    };
    production?: {
      total: number;
      average: number;
      peak: number;
      trend: number;
    };
    efficiency: {
      current: number; // %
      target: number;
      improvement: number;
    };
  };
  cost: {
    total: number; // EUR
    perKwh: number;
    trend: number;
    savings?: number;
  };
  environmental: {
    co2Emissions: number; // kg CO2
    co2Saved: number;
    carbonIntensity: number; // g CO2/kWh
    renewableRatio?: number; // %
  };
  performance: {
    uptime: number; // %
    errorRate: number; // %
    dataQuality: number; // %
  };
  metadata: MetadataResponse;
}

export interface DashboardStatsResponse {
  overview: {
    totalBuildings: number;
    activeBuildings: number;
    totalSensors: number;
    activeSensors: number;
    systemHealth: number; // %
  };
  energy: {
    totalConsumption: number; // kWh (today)
    totalProduction: number;
    currentPower: number; // kW
    efficiency: number; // %
    trend: {
      consumption: number; // % change
      production: number;
      efficiency: number;
    };
  };
  cost: {
    totalCost: number; // EUR (today)
    averageCostPerKwh: number;
    savings: number;
    trend: number; // % change
  };
  environmental: {
    co2Emissions: number; // kg CO2 (today)
    co2Saved: number;
    renewableRatio: number; // %
    carbonIntensity: number; // g CO2/kWh
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  metadata: MetadataResponse;
}

// Sensor and Device Responses
export interface SensorResponse {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  type: 'electricity' | 'gas' | 'water' | 'temperature' | 'humidity' | 'co2' | 'occupancy' | 'solar';
  location: {
    room?: string;
    floor?: string;
    zone?: string;
    coordinates?: {
      x: number;
      y: number;
      z?: number;
    };
  };
  status: 'active' | 'inactive' | 'error' | 'maintenance' | 'calibrating';
  specifications: {
    model: string;
    manufacturer: string;
    accuracy: number; // %
    range: {
      min: number;
      max: number;
      unit: string;
    };
    resolution: number;
    calibrationDate?: string;
    nextCalibration?: string;
  };
  readings: {
    current: {
      value: number;
      unit: string;
      timestamp: string;
      quality: number; // %
    };
    history?: {
      period: string;
      average: number;
      min: number;
      max: number;
    };
  };
  health: {
    batteryLevel?: number; // %
    signalStrength?: number; // %
    errorRate: number; // %
    uptime: number; // %
    lastMaintenance?: string;
  };
  metadata: MetadataResponse;
}

// Alert and Notification Responses
export interface AlertResponse {
  id: string;
  buildingId: string;
  buildingName: string;
  sensorId?: string;
  sensorName?: string;
  type: 'energy' | 'system' | 'maintenance' | 'security' | 'environmental';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  title: string;
  description: string;
  details?: Record<string, unknown>;
  triggers: {
    condition: string;
    threshold: number;
    actualValue: number;
    unit?: string;
  }[];
  impact: {
    affected: string[];
    estimatedCost?: number;
    energyLoss?: number;
    co2Impact?: number;
  };
  recommendations?: {
    action: string;
    priority: number;
    estimatedSavings?: number;
    timeToImplement?: string;
  }[];
  timestamps: {
    created: string;
    updated: string;
    acknowledged?: string;
    resolved?: string;
  };
  assignee?: {
    id: string;
    name: string;
    role: string;
  };
  metadata: MetadataResponse;
}

// Historical and Analytics Responses
export interface HistoricalDataResponse {
  buildingId: string;
  period: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
  metrics: {
    consumption: EnergyDataPoint[];
    cost: { timestamp: string; value: number; unit: string }[];
    efficiency: { timestamp: string; value: number; unit: string }[];
    co2: { timestamp: string; value: number; unit: string }[];
  };
  aggregations: {
    total: {
      consumption: number;
      cost: number;
      co2: number;
    };
    average: {
      consumption: number;
      cost: number;
      efficiency: number;
    };
    peaks: {
      consumption: { value: number; timestamp: string };
      cost: { value: number; timestamp: string };
    };
  };
  comparisons?: {
    previousPeriod: {
      consumption: { value: number; change: number };
      cost: { value: number; change: number };
      efficiency: { value: number; change: number };
    };
    yearOverYear?: {
      consumption: { value: number; change: number };
      cost: { value: number; change: number };
    };
    target?: {
      consumption: { target: number; actual: number; achievement: number };
      efficiency: { target: number; actual: number; achievement: number };
    };
  };
  metadata: MetadataResponse;
}

export interface AnalyticsResponse {
  timeframe: {
    start: string;
    end: string;
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  scope: {
    buildingId?: string;
    buildingIds?: string[];
    citywide: boolean;
  };
  insights: {
    energyPatterns: {
      peakHours: string[];
      lowUsagePeriods: string[];
      seasonalTrends: {
        season: string;
        avgConsumption: number;
        trend: number;
      }[];
    };
    efficiency: {
      overall: number;
      byBuilding: { buildingId: string; efficiency: number }[];
      improvement: number;
      potential: number;
    };
    costs: {
      breakdown: {
        energy: number;
        demand: number;
        taxes: number;
        other: number;
      };
      optimization: {
        potential: number;
        recommendations: string[];
      };
    };
    environmental: {
      carbonFootprint: number;
      reductionAchieved: number;
      renewableIntegration: number;
      offsetPotential: number;
    };
  };
  predictions: {
    nextPeriod: {
      consumption: { value: number; confidence: number };
      cost: { value: number; confidence: number };
      efficiency: { value: number; confidence: number };
    };
    scenarios: {
      name: string;
      description: string;
      impact: {
        consumption: number;
        cost: number;
        co2: number;
      };
    }[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'efficiency' | 'cost' | 'maintenance' | 'renewable';
    title: string;
    description: string;
    impact: {
      energyReduction?: number;
      costSavings: number;
      co2Reduction: number;
      paybackPeriod?: string;
    };
    implementation: {
      difficulty: 'easy' | 'medium' | 'hard';
      timeframe: string;
      cost?: number;
    };
  }[];
  metadata: MetadataResponse;
}

// System and Health Responses
export interface SystemHealthResponse {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number; // 0-100
    uptime: number; // %
  };
  components: {
    api: {
      status: 'up' | 'down' | 'degraded';
      responseTime: number; // ms
      errorRate: number; // %
    };
    database: {
      status: 'up' | 'down' | 'degraded';
      connectionPool: number; // %
      queryTime: number; // ms
    };
    sensors: {
      total: number;
      active: number;
      offline: number;
      error: number;
    };
    websocket: {
      status: 'up' | 'down' | 'degraded';
      connections: number;
      messageRate: number; // per second
    };
  };
  performance: {
    memoryUsage: number; // %
    cpuUsage: number; // %
    diskUsage: number; // %
    networkLatency: number; // ms
  };
  security: {
    lastSecurityScan: string;
    vulnerabilities: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    authFailures: number;
  };
  metadata: MetadataResponse;
}

// Budget and Financial Responses
export interface BudgetResponse {
  period: {
    start: string;
    end: string;
    type: 'monthly' | 'quarterly' | 'annual';
  };
  budget: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    utilization: number; // %
  };
  breakdown: {
    category: string;
    budgeted: number;
    spent: number;
    variance: number;
    variancePercent: number;
  }[];
  forecast: {
    projectedSpend: number;
    projectedSavings: number;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number; // %
  };
  savings: {
    realized: number;
    potential: number;
    opportunities: {
      description: string;
      amount: number;
      timeframe: string;
    }[];
  };
  metadata: MetadataResponse;
}

// Export all types with different names to avoid conflicts
export type {
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  MetadataResponse as MetadataResponseType,
  LoginResponse as LoginResponseType,
  RegisterResponse as RegisterResponseType,
  UserProfileResponse as UserProfileResponseType,
  BuildingResponse as BuildingResponseType,
  SensorSummary as SensorSummaryType,
  EnergyDataPoint as EnergyDataPointType,
  EnergyDataResponse as EnergyDataResponseType,
  KPIResponse as KPIResponseType,
  DashboardStatsResponse as DashboardStatsResponseType,
  SensorResponse as SensorResponseType,
  AlertResponse as AlertResponseType,
  HistoricalDataResponse as HistoricalDataResponseType,
  AnalyticsResponse as AnalyticsResponseType,
  SystemHealthResponse as SystemHealthResponseType,
  BudgetResponse as BudgetResponseType
};