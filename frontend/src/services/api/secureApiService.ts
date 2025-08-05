/**
 * Secure API Service - Uses httpOnly cookies and CSRF protection
 */

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
import { securityService } from '@/services/securityService';

interface SecureRequestOptions extends RequestInit {
  requireAuth?: boolean;
  includeCsrfToken?: boolean;
}

class SecureAPIService implements IAPIService {
  private baseURL: string;
  private isAuthenticated: boolean = false;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    // Enforce HTTPS in production
    securityService.enforceHTTPS();
    
    // Check if we have an active session on initialization
    this.checkAuthStatus();
  }

  /**
   * Check authentication status by trying to fetch user data
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      await this.request<User>('/auth/me', { requireAuth: false });
      this.isAuthenticated = true;
    } catch {
      this.isAuthenticated = false;
    }
  }

  /**
   * Secure request wrapper with CSRF protection and httpOnly cookies
   */
  private async request<T>(
    endpoint: string, 
    options: SecureRequestOptions = {}
  ): Promise<T> {
    const { requireAuth = true, includeCsrfToken = true, ...requestOptions } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    };

    // Add CSRF token for state-changing operations
    if (includeCsrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestOptions.method || 'GET')) {
      const csrfToken = securityService.generateCSRFToken();
      (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
    }

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
        credentials: 'include', // Include httpOnly cookies
      });

      // Handle authentication errors
      if (response.status === 401) {
        this.isAuthenticated = false;
        throw new Error('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
      }

      if (response.status === 403) {
        throw new Error('Zugriff verweigert.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If we can't parse error JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Use secure error messages
        throw new Error(securityService.getSecureErrorMessage(errorMessage));
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(securityService.getSecureErrorMessage(data.error || 'API-Anfrage fehlgeschlagen'));
      }

      return data.data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
      }
      
      throw error;
    }
  }

  // Authentication Methods with enhanced security

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Check rate limiting
    const rateLimitCheck = securityService.checkRateLimit('login');
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toLocaleTimeString() : 'später';
      throw new Error(`Zu viele Anmeldeversuche. Versuchen Sie es um ${resetTime} erneut.`);
    }

    // Validate credentials
    const validation = securityService.validateLoginCredentials(credentials);
    if (!validation.valid) {
      throw new Error('Ungültige Anmeldedaten.');
    }

    // Sanitize inputs
    const sanitizedCredentials = {
      email: securityService.sanitizeInput(credentials.email).toLowerCase(),
      password: credentials.password // Don't sanitize password as it might remove valid chars
    };

    try {
      const response = await this.request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(sanitizedCredentials),
        requireAuth: false,
        includeCsrfToken: true,
      });

      this.isAuthenticated = true;
      
      // Note: Token is now stored in httpOnly cookie by the server
      // We return it for compatibility but it shouldn't be stored in localStorage
      return response;
    } catch (error) {
      // Ensure rate limiting is applied even on error
      securityService.checkRateLimit('login');
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Check rate limiting
    const rateLimitCheck = securityService.checkRateLimit('register');
    if (!rateLimitCheck.allowed) {
      throw new Error('Zu viele Registrierungsversuche. Bitte warten Sie.');
    }

    // Validate registration data
    const validation = securityService.validateRegistrationData(data);
    if (!validation.valid) {
      throw new Error(validation.errors[0] || 'Ungültige Registrierungsdaten.');
    }

    // Sanitize inputs
    const sanitizedData = {
      email: securityService.sanitizeInput(data.email).toLowerCase(),
      name: securityService.sanitizeInput(data.name),
      password: data.password, // Don't sanitize password
      confirmPassword: data.confirmPassword // Don't sanitize password
    };

    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
      requireAuth: false,
      includeCsrfToken: true,
    });

    this.isAuthenticated = true;
    return response;
  }

  async refreshUser(): Promise<User> {
    const user = await this.request<User>('/auth/me', {
      requireAuth: true,
      includeCsrfToken: false,
    });
    
    this.isAuthenticated = true;
    return user;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { 
        method: 'POST',
        requireAuth: false, // Allow logout even if token is expired
        includeCsrfToken: true,
      });
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.warn('Server logout failed:', error);
    } finally {
      this.isAuthenticated = false;
      
      // Clear any remaining client-side data
      sessionStorage.clear();
      
      // Clear CSRF tokens
      securityService.generateCSRFToken(); // This clears old tokens
    }
  }

  // Energy Data Methods with input validation
  
  async getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]> {
    const params = new URLSearchParams();
    
    if (buildingId) {
      const sanitizedBuildingId = securityService.sanitizeInput(buildingId);
      if (sanitizedBuildingId) {
        params.append('buildingId', sanitizedBuildingId);
      }
    }
    
    if (period) {
      const sanitizedPeriod = securityService.sanitizeInput(period);
      // Validate period is one of allowed values
      if (['day', 'week', 'month', 'year'].includes(sanitizedPeriod)) {
        params.append('period', sanitizedPeriod);
      }
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<EnergyData[]>(`/energy${query}`, {
      includeCsrfToken: false,
    });
  }

  async getLatestEnergyData(buildingId: string): Promise<EnergyData> {
    const sanitizedBuildingId = securityService.sanitizeInput(buildingId);
    if (!sanitizedBuildingId) {
      throw new Error('Ungültige Gebäude-ID');
    }
    
    return this.request<EnergyData>(`/energy/latest/${sanitizedBuildingId}`, {
      includeCsrfToken: false,
    });
  }

  // Building Methods with input validation

  async getBuildings(): Promise<Building[]> {
    return this.request<Building[]>('/buildings', {
      includeCsrfToken: false,
    });
  }

  async getBuilding(id: string): Promise<Building> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Gebäude-ID');
    }
    
    return this.request<Building>(`/buildings/${sanitizedId}`, {
      includeCsrfToken: false,
    });
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Gebäude-ID');
    }

    // Sanitize building data
    const sanitizedData: Partial<Building> = {};
    if (data.name) sanitizedData.name = securityService.sanitizeInput(data.name);
    // Copy other safe fields
    if (data.type) sanitizedData.type = data.type;
    if (data.status) sanitizedData.status = data.status;

    return this.request<Building>(`/buildings/${sanitizedId}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }

  // Sensor Methods with input validation

  async getSensors(buildingId?: string): Promise<Sensor[]> {
    let query = '';
    if (buildingId) {
      const sanitizedBuildingId = securityService.sanitizeInput(buildingId);
      if (sanitizedBuildingId) {
        query = `?buildingId=${sanitizedBuildingId}`;
      }
    }
    
    return this.request<Sensor[]>(`/sensors${query}`, {
      includeCsrfToken: false,
    });
  }

  async getSensor(id: string): Promise<Sensor> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Sensor-ID');
    }
    
    return this.request<Sensor>(`/sensors/${sanitizedId}`, {
      includeCsrfToken: false,
    });
  }

  async updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Sensor-ID');
    }

    // Sanitize sensor data
    const sanitizedData: Partial<Sensor> = {};
    if (data.name) sanitizedData.name = securityService.sanitizeInput(data.name);
    // Copy other safe fields
    if (data.type) sanitizedData.type = data.type;
    if (data.status) sanitizedData.status = data.status;
    if (data.buildingId) sanitizedData.buildingId = securityService.sanitizeInput(data.buildingId);

    return this.request<Sensor>(`/sensors/${sanitizedId}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }

  // Alert Methods

  async getAlerts(buildingId?: string): Promise<Alert[]> {
    let query = '';
    if (buildingId) {
      const sanitizedBuildingId = securityService.sanitizeInput(buildingId);
      if (sanitizedBuildingId) {
        query = `?buildingId=${sanitizedBuildingId}`;
      }
    }
    
    return this.request<Alert[]>(`/alerts${query}`, {
      includeCsrfToken: false,
    });
  }

  async getAlert(id: string): Promise<Alert> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Alert-ID');
    }
    
    return this.request<Alert>(`/alerts/${sanitizedId}`, {
      includeCsrfToken: false,
    });
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Alert-ID');
    }
    
    return this.request<Alert>(`/alerts/${sanitizedId}/read`, {
      method: 'PATCH',
    });
  }

  async resolveAlert(id: string): Promise<Alert> {
    const sanitizedId = securityService.sanitizeInput(id);
    if (!sanitizedId) {
      throw new Error('Ungültige Alert-ID');
    }
    
    return this.request<Alert>(`/alerts/${sanitizedId}/resolve`, {
      method: 'PATCH',
    });
  }

  // Analytics Methods

  async getAnalytics(period: 'day' | 'week' | 'month' | 'year', buildingId?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams({ period });
    
    if (buildingId) {
      const sanitizedBuildingId = securityService.sanitizeInput(buildingId);
      if (sanitizedBuildingId) {
        params.append('buildingId', sanitizedBuildingId);
      }
    }
    
    return this.request<AnalyticsData>(`/analytics?${params.toString()}`, {
      includeCsrfToken: false,
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats', {
      includeCsrfToken: false,
    });
  }

  // Security status methods

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getSecurityStatus() {
    return {
      isSecure: securityService.isSecureEnvironment(),
      isAuthenticated: this.isAuthenticated,
      hasValidSession: this.isAuthenticated
    };
  }
}

export const secureAPIService = new SecureAPIService();