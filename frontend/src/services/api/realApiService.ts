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
import { DashboardStats, ApiResponse } from '@/types/api';

class RealAPIService implements IAPIService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data.data;
  }

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setToken(response.token);
    return response;
  }

  async refreshUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  // Energy Data Methods
  async getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]> {
    const params = new URLSearchParams();
    if (buildingId) params.append('buildingId', buildingId);
    if (period) params.append('period', period);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<EnergyData[]>(`/energy${query}`);
  }

  async getLatestEnergyData(buildingId: string): Promise<EnergyData> {
    return this.request<EnergyData>(`/energy/latest/${buildingId}`);
  }

  // Building Methods
  async getBuildings(): Promise<Building[]> {
    return this.request<Building[]>('/buildings');
  }

  async getBuilding(id: string): Promise<Building> {
    return this.request<Building>(`/buildings/${id}`);
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    return this.request<Building>(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Sensor Methods
  async getSensors(buildingId?: string): Promise<Sensor[]> {
    const query = buildingId ? `?buildingId=${buildingId}` : '';
    return this.request<Sensor[]>(`/sensors${query}`);
  }

  async getSensor(id: string): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`);
  }

  async updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Alert Methods
  async getAlerts(buildingId?: string): Promise<Alert[]> {
    const query = buildingId ? `?buildingId=${buildingId}` : '';
    return this.request<Alert[]>(`/alerts${query}`);
  }

  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`);
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/read`, {
      method: 'PATCH',
    });
  }

  async resolveAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/resolve`, {
      method: 'PATCH',
    });
  }

  // Analytics Methods
  async getAnalytics(period: 'day' | 'week' | 'month' | 'year', buildingId?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams({ period });
    if (buildingId) params.append('buildingId', buildingId);
    
    return this.request<AnalyticsData>(`/analytics?${params.toString()}`);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }
}

export const realAPIService = new RealAPIService();