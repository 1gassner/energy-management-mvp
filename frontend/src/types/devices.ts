/**
 * Device & Asset Management Types für CityPulse
 */

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  category: DeviceCategory;
  buildingId: string;
  location: string;
  status: DeviceStatus;
  
  // Hardware Details
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion?: string;
  macAddress?: string;
  ipAddress?: string;
  
  // Lifecycle Management
  purchaseDate: string;
  installationDate: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  replacementDate?: string;
  
  // Financial
  purchasePrice: number;
  monthlyOperatingCost: number;
  energyConsumption: number; // kWh per month
  
  // Maintenance
  maintenanceSchedule: MaintenanceSchedule;
  maintenanceHistory: MaintenanceRecord[];
  
  // Sensors attached to this device
  sensorIds: string[];
  
  // Documentation
  manualUrl?: string;
  notes?: string;
  images?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export enum DeviceType {
  // HVAC Systems
  HEAT_PUMP = 'heat_pump',
  BOILER = 'boiler',
  CHILLER = 'chiller',
  VENTILATION = 'ventilation',
  AIR_CONDITIONING = 'air_conditioning',
  
  // Energy Systems
  SOLAR_PANEL = 'solar_panel',
  BATTERY_STORAGE = 'battery_storage',
  INVERTER = 'inverter',
  SMART_METER = 'smart_meter',
  TRANSFORMER = 'transformer',
  
  // Pool Equipment (Hallenbad)
  POOL_PUMP = 'pool_pump',
  POOL_HEATER = 'pool_heater',
  FILTRATION_SYSTEM = 'filtration_system',
  WATER_TREATMENT = 'water_treatment',
  
  // Building Automation
  BMS_CONTROLLER = 'bms_controller',
  LIGHTING_CONTROLLER = 'lighting_controller',
  SECURITY_SYSTEM = 'security_system',
  ACCESS_CONTROL = 'access_control',
  
  // Sports Equipment (Sporthallen)
  VENTILATION_SPORTS = 'ventilation_sports',
  HEATING_SPORTS = 'heating_sports',
  LIGHTING_LED = 'lighting_led',
  
  // IT Infrastructure
  NETWORK_SWITCH = 'network_switch',
  WIFI_ACCESS_POINT = 'wifi_access_point',
  SERVER = 'server',
  IOT_GATEWAY = 'iot_gateway',
  
  // Generic Types
  SENSOR = 'sensor',
  HVAC = 'hvac',
  LIGHTING = 'lighting',
}

export enum DeviceCategory {
  ENERGY_PRODUCTION = 'energy_production',
  ENERGY_CONSUMPTION = 'energy_consumption',
  HVAC = 'hvac',
  LIGHTING = 'lighting',
  SECURITY = 'security',
  POOL_EQUIPMENT = 'pool_equipment',
  SPORTS_EQUIPMENT = 'sports_equipment',
  IT_INFRASTRUCTURE = 'it_infrastructure',
  MONITORING = 'monitoring',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  DECOMMISSIONED = 'decommissioned',
  PLANNED = 'planned', // For future installations
}

export interface MaintenanceSchedule {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval?: number; // For custom frequency
  tasks: MaintenanceTask[];
  assignedTechnician?: string;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  requiredTools: string[];
  requiredParts: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  date: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Task Details
  tasksCompleted: string[];
  timeSpent: number; // minutes
  technician: string;
  
  // Parts & Costs
  partsUsed: PartUsed[];
  laborCost: number;
  totalCost: number;
  
  // Results
  findings: string;
  recommendations: string;
  nextMaintenanceDate?: string;
  
  // Documentation
  photos?: string[];
  documents?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface PartUsed {
  partNumber: string;
  name: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
}

// Device Dashboard Analytics
export interface DeviceAnalytics {
  deviceId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  
  // Performance Metrics
  uptime: number; // percentage
  energyConsumption: number; // kWh
  efficiency: number; // percentage
  
  // Cost Metrics
  operatingCost: number;
  maintenanceCost: number;
  totalCost: number;
  
  // Maintenance Metrics
  maintenanceEvents: number;
  averageRepairTime: number; // hours
  meanTimeBetweenFailures: number; // hours
  
  // Trends
  trends: {
    efficiency: number; // percentage change
    cost: number; // percentage change
    reliability: number; // percentage change
  };
}

// Asset Lifecycle Management
export interface AssetLifecycle {
  deviceId: string;
  
  // Lifecycle Stages
  stages: {
    planning: LifecycleStage;
    procurement: LifecycleStage;
    installation: LifecycleStage;
    operation: LifecycleStage;
    maintenance: LifecycleStage;
    replacement: LifecycleStage;
    disposal: LifecycleStage;
  };
  
  // Financial Tracking
  totalCostOfOwnership: number;
  roi: number;
  paybackPeriod: number; // months
  
  // Performance Over Time
  performanceHistory: PerformanceSnapshot[];
}

export interface LifecycleStage {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  cost?: number;
  notes?: string;
}

export interface PerformanceSnapshot {
  date: string;
  efficiency: number;
  energyConsumption: number;
  maintenanceCost: number;
  reliability: number;
}

// Device Search & Filter
export interface DeviceFilter {
  buildingIds?: string[];
  types?: DeviceType[];
  categories?: DeviceCategory[];
  status?: DeviceStatus[];
  manufacturerKeywords?: string[];
  maintenanceDue?: boolean;
  warrantyExpiring?: boolean;
  energyThreshold?: number;
  costThreshold?: number;
}

export interface DeviceSearchResult {
  devices: Device[];
  totalCount: number;
  filters: DeviceFilter;
  sortBy?: 'name' | 'type' | 'status' | 'maintenanceDate' | 'energyConsumption' | 'cost';
  sortOrder?: 'asc' | 'desc';
}