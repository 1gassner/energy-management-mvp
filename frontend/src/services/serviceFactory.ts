import { ServiceFactory, IAPIService, IWebSocketService, MockConfig } from '@/types/api';
import { mockAPIService } from './mock/mockApiService';
import { mockWebSocketService } from './mock/mockWebSocketService';
import { realAPIService } from './api/realApiService';
import { realWebSocketService } from './api/realWebSocketService';
import { logger } from '@/utils/logger';

class DefaultServiceFactory implements ServiceFactory {
  private mockConfig: MockConfig;

  constructor() {
    this.mockConfig = this.loadMockConfig();
    this.logConfiguration();
  }

  private loadMockConfig(): MockConfig {
    const useMockData = this.parseBooleanEnv(import.meta.env.VITE_USE_MOCK_DATA, true);
    const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';
    const hasApiUrl = import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('your-domain.com');
    
    // Force mock mode if no valid API URL is provided
    const shouldUseMock = useMockData || isDevelopment || !hasApiUrl;
    
    return {
      useMockData: shouldUseMock,
      mockDelay: parseInt(import.meta.env.VITE_MOCK_DELAY || '500', 10),
      failureRate: parseFloat(import.meta.env.VITE_MOCK_FAILURE_RATE || '0'),
      webSocketEnabled: this.parseBooleanEnv(import.meta.env.VITE_WS_ENABLED, true),
    };
  }

  private parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined || value === '') return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  private logConfiguration(): void {
    const config = {
      useMockData: this.mockConfig.useMockData,
      mockDelay: this.mockConfig.mockDelay,
      failureRate: this.mockConfig.failureRate,
      webSocketEnabled: this.mockConfig.webSocketEnabled,
      environment: import.meta.env.VITE_APP_ENV,
      apiUrl: import.meta.env.VITE_API_URL,
      wsUrl: import.meta.env.VITE_WS_URL,
      mode: this.mockConfig.useMockData ? 'MOCK MODE' : 'REAL API MODE',
    };
    
    logger.info('🔧 Service Factory Configuration', config);
    
    if (this.mockConfig.useMockData) {
      logger.info('✅ Using Mock Services - No real API calls will be made');
    } else {
      logger.warn('⚠️ Using Real API Services - Make sure API is available');
    }
  }

  createAPIService(): IAPIService {
    if (this.mockConfig.useMockData) {
      logger.info('Using Mock API Service');
      
      // Configure mock service
      mockAPIService.setMockDelay(this.mockConfig.mockDelay);
      mockAPIService.setFailureRate(this.mockConfig.failureRate);
      
      return mockAPIService;
    } else {
      logger.info('Using Real API Service');
      return realAPIService;
    }
  }

  createWebSocketService(): IWebSocketService {
    if (this.mockConfig.useMockData) {
      logger.info('Using Mock WebSocket Service');
      return mockWebSocketService;
    } else {
      logger.info('Using Real WebSocket Service');
      return realWebSocketService;
    }
  }

  isMockMode(): boolean {
    return this.mockConfig.useMockData;
  }

  // Configuration methods
  getMockConfig(): MockConfig {
    return { ...this.mockConfig };
  }

  updateMockConfig(updates: Partial<MockConfig>): void {
    this.mockConfig = { ...this.mockConfig, ...updates };
    logger.info('Mock configuration updated', this.mockConfig);
    
    // Update services if needed
    if (this.mockConfig.useMockData) {
      mockAPIService.setMockDelay(this.mockConfig.mockDelay);
      mockAPIService.setFailureRate(this.mockConfig.failureRate);
    }
  }

  // Development helper methods
  switchToMockMode(): void {
    this.mockConfig.useMockData = true;
    logger.info('Switched to Mock Mode');
  }

  switchToRealMode(): void {
    this.mockConfig.useMockData = false;
    logger.info('Switched to Real Mode');
  }

  // Mock service control methods (only available in mock mode)
  getMockAPIService() {
    return this.mockConfig.useMockData ? mockAPIService : null;
  }

  getMockWebSocketService() {
    return this.mockConfig.useMockData ? mockWebSocketService : null;
  }

  // Testing helpers
  simulateNetworkIssues(enabled: boolean = true): void {
    if (this.mockConfig.useMockData) {
      this.updateMockConfig({
        mockDelay: enabled ? 3000 : 800,
        failureRate: enabled ? 0.1 : 0,
      });
      
      const mockWS = this.getMockWebSocketService();
      if (mockWS && enabled) {
        mockWS.simulateConnectionLoss();
      }
    }
  }

  triggerTestAlert(buildingId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    if (this.mockConfig.useMockData) {
      const mockWS = this.getMockWebSocketService();
      if (mockWS) {
        mockWS.triggerAlert(buildingId, severity);
      }
    }
  }
}

// Global service factory instance
export const serviceFactory = new DefaultServiceFactory();

// Convenience exports for direct use
export const apiService = serviceFactory.createAPIService();
export const webSocketService = serviceFactory.createWebSocketService();

// Development tools (only available in development)
if (import.meta.env.DEV) {
  // Expose factory to window for debugging
  (window as any).serviceFactory = serviceFactory;
  
  // Add convenient debug functions
  (window as any).debugEnergy = {
    switchToMock: () => serviceFactory.switchToMockMode(),
    switchToReal: () => serviceFactory.switchToRealMode(),
    simulateIssues: (enabled: boolean = true) => serviceFactory.simulateNetworkIssues(enabled),
    triggerAlert: (buildingId: string, severity?: 'low' | 'medium' | 'high' | 'critical') => 
      serviceFactory.triggerTestAlert(buildingId, severity),
    getConfig: () => serviceFactory.getMockConfig(),
    isMock: () => serviceFactory.isMockMode(),
  };
  
  logger.info('Debug tools available: window.debugEnergy', {
    switchToMock: 'Switch to mock mode',
    switchToReal: 'Switch to real API mode',
    simulateIssues: 'Simulate network issues',
    triggerAlert: 'Trigger test alert',
    getConfig: 'Get current configuration',
    isMock: 'Check if in mock mode',
  });
}