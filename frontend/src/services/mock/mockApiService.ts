import { IAPIService } from '@/types/api';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  EnergyData, 
  Building, 
  Sensor, 
  Alert, 
  AnalyticsData 
} from '@/types';
import { DashboardStats } from '@/types/api';
import {
  mockUsers,
  mockBuildings,
  mockSensors,
  mockAlerts,
  generateMockEnergyData,
  generateMockAnalytics,
  mockDashboardStats,
  mockCredentials
} from './mockData';
import { logger } from '@/utils/logger';

class MockAPIService implements IAPIService {
  private mockDelay: number = 800; // Simulate network delay
  private failureRate: number = 0; // 0% failure rate for development

  private async simulateDelay<T>(data: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
    
    // Simulate random failures for testing error handling
    if (Math.random() < this.failureRate) {
      throw new Error('Simulated network error');
    }
    
    return data;
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await this.simulateDelay(null);
    
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      Object.values(mockCredentials).some(cred => 
        cred.email === credentials.email && cred.password === credentials.password
      )
    );
    
    if (!user) {
      throw new Error('Ungültige Anmeldedaten');
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    return {
      user,
      token: `mock-jwt-token-${user.id}-${Date.now()}`
    };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await this.simulateDelay(null);
    
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwörter stimmen nicht überein');
    }
    
    if (data.password.length < 6) {
      throw new Error('Passwort muss mindestens 6 Zeichen lang sein');
    }
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('E-Mail-Adresse bereits registriert');
    }
    
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      name: data.name,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    // Add to mock users (in real app, this would be persisted)
    mockUsers.push(newUser);
    
    return {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`
    };
  }

  async refreshUser(): Promise<User> {
    await this.simulateDelay(null);
    
    // In a real app, you would validate the token and fetch fresh user data
    // For mock, we'll simulate this by returning the first admin user
    const user = mockUsers.find(u => u.role === 'admin');
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }
    
    user.lastLogin = new Date().toISOString();
    return user;
  }

  async logout(): Promise<void> {
    await this.simulateDelay(null);
    // In a real app, you would invalidate the token server-side
    logger.info('Mock logout completed');
  }

  // Energy Data Methods
  async getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]> {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 7;
    const data = generateMockEnergyData(buildingId, days);
    return this.simulateDelay(data);
  }

  async getLatestEnergyData(buildingId: string): Promise<EnergyData> {
    const allData = generateMockEnergyData(buildingId, 1);
    const latestData = allData.find(d => d.buildingId === buildingId);
    
    if (!latestData) {
      throw new Error('Keine Energiedaten für dieses Gebäude gefunden');
    }
    
    return this.simulateDelay(latestData);
  }

  // Building Methods
  async getBuildings(): Promise<Building[]> {
    // Update sensors in buildings with latest data
    const buildingsWithSensors = mockBuildings.map(building => ({
      ...building,
      sensors: mockSensors.filter(sensor => sensor.buildingId === building.id),
      lastUpdate: new Date().toISOString(),
    }));
    
    return this.simulateDelay(buildingsWithSensors);
  }

  async getBuilding(id: string): Promise<Building> {
    const building = mockBuildings.find(b => b.id === id);
    if (!building) {
      throw new Error('Gebäude nicht gefunden');
    }
    
    const buildingWithSensors = {
      ...building,
      sensors: mockSensors.filter(sensor => sensor.buildingId === id),
      lastUpdate: new Date().toISOString(),
    };
    
    return this.simulateDelay(buildingWithSensors);
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    const buildingIndex = mockBuildings.findIndex(b => b.id === id);
    if (buildingIndex === -1) {
      throw new Error('Gebäude nicht gefunden');
    }
    
    mockBuildings[buildingIndex] = {
      ...mockBuildings[buildingIndex],
      ...data,
      lastUpdate: new Date().toISOString(),
    };
    
    return this.simulateDelay(mockBuildings[buildingIndex]);
  }

  // Sensor Methods
  async getSensors(buildingId?: string): Promise<Sensor[]> {
    const sensors = buildingId 
      ? mockSensors.filter(sensor => sensor.buildingId === buildingId)
      : mockSensors;
    
    // Update sensor values with some randomization
    const updatedSensors = sensors.map(sensor => ({
      ...sensor,
      value: this.updateSensorValue(sensor),
      lastReading: new Date().toISOString(),
    }));
    
    return this.simulateDelay(updatedSensors);
  }

  async getSensor(id: string): Promise<Sensor> {
    const sensor = mockSensors.find(s => s.id === id);
    if (!sensor) {
      throw new Error('Sensor nicht gefunden');
    }
    
    const updatedSensor = {
      ...sensor,
      value: this.updateSensorValue(sensor),
      lastReading: new Date().toISOString(),
    };
    
    return this.simulateDelay(updatedSensor);
  }

  async updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor> {
    const sensorIndex = mockSensors.findIndex(s => s.id === id);
    if (sensorIndex === -1) {
      throw new Error('Sensor nicht gefunden');
    }
    
    mockSensors[sensorIndex] = {
      ...mockSensors[sensorIndex],
      ...data,
      lastReading: new Date().toISOString(),
    };
    
    return this.simulateDelay(mockSensors[sensorIndex]);
  }

  // Alert Methods
  async getAlerts(buildingId?: string): Promise<Alert[]> {
    const alerts = buildingId 
      ? mockAlerts.filter(alert => alert.buildingId === buildingId)
      : mockAlerts;
    
    return this.simulateDelay(alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }

  async getAlert(id: string): Promise<Alert> {
    const alert = mockAlerts.find(a => a.id === id);
    if (!alert) {
      throw new Error('Alarm nicht gefunden');
    }
    
    return this.simulateDelay(alert);
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    const alertIndex = mockAlerts.findIndex(a => a.id === id);
    if (alertIndex === -1) {
      throw new Error('Alarm nicht gefunden');
    }
    
    mockAlerts[alertIndex].isRead = true;
    return this.simulateDelay(mockAlerts[alertIndex]);
  }

  async resolveAlert(id: string): Promise<Alert> {
    const alertIndex = mockAlerts.findIndex(a => a.id === id);
    if (alertIndex === -1) {
      throw new Error('Alarm nicht gefunden');
    }
    
    mockAlerts[alertIndex].isResolved = true;
    mockAlerts[alertIndex].isRead = true;
    return this.simulateDelay(mockAlerts[alertIndex]);
  }

  // Analytics Methods
  async getAnalytics(period: 'day' | 'week' | 'month' | 'year', buildingId?: string): Promise<AnalyticsData> {
    const analytics = generateMockAnalytics(period);
    
    // If buildingId is specified, adjust data accordingly
    if (buildingId) {
      const building = mockBuildings.find(b => b.id === buildingId);
      if (building) {
        const factor = building.capacity / 200; // Normalize based on capacity
        analytics.totalConsumption *= factor;
        analytics.totalProduction *= factor;
        analytics.totalSaved *= factor;
        analytics.co2Reduction *= factor;
      }
    }
    
    return this.simulateDelay(analytics);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Update real-time stats
    const stats = {
      ...mockDashboardStats,
      activeAlerts: mockAlerts.filter(a => !a.isResolved).length,
      totalBuildings: mockBuildings.length,
    };
    
    return this.simulateDelay(stats);
  }

  // Helper Methods
  private updateSensorValue(sensor: Sensor): number {
    // Add some realistic variation to sensor values
    const variation = 0.05; // 5% variation
    const change = (Math.random() - 0.5) * 2 * variation;
    
    let newValue = sensor.value * (1 + change);
    
    // Keep values within realistic bounds
    switch (sensor.type) {
      case 'temperature':
        newValue = Math.max(15, Math.min(30, newValue));
        break;
      case 'humidity':
        newValue = Math.max(30, Math.min(80, newValue));
        break;
      case 'battery':
        newValue = Math.max(0, Math.min(100, newValue));
        break;
      case 'energy':
      case 'solar':
        newValue = Math.max(0, newValue);
        break;
    }
    
    return Math.round(newValue * 100) / 100;
  }

  // Configuration Methods
  setMockDelay(delay: number): void {
    this.mockDelay = Math.max(0, delay);
  }

  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }
}

export const mockAPIService = new MockAPIService();