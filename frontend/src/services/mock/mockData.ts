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
  {
    id: '4',
    email: 'buergermeister@citypulse.com',
    name: 'Bürgermeister Dr. Philipp Hahn',
    role: 'buergermeister',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'gebaeude.manager@citypulse.com',
    name: 'Klaus Fischer',
    role: 'gebaeudemanager',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '6',
    email: 'buerger@citypulse.com',
    name: 'Max Mustermann',
    role: 'buerger',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

// Mock Buildings - Stadt Hechingen (alle 7 Gebäude)
export const mockBuildings: Building[] = [
  {
    id: 'rathaus-hechingen',
    name: 'Rathaus Hechingen',
    type: 'rathaus',
    address: 'Obertorplatz 7, 72379 Hechingen',
    capacity: 150,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 300000, // 300.000 kWh/Jahr
    savingsPotential: {
      kwh: 60000, // 20% Einsparung
      euro: 12780, // bei 0,213 €/kWh
      percentage: 20
    },
    kwhPerSquareMeter: 100, // 300.000 kWh / 3.000 m²
    area: 3000, // 3.000 m²
    specialFeatures: {
      buildYear: 1850,
      lastRenovation: 2018,
      renovationStatus: 'completed'
    },
    energyClass: 'C'
  },
  {
    id: 'realschule-hechingen',
    name: 'Realschule Hechingen',
    type: 'realschule',
    address: 'Weilheimer Straße 14, 72379 Hechingen',
    capacity: 200,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 350000, // 350.000 kWh/Jahr
    savingsPotential: {
      kwh: 35000, // 10% Einsparung (bereits KfW-55 saniert!)
      euro: 7455, // bei 0,213 €/kWh
      percentage: 10
    },
    kwhPerSquareMeter: 50, // 350.000 kWh / 7.000 m² (sehr effizient durch Sanierung)
    area: 7000, // 7.000 m²
    specialFeatures: {
      buildYear: 1970,
      lastRenovation: 2020,
      renovationStatus: 'completed',
      kfwStandard: 'KfW-55',
      studentCount: 800
    },
    energyClass: 'A'
  },
  {
    id: 'grundschule-hechingen',
    name: 'Grundschule Hechingen',
    type: 'grundschule',
    address: 'Schulgasse 9, 72379 Hechingen',
    capacity: 250,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 400000, // 400.000 kWh/Jahr
    savingsPotential: {
      kwh: 80000, // 20% Einsparung
      euro: 17040, // bei 0,213 €/kWh
      percentage: 20
    },
    kwhPerSquareMeter: 80, // 400.000 kWh / 5.000 m²
    area: 5000, // 5.000 m²
    specialFeatures: {
      buildYear: 1960,
      lastRenovation: 2015,
      renovationStatus: 'completed',
      studentCount: 450
    },
    energyClass: 'B'
  },
  {
    id: 'sporthallen-hechingen',
    name: 'Sporthallen Hechingen',
    type: 'sporthallen',
    address: 'Am Sportplatz 5, 72379 Hechingen',
    capacity: 180,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 250000, // 250.000 kWh/Jahr
    savingsPotential: {
      kwh: 50000, // 20% Einsparung
      euro: 10650, // bei 0,213 €/kWh
      percentage: 20
    },
    kwhPerSquareMeter: 83, // 250.000 kWh / 3.000 m²
    area: 3000, // 3.000 m²
    specialFeatures: {
      buildYear: 1985,
      lastRenovation: 2010,
      renovationStatus: 'none',
      sportFacilities: ['Turnhalle', 'Gymnastikhalle', 'Kraftraum']
    },
    energyClass: 'C'
  },
  {
    id: 'hallenbad-hechingen',
    name: 'Hallenbad Hechingen',
    type: 'hallenbad',
    address: 'Badstraße 12, 72379 Hechingen',
    capacity: 800,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 1200000, // 1.200.000 kWh/Jahr (HÖCHSTER VERBRAUCH!)
    savingsPotential: {
      kwh: 240000, // 20% Einsparung
      euro: 51120, // bei 0,213 €/kWh
      percentage: 20
    },
    kwhPerSquareMeter: 2000, // 1.200.000 kWh / 600 m² Wasserfläche
    area: 600, // 600 m² Wasserfläche
    specialFeatures: {
      buildYear: 1975,
      lastRenovation: 2012,
      renovationStatus: 'none',
      poolTemperature: 28,
      waterSurface: 600,
      poolHours: 'Mo-Fr 6:00-22:00, Sa-So 8:00-20:00'
    },
    energyClass: 'D'
  },
  {
    id: 'werkrealschule-hechingen',
    name: 'Werkrealschule Hechingen',
    type: 'werkrealschule',
    address: 'Industriestraße 8, 72379 Hechingen',
    capacity: 220,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 400000, // 400.000 kWh/Jahr
    savingsPotential: {
      kwh: 80000, // 20% Einsparung
      euro: 17040, // bei 0,213 €/kWh
      percentage: 20
    },
    kwhPerSquareMeter: 73, // 400.000 kWh / 5.500 m²
    area: 5500, // 5.500 m²
    specialFeatures: {
      buildYear: 1965,
      lastRenovation: 2008,
      renovationStatus: 'planned',
      studentCount: 150 // nur 150 Schüler
    },
    energyClass: 'C'
  },
  {
    id: 'gymnasium-hechingen',
    name: 'Gymnasium Hechingen',
    type: 'gymnasium',
    address: 'Zeppelinstraße 11, 72379 Hechingen',
    capacity: 350,
    status: 'online',
    lastUpdate: new Date().toISOString(),
    sensors: [],
    yearlyConsumption: 600000, // 600.000 kWh/Jahr
    savingsPotential: {
      kwh: 90000, // 15% Einsparung (Denkmalschutz begrenzt Maßnahmen)
      euro: 19170, // bei 0,213 €/kWh
      percentage: 15
    },
    kwhPerSquareMeter: 75, // 600.000 kWh / 8.000 m²
    area: 8000, // 8.000 m²
    specialFeatures: {
      buildYear: 1909, // historisches Gebäude
      lastRenovation: 2005,
      renovationStatus: 'planned',
      heritageProtection: true,
      studentCount: 1200
    },
    energyClass: 'C'
  }
];

// Mock Sensors für alle 7 Hechingen Gebäude
export const mockSensors: Sensor[] = [
  // RATHAUS HECHINGEN Sensors
  {
    id: 'energy-rathaus-hechingen',
    buildingId: 'rathaus-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 34.2,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 50 }
  },
  {
    id: 'temp-rathaus-hechingen',
    buildingId: 'rathaus-hechingen',
    type: 'temperature',
    name: 'Raumtemperatur Erdgeschoss',
    value: 22.1,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'services-rathaus-hechingen',
    buildingId: 'rathaus-hechingen',
    type: 'services',
    name: 'Bürgerdienste Online',
    value: 91.4,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  
  // REALSCHULE HECHINGEN Sensors (KfW-55 saniert)
  {
    id: 'energy-realschule-hechingen',
    buildingId: 'realschule-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 39.9,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 60 }
  },
  {
    id: 'renovation-realschule-hechingen',
    buildingId: 'realschule-hechingen',
    type: 'renovation',
    name: 'KfW-55 Effizienz',
    value: 95.2,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { description: 'KfW-55 Standard erreicht' }
  },
  {
    id: 'education-realschule-hechingen',
    buildingId: 'realschule-hechingen',
    type: 'education',
    name: 'Schüleranzahl aktiv',
    value: 800,
    unit: 'Schüler',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  
  // GRUNDSCHULE HECHINGEN Sensors
  {
    id: 'energy-grundschule-hechingen',
    buildingId: 'grundschule-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 45.6,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 70 }
  },
  {
    id: 'education-grundschule-hechingen',
    buildingId: 'grundschule-hechingen',
    type: 'education',
    name: 'Schüleranzahl aktiv',
    value: 450,
    unit: 'Schüler',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'temp-grundschule-hechingen',
    buildingId: 'grundschule-hechingen',
    type: 'temperature',
    name: 'Klassenraum Temperatur',
    value: 21.8,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  
  // SPORTHALLEN HECHINGEN Sensors
  {
    id: 'energy-sporthallen-hechingen',
    buildingId: 'sporthallen-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 28.5,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 45 }
  },
  {
    id: 'sports-sporthallen-hechingen',
    buildingId: 'sporthallen-hechingen',
    type: 'sports',
    name: 'Hallen in Nutzung',
    value: 2,
    unit: 'Hallen',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'occupancy-sporthallen-hechingen',
    buildingId: 'sporthallen-hechingen',
    type: 'occupancy',
    name: 'Auslastung',
    value: 67,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  
  // HALLENBAD HECHINGEN Sensors (HÖCHSTER VERBRAUCH!)
  {
    id: 'energy-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 137.0,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 180, description: 'Höchster Verbrauch aller Gebäude' }
  },
  {
    id: 'pool-temp-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'pool',
    name: 'Schwimmbecken Temperatur',
    value: 28.2,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Schwimmbecken', critical: true, alertThreshold: 30 }
  },
  {
    id: 'pool-temp-kids-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'pool',
    name: 'Kinderbecken Temperatur',
    value: 32.1,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Kinderbecken' }
  },
  {
    id: 'pump-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'pump',
    name: 'Umwälzpumpen Status',
    value: 98.5,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { critical: true }
  },
  {
    id: 'visitors-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'visitors',
    name: 'Besucherzahl heute',
    value: 156,
    unit: 'Besucher',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'water-quality-hallenbad-hechingen',
    buildingId: 'hallenbad-hechingen',
    type: 'water_quality',
    name: 'Wasserqualität',
    value: 94.2,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { critical: true }
  },
  
  // WERKREALSCHULE HECHINGEN Sensors
  {
    id: 'energy-werkrealschule-hechingen',
    buildingId: 'werkrealschule-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 45.6,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 70 }
  },
  {
    id: 'education-werkrealschule-hechingen',
    buildingId: 'werkrealschule-hechingen',
    type: 'education',
    name: 'Schüleranzahl aktiv',
    value: 150,
    unit: 'Schüler',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'occupancy-werkrealschule-hechingen',
    buildingId: 'werkrealschule-hechingen',
    type: 'occupancy',
    name: 'Gebäude Auslastung',
    value: 35,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { description: 'Geringe Auslastung durch wenige Schüler' }
  },
  
  // GYMNASIUM HECHINGEN Sensors (Denkmalschutz)
  {
    id: 'energy-gymnasium-hechingen',
    buildingId: 'gymnasium-hechingen',
    type: 'energy',
    name: 'Stromverbrauch Gesamt',
    value: 68.5,
    unit: 'kWh',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { location: 'Hauptzähler', critical: true, alertThreshold: 90 }
  },
  {
    id: 'heritage-gymnasium-hechingen',
    buildingId: 'gymnasium-hechingen',
    type: 'heritage',
    name: 'Denkmalschutz Status',
    value: 100,
    unit: '%',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { description: 'Gebäude von 1909 unter Denkmalschutz' }
  },
  {
    id: 'education-gymnasium-hechingen',
    buildingId: 'gymnasium-hechingen',
    type: 'education',
    name: 'Schüleranzahl aktiv',
    value: 1200,
    unit: 'Schüler',
    status: 'active',
    lastReading: new Date().toISOString(),
  },
  {
    id: 'temp-gymnasium-hechingen',
    buildingId: 'gymnasium-hechingen',
    type: 'temperature',
    name: 'Historisches Gebäude Temperatur',
    value: 20.8,
    unit: '°C',
    status: 'active',
    lastReading: new Date().toISOString(),
    metadata: { description: 'Begrenzte Heizoptionen durch Denkmalschutz' }
  },
];

// Generate additional sensors to reach 745 total sensors for realistic admin interface
const generateAdditionalSensors = (): Sensor[] => {
  const additionalSensors: Sensor[] = [];
  const sensorTypes = ['temperature', 'humidity', 'energy', 'occupancy', 'security', 'environment'];
  
  mockBuildings.forEach(building => {
    // Add 100+ sensors per building to simulate realistic sensor density
    for (let i = 1; i <= 100; i++) {
      const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)] as any;
      const baseValue = Math.random() * 100;
      
      additionalSensors.push({
        id: `${building.id}-sensor-${i}`,
        buildingId: building.id,
        type: sensorType,
        name: `${getSensorTypeName(sensorType)} ${i}`,
        value: Math.round(baseValue * 100) / 100,
        unit: getSensorUnit(sensorType),
        status: Math.random() > 0.05 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'error'),
        lastReading: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24h
        metadata: {
          location: `${getRandomLocation()} ${i}`,
          critical: Math.random() > 0.8,
          alertThreshold: Math.random() > 0.7 ? baseValue * 1.2 : undefined,
          description: `Automatisch generierter ${getSensorTypeName(sensorType)} Sensor`
        }
      });
    }
  });
  
  return additionalSensors;
};

const getSensorTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    temperature: 'Temperatursensor',
    humidity: 'Luftfeuchtigkeit',
    energy: 'Energiezähler',
    occupancy: 'Belegungssensor',
    security: 'Sicherheitssensor',
    environment: 'Umweltsensor'
  };
  return typeNames[type] || 'Sensor';
};

const getSensorUnit = (type: string): string => {
  const units: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    energy: 'kWh',
    occupancy: '%',
    security: 'Status',
    environment: 'Index'
  };
  return units[type] || 'Unit';
};

const getRandomLocation = (): string => {
  const locations = [
    'Erdgeschoss', 'Obergeschoss', 'Keller', 'Dachgeschoss', 
    'Haupteingang', 'Nebeneingang', 'Flur', 'Treppenhaus',
    'Büro', 'Klassenraum', 'Verwaltung', 'Technikraum'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

// Combine original sensors with generated ones to reach 745+ total
export const allMockSensors: Sensor[] = [
  ...mockSensors,
  ...generateAdditionalSensors()
];

// Original mockSensors are already exported above

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
        const timeMultiplier = getTimeMultiplier(hour, bId);
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
const getTimeMultiplier = (hour: number, buildingId: string): number => {
  // Hallenbad: 24/7 Betrieb mit konstant hoher Grundlast
  if (buildingId.includes('hallenbad')) {
    if (hour >= 6 && hour <= 21) return 1.0; // Öffnungszeiten
    return 0.8; // Nachts: Pumpen laufen weiter
  }
  
  // Schulen: Niedrig am Wochenende/Ferien, Peak zu Schulzeiten
  if (buildingId.includes('schule') || buildingId.includes('gymnasium')) {
    const isWeekend = new Date().getDay() >= 6;
    if (isWeekend) return 0.2; // Wochenende minimal
    if (hour >= 7 && hour <= 16) return 1.3; // Schulzeiten
    if (hour >= 16 && hour <= 18) return 0.6; // Nachmittags AGs
    return 0.1; // Nachts minimal
  }
  
  // Sporthallen: Abend-Peaks durch Vereinssport
  if (buildingId.includes('sporthallen')) {
    if (hour >= 17 && hour <= 22) return 1.4; // Vereinssport
    if (hour >= 8 && hour <= 16) return 0.8; // Schulsport
    return 0.2; // Nachts/früh minimal
  }
  
  // Rathaus: Bürozeiten-Muster
  if (buildingId.includes('rathaus')) {
    if (hour >= 7 && hour <= 18) return 1.1; // Bürozeiten
    return 0.3; // Außerhalb minimal
  }
  
  // Default pattern
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

// Mock Alerts für Hechingen
export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    buildingId: 'hallenbad-hechingen',
    type: 'critical',
    title: 'Hoher Stromverbrauch Hallenbad',
    message: 'Das Hallenbad verbraucht 35% des gesamten städtischen Energiebedarfs. Pumpenoptimierung empfohlen.',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    isRead: false,
    isResolved: false,
    priority: 'critical',
    source: 'Energy Monitor Hallenbad',
  },
  {
    id: 'alert-002',
    buildingId: 'gymnasium-hechingen',
    type: 'warning',
    title: 'Denkmalschutz Heizungsoptimierung',
    message: 'Historisches Gebäude von 1909 - begrenzte Sanierungsmöglichkeiten. Energieeffizienz bei 75 kWh/m².',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: true,
    isResolved: false,
    priority: 'medium',
    source: 'Heritage Monitoring',
  },
  {
    id: 'alert-003',
    buildingId: 'werkrealschule-hechingen',
    type: 'info',
    title: 'Geringe Gebäudeauslastung',
    message: 'Nur 150 Schüler bei 5.500 m² - Gebäudeauslastung 35%. Renovierung geplant für 2025.',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    isRead: false,
    isResolved: false,
    priority: 'low',
    source: 'Building Management',
  },
  {
    id: 'alert-004',
    buildingId: 'realschule-hechingen',
    type: 'info',
    title: 'KfW-55 Sanierung erfolgreich',
    message: 'Realschule erreicht 50 kWh/m² durch KfW-55 Sanierung. Beste Energieeffizienz aller Gebäude.',
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    isRead: false,
    isResolved: true,
    priority: 'low',
    source: 'Renovation System',
  },
  {
    id: 'alert-005',
    buildingId: 'sporthallen-hechingen',
    type: 'warning',
    title: 'Sporthallen Sanierung erforderlich',
    message: 'Baujahr 1985, letzte Renovierung 2010. Effizienzpotential 20% durch neue Beleuchtung.',
    timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    isRead: true,
    isResolved: false,
    priority: 'medium',
    source: 'Sports Facility Monitor',
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

// Mock Dashboard Stats für Hechingen
export const mockDashboardStats: DashboardStats = {
  totalEnergyProduced: 450.0, // kWh Solar production from all buildings
  totalEnergyConsumed: 3500.0, // Total current consumption: 3.500.000 kWh/Jahr
  totalCO2Saved: 225.0, // kg CO2 through efficiency measures
  totalBuildings: mockBuildings.length, // 7 Gebäude
  activeAlerts: mockAlerts.filter(a => !a.isResolved).length,
  systemEfficiency: 78.3, // Durchschnittliche Effizienz aller Gebäude
  trends: {
    energyProduction: 15.4, // Solar ausbau
    energyConsumption: -12.7, // Einsparungen durch KfW-55 Realschule
    efficiency: 8.9, // Verbesserung durch Sanierungen
    co2Savings: 18.5, // CO2 Reduktion durch Effizienzmaßnahmen
  },
};

// Authentication credentials for mock login
export const mockCredentials = {
  admin: { email: 'admin@citypulse.com', password: 'admin123' },
  manager: { email: 'manager@citypulse.com', password: 'manager123' },
  user: { email: 'user@citypulse.com', password: 'user123' },
  buergermeister: { email: 'buergermeister@citypulse.com', password: 'citypulse123' },
  gebaeudemanager: { email: 'gebaeude.manager@citypulse.com', password: 'citypulse123' },
  buerger: { email: 'buerger@citypulse.com', password: 'citypulse123' },
};

// Update sensors in buildings
mockBuildings.forEach(building => {
  building.sensors = mockSensors.filter(sensor => sensor.buildingId === building.id);
});