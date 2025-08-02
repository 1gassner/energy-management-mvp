import { User, Building, Sensor, EnergyData, Alert, AnalyticsData, PredictionData, TrendData } from '@/types';
import { DashboardStats } from '@/types/api';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@citypulse.com',
    name: 'Administrator',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@citypulse.com',
    name: 'Stadt Manager',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'user@citypulse.com',
    name: 'Bürger',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

// Mock Buildings
export const mockBuildings: Building[] = [
  {
    id: 'rathaus-001',
    name: 'Rathaus',
    type: 'rathaus',
    address: 'Hauptstraße 1, 12345 Musterstadt',
    capacity: 150,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
  },
  {
    id: 'grundschule-001',
    name: 'Grundschule Musterstadt',
    type: 'grundschule',
    address: 'Schulstraße 10, 12345 Musterstadt',
    capacity: 200,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
  },
  {
    id: 'realschule-001',
    name: 'Realschule Plus',
    type: 'realschule',
    address: 'Bildungsweg 5, 12345 Musterstadt',
    capacity: 300,
    status: 'maintenance',
    lastUpdate: new Date().toISOString(),
    sensors: [],
  },
];

// Mock Sensors
export const mockSensors: Sensor[] = [
  // Rathaus Sensors
  {
    id: 'temp-rathaus-001',
    buildingId: 'rathaus-001',
    type: 'temperature',
    name: 'Raumtemperatur Erdgeschoss',
    value: 22.5,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'services-rathaus-001',
    buildingId: 'rathaus-001',
    type: 'services',
    name: 'Bürgerdienste Online',
    value: 89.2,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'traffic-rathaus-001',
    buildingId: 'rathaus-001',
    type: 'traffic',
    name: 'Verkehrsfluss Zentrum',
    value: 73.5,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'security-rathaus-001',
    buildingId: 'rathaus-001',
    type: 'security',
    name: 'Sicherheitsstatus',
    value: 96.1,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  // Grundschule Sensors
  {
    id: 'temp-grundschule-001',
    buildingId: 'grundschule-001',
    type: 'temperature',
    name: 'Klassenraum Temperatur',
    value: 21.8,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'education-grundschule-001',
    buildingId: 'grundschule-001',
    type: 'education',
    name: 'Bildungsqualität',
    value: 92.3,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'health-grundschule-001',
    buildingId: 'grundschule-001',
    type: 'health',
    name: 'Gesundheitsindex',
    value: 88.7,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  // Realschule Sensors
  {
    id: 'temp-realschule-001',
    buildingId: 'realschule-001',
    type: 'temperature',
    name: 'Hauptgebäude Temperatur',
    value: 23.1,
    unit: '°C',
    status: 'error',
    lastReading: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'environment-realschule-001',
    buildingId: 'realschule-001',
    type: 'environment',
    name: 'Umweltqualität',
    value: 85.4,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
];

// Generate Mock Energy Data
export const generateMockEnergyData = (buildingId?: string, days: number = 7): EnergyData[] => {
  const data: EnergyData[] = [];
  const buildings = buildingId ? [buildingId] : mockBuildings.map(b => b.id);
  
  for (let day = days - 1; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      buildings.forEach(bId => {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        const building = mockBuildings.find(b => b.id === bId);
        const baseConsumption = building?.capacity || 100;
        
        // Simulate realistic energy patterns
        const timeMultiplier = getTimeMultiplier(hour);
        const consumption = baseConsumption * timeMultiplier * (0.8 + Math.random() * 0.4);
        const production = Math.max(0, getSolarProduction(hour) * (0.7 + Math.random() * 0.6));
        const efficiency = Math.min(100, (production / consumption) * 100);
        const co2Saved = production * 0.5; // 0.5kg CO2 per kWh
        
        data.push({
          id: `energy-${bId}-${timestamp.getTime()}`,
          buildingId: bId,
          timestamp: timestamp.toISOString(),
          consumption: Math.round(consumption * 100) / 100,
          production: Math.round(production * 100) / 100,
          efficiency: Math.round(efficiency * 100) / 100,
          co2Saved: Math.round(co2Saved * 100) / 100,
        });
      });
    }
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Helper functions for realistic data patterns
const getTimeMultiplier = (hour: number): number => {
  // Simulate daily usage patterns
  if (hour >= 6 && hour <= 8) return 0.9; // Morning
  if (hour >= 9 && hour <= 17) return 1.2; // Working hours
  if (hour >= 18 && hour <= 21) return 1.0; // Evening
  return 0.3; // Night
};

const getSolarProduction = (hour: number): number => {
  // Simulate solar production curve
  if (hour < 6 || hour > 19) return 0;
  if (hour >= 6 && hour <= 9) return (hour - 6) * 20; // Rising
  if (hour >= 10 && hour <= 15) return 60 + Math.random() * 20; // Peak
  if (hour >= 16 && hour <= 19) return (20 - hour) * 15; // Falling
  return 0;
};

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    buildingId: 'realschule-001',
    type: 'critical',
    title: 'Temperatursensor Ausfall',
    message: 'Der Temperatursensor im Hauptgebäude ist ausgefallen und sendet keine Daten mehr.',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    isRead: false,
    isResolved: false,
    priority: 'critical',
    source: 'Sensor temp-realschule-001',
  },
  {
    id: 'alert-002',
    buildingId: 'rathaus-001',
    type: 'warning',
    title: 'Hohe Systemlast',
    message: 'Die Systemlast liegt 20% über dem erwarteten Wert für diese Tageszeit.'
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: true,
    isResolved: false,
    priority: 'medium',
    source: 'Energy Monitor',
  },
  {
    id: 'alert-003',
    buildingId: 'grundschule-001',
    type: 'info',
    title: 'Wartung geplant',
    message: 'Die nächste planmäßige Wartung der IT-Systeme ist für nächste Woche geplant.'
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    isRead: false,
    isResolved: false,
    priority: 'low',
    source: 'Maintenance System',
  },
  {
    id: 'alert-004',
    buildingId: 'rathaus-001',
    type: 'error',
    title: 'Datenspeicher Kapazität niedrig',
    message: 'Die Speicherkapazität ist unter 20% gefallen. Bitte prüfen Sie das System.'
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    isRead: false,
    isResolved: false,
    priority: 'high',
    source: 'Battery Management System',
  },
];

// Mock Analytics Data
export const generateMockAnalytics = (period: 'day' | 'week' | 'month' | 'year'): AnalyticsData => {
  const totalConsumption = 1245.67;
  const totalProduction = 987.34;
  const totalSaved = 567.89;
  const efficiency = (totalProduction / totalConsumption) * 100;
  const co2Reduction = totalSaved * 0.5;
  
  const predictions: PredictionData[] = [];
  const trends: TrendData[] = [
    {
      label: 'Bürgerdienste',
      value: totalConsumption,
      change: -8.5,
      trend: 'down',
    },
    {
      label: 'Digitalisierung',
      value: totalProduction,
      change: 12.3,
      trend: 'up',
    },
    {
      label: 'Effizienz',
      value: efficiency,
      change: 5.7,
      trend: 'up',
    },
    {
      label: 'Bürgerzufriedenheit',
      value: co2Reduction,
      change: 15.2,
      trend: 'up',
    },
  ];
  
  // Generate predictions for the next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedConsumption: totalConsumption * (0.9 + Math.random() * 0.2),
      predictedProduction: totalProduction * (0.8 + Math.random() * 0.4),
      confidence: 75 + Math.random() * 20,
    });
  }
  
  return {
    period,
    totalConsumption,
    totalProduction,
    totalSaved,
    efficiency: Math.round(efficiency * 100) / 100,
    co2Reduction: Math.round(co2Reduction * 100) / 100,
    predictions,
    trends,
  };
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalEnergyProduced: 2847.5,
  totalEnergyConsumed: 3256.8,
  totalCO2Saved: 1423.75,
  totalBuildings: mockBuildings.length,
  activeAlerts: mockAlerts.filter(a => !a.isResolved).length,
  systemEfficiency: 87.4,
  trends: {
    energyProduction: 12.3,
    energyConsumption: -8.5,
    efficiency: 5.7,
    co2Savings: 15.2,
  },
};

// Authentication credentials for mock login
export const mockCredentials = {
  admin: { email: 'admin@citypulse.com', password: 'admin123' },
  manager: { email: 'manager@citypulse.com', password: 'manager123' },
  user: { email: 'user@citypulse.com', password: 'user123' },
};

// Update sensors in buildings
mockBuildings.forEach(building => {
  building.sensors = mockSensors.filter(sensor => sensor.buildingId === building.id);
});