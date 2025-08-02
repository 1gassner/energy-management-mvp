# Services Dokumentation

## 📚 Übersicht

Das Energy Management MVP nutzt eine flexible Service-Architektur mit Factory Pattern für einfaches Switching zwischen Mock- und Real-Services. Alle Services sind vollständig typisiert und logging-integriert.

## 🏗️ Service-Architektur

### Service Factory Pattern
**Datei**: `src/services/serviceFactory.ts`

Zentrale Factory für Environment-basierte Service-Erstellung.

#### Architektur-Vorteile
- **Environment-basiert**: Automatisches Mock/Real switching
- **Development Tools**: Debug-Tools für Development
- **Konfigurierbar**: Umfassende Konfigurationsmöglichkeiten
- **Typsicher**: Vollständige TypeScript-Unterstützung

#### Service Factory Configuration
```typescript
interface MockConfig {
  useMockData: boolean;           // Mock vs Real Services
  mockDelay: number;             // Simulate network latency
  failureRate: number;           // Simulate network failures (0-1)
  webSocketEnabled: boolean;     // Enable/disable WebSocket
}
```

#### Environment Variables
```bash
# .env.local Configuration
VITE_USE_MOCK_DATA=true         # Enable mock mode
VITE_MOCK_DELAY=800             # Mock API delay in ms
VITE_MOCK_FAILURE_RATE=0        # Mock failure rate (0-1)
VITE_WS_ENABLED=true            # Enable WebSocket
VITE_API_URL=http://localhost:3001  # Real API endpoint
VITE_WS_URL=ws://localhost:3001     # Real WebSocket endpoint
```

#### Service Creation
```typescript
// Factory Usage
const serviceFactory = new DefaultServiceFactory();

// Service Instances
export const apiService = serviceFactory.createAPIService();
export const webSocketService = serviceFactory.createWebSocketService();
```

#### Development Debug Tools
In Development Mode verfügbar über `window.debugEnergy`:

```javascript
// Console Debug Commands
window.debugEnergy.switchToMock()     // Switch to mock mode
window.debugEnergy.switchToReal()     // Switch to real API mode
window.debugEnergy.simulateIssues()   // Simulate network issues
window.debugEnergy.triggerAlert('rathaus', 'critical')  // Trigger test alert
window.debugEnergy.getConfig()        // Get current configuration
window.debugEnergy.isMock()          // Check if in mock mode
```

## 🌐 WebSocket Service

### Unified WebSocket Interface
**Interface**: `src/types/api.ts`

```typescript
interface IWebSocketService {
  // Connection Management
  connect(): void;
  disconnect(): void;
  readonly isConnected: boolean;
  readonly connectionState: string;
  
  // Subscription Management
  subscribe(type: string, callback: (data: unknown) => void): string;
  unsubscribe(id: string): void;
  
  // Messaging
  send(message: WebSocketMessage): void;
  
  // Connection Events
  onConnectionChange(callback: (connected: boolean) => void): () => void;
}
```

### Mock WebSocket Service
**Datei**: `src/services/mock/mockWebSocketService.ts`

Vollständig simulierter WebSocket Service für Development und Testing.

#### Features
- **Real-time Simulation**: Realistische Datenströme
- **Configurable Updates**: Einstellbare Update-Intervalle
- **Connection Simulation**: Simuliert Verbindungsabbrüche
- **Alert Simulation**: Künstliche Alert-Generierung
- **Debug Integration**: Umfassendes Logging

#### Simulated Message Types
```typescript
// Energy Updates
{
  type: 'energy_update',
  payload: {
    buildingId: string,
    totalEnergy: number,
    co2Saved: number
  }
}

// Sensor Data
{
  type: 'sensor_data',
  payload: {
    sensorId: string,
    value: number,
    timestamp: string,
    unit: string
  }
}

// System Alerts
{
  type: 'alert',
  payload: {
    buildingId: string,
    alertCount: number,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  }
}

// Building Status
{
  type: 'building_status',
  payload: {
    buildingId: string,
    status: 'online' | 'maintenance' | 'offline'
  }
}
```

#### Simulation Control
```typescript
// Manual control methods
mockWebSocketService.setUpdateInterval(5000);        // Update every 5 seconds
mockWebSocketService.simulateConnectionLoss();       // Simulate disconnect/reconnect
mockWebSocketService.triggerAlert('rathaus', 'high'); // Manual alert trigger
```

### Real WebSocket Service
**Datei**: `src/services/api/realWebSocketService.ts`

Production WebSocket Service für reale Backend-Verbindungen.

#### Features
- **Automatic Reconnection**: Resiliente Verbindungsverwaltung
- **Heart-beat Monitoring**: Connection health checking
- **Message Queuing**: Offline-Message-Queuing
- **Error Recovery**: Graceful error handling

## 📊 API Service

### API Service Interface
```typescript
interface IAPIService {
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshUser(): Promise<User>;
  
  // Dashboard Data
  getDashboardStats(): Promise<DashboardStats>;
  getEnergyData(buildingId: string, timeRange: string): Promise<EnergyData[]>;
  
  // Building Management
  getBuildings(): Promise<Building[]>;
  getBuildingData(buildingId: string): Promise<BuildingData>;
  
  // Alerts
  getAlerts(buildingId?: string): Promise<Alert[]>;
  resolveAlert(alertId: string): Promise<void>;
  
  // Analytics
  getAnalytics(params: AnalyticsParams): Promise<AnalyticsData>;
}
```

### Mock API Service
**Datei**: `src/services/mock/mockApiService.ts`

Vollständig funktionale API-Simulation mit realistischen Daten.

#### Features
- **Realistic Data**: Dynamische Mock-Daten
- **Configurable Latency**: Simulierte Netzwerk-Latenz
- **Error Simulation**: Konfigurierbarer Fehler-Rate
- **Persistent State**: Session-basierte Datenpersistenz

#### Configuration Methods
```typescript
// Mock Service Configuration
mockAPIService.setMockDelay(1200);      // Set response delay
mockAPIService.setFailureRate(0.1);     // Set 10% failure rate
mockAPIService.resetData();             // Reset to default data
```

### Real API Service
**Datei**: `src/services/api/realApiService.ts`

Production API Service mit HTTP-Client und Error Handling.

#### Features
- **HTTP Client**: Axios-basierte API-Kommunikation
- **Request Interceptors**: Automatische Auth-Header
- **Response Interceptors**: Error handling und logging
- **Retry Logic**: Automatic retry für failed requests

## 📝 Logger Service

### Logger Architecture
**Datei**: `src/utils/logger.ts`

Professional logging service mit environment-basierter Konfiguration.

#### Features
- **Environment-based Levels**: Development vs Production logging
- **Structured Logging**: JSON-basierte Log-Strukturen
- **External Integration**: Vorbereitet für Sentry/LogRocket
- **Type Safety**: Vollständig typisiert

#### Log Levels
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Level Hierarchy (Production filtert automatisch)
debug (0) -> info (1) -> warn (2) -> error (3)
```

#### Logger Configuration
```typescript
interface LoggerConfig {
  level: LogLevel;                    // Minimum log level
  enableConsole: boolean;             // Console output
  enableStructured: boolean;          // JSON structure
  environment: 'development' | 'production' | 'test';
}
```

#### Environment Variables
```bash
# Logger Configuration
VITE_LOG_LEVEL=debug               # Minimum log level
VITE_ENABLE_CONSOLE_LOGS=true      # Console logging
VITE_ENABLE_STRUCTURED_LOGS=false  # Structured logging
VITE_LOG_ENDPOINT=                 # External logging endpoint
```

#### Usage Examples
```typescript
import { logger } from '@/utils/logger';

// Basic logging
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);

// Context logging
logger.info('User action', { 
  userId: user.id, 
  action: 'dashboard_view',
  timestamp: Date.now()
});

// Child logger with context
const authLogger = logger.child({ module: 'auth' });
authLogger.info('Login attempt', { email: user.email });

// Error logging with stack trace
logger.error('API call failed', { 
  endpoint: '/api/energy', 
  status: 500 
}, error);
```

#### Production Integration
```typescript
// Automated error reporting (production)
if (import.meta.env.VITE_SENTRY_DSN) {
  // Automatic Sentry integration
  logger.error('Critical error', context, error);
  // -> Automatically sent to Sentry
}

// External logging endpoint
if (import.meta.env.VITE_LOG_ENDPOINT) {
  // Structured logs sent to external service
  // (DataDog, LogRocket, custom endpoint)
}
```

#### Logger Best Practices
```typescript
// 1. Use appropriate log levels
logger.debug('Variable value', { value });        // Development only
logger.info('User action completed');             // General information
logger.warn('Deprecated feature used');          // Warnings
logger.error('Operation failed', error);         // Errors

// 2. Include relevant context
logger.info('WebSocket connected', { 
  url: wsUrl, 
  reconnectAttempt: attemptNumber 
});

// 3. Use child loggers for modules
const componentLogger = logger.child({ component: 'DashboardCard' });
componentLogger.debug('Rendering with props', { props });

// 4. Structure error information
logger.error('API request failed', {
  method: 'POST',
  url: endpoint,
  status: response.status,
  duration: Date.now() - startTime
}, error);
```

## 🔔 Notification Service

### Notification Architecture
**Datei**: `src/services/notification.service.ts`

Toast-basierte Benutzerbenachrichtigungen mit react-hot-toast.

#### Features
- **Multiple Types**: Success, Error, Warning, Info notifications
- **Configurable**: Position, duration, styling
- **Promise Integration**: Automatic promise-based notifications
- **Dismissible**: Manual und automatic dismissal

#### Notification Types
```typescript
// Success notifications
notificationService.success('Daten erfolgreich gespeichert');

// Error notifications
notificationService.error('Fehler beim Laden der Daten');

// Warning notifications
notificationService.warning('Hoher Energieverbrauch erkannt');

// Info notifications
notificationService.info('System-Update verfügbar');

// Loading states
const loadingId = notificationService.loading('Lade Daten...');
// Later: notificationService.dismiss(loadingId);
```

#### Advanced Usage
```typescript
// Promise-based notifications
notificationService.promise(
  apiService.saveEnergyData(data),
  {
    loading: 'Speichere Energiedaten...',
    success: 'Daten erfolgreich gespeichert!',
    error: 'Fehler beim Speichern der Daten'
  }
);

// Custom positioning and duration
notificationService.success('Aktion erfolgreich', {
  duration: 5000,
  position: 'bottom-center'
});

// Dismiss all notifications
notificationService.dismiss();
```

## 🔧 Service Integration Patterns

### React Hook Integration
Services sind für React Hooks optimiert:

```typescript
// useWebSocket Hook
const { isConnected, connectionState } = useWebSocket('energy_update', {
  onMessage: handleEnergyUpdate,
  onConnect: () => notificationService.success('Connected'),
  onDisconnect: () => notificationService.warning('Disconnected'),
  autoConnect: true
});

// Auth Store Integration
const { login, logout, user } = useAuthStore();

// API Service mit Error Handling
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await apiService.getDashboardStats();
    // Handle success
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMessage);
    logger.error('Failed to load dashboard data', err as Error);
    notificationService.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Error Handling Strategy
```typescript
// Unified Error Handling
class ServiceError extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Service Error Wrapper
const handleServiceError = (error: unknown, service: string, operation: string): ServiceError => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const serviceError = new ServiceError(message, service, operation, error as Error);
  
  logger.error(`${service} service error`, {
    service,
    operation,
    error: message
  }, error as Error);
  
  return serviceError;
};
```

## 📊 Performance Monitoring

### Service Performance Metrics
```typescript
// Performance Tracking
class PerformanceLogger {
  static trackAPICall<T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then(result => {
        const duration = performance.now() - startTime;
        logger.info(`API call completed`, {
          operation,
          duration: Math.round(duration),
          status: 'success'
        });
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        logger.error(`API call failed`, {
          operation,
          duration: Math.round(duration),
          status: 'error'
        }, error);
        throw error;
      });
  }
}

// Usage
const data = await PerformanceLogger.trackAPICall(
  'getDashboardStats',
  () => apiService.getDashboardStats()
);
```

### WebSocket Performance
```typescript
// Connection Monitoring
class ConnectionMonitor {
  private static connectionTimes: Map<string, number> = new Map();
  
  static trackConnection(serviceId: string, isConnected: boolean) {
    if (isConnected) {
      this.connectionTimes.set(serviceId, Date.now());
    } else {
      const startTime = this.connectionTimes.get(serviceId);
      if (startTime) {
        const duration = Date.now() - startTime;
        logger.info('WebSocket session ended', {
          serviceId,
          sessionDuration: duration,
          sessionDurationMinutes: Math.round(duration / 60000)
        });
        this.connectionTimes.delete(serviceId);
      }
    }
  }
}
```

## 🧪 Testing Services

### Service Testing Strategy
```typescript
// Mock Service Testing
describe('MockAPIService', () => {
  beforeEach(() => {
    mockAPIService.resetData();
    mockAPIService.setMockDelay(0);
    mockAPIService.setFailureRate(0);
  });

  test('should return dashboard stats', async () => {
    const stats = await mockAPIService.getDashboardStats();
    expect(stats).toHaveProperty('totalEnergyProduced');
    expect(stats).toHaveProperty('totalEnergyConsumed');
  });

  test('should simulate network errors', async () => {
    mockAPIService.setFailureRate(1); // 100% failure rate
    
    await expect(mockAPIService.getDashboardStats())
      .rejects.toThrow('Simulated network error');
  });
});

// WebSocket Service Testing
describe('MockWebSocketService', () => {
  test('should connect and receive messages', async () => {
    const messages: any[] = [];
    
    mockWebSocketService.subscribe('energy_update', (data) => {
      messages.push(data);
    });
    
    mockWebSocketService.connect();
    mockWebSocketService.triggerAlert('test', 'high');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(messages.length).toBeGreaterThan(0);
  });
});
```

## 🚀 Production Deployment

### Service Configuration für Production
```typescript
// Production Service Factory
const productionFactory = new DefaultServiceFactory();

// Production configuration
productionFactory.updateMockConfig({
  useMockData: false,
  webSocketEnabled: true,
  mockDelay: 0,
  failureRate: 0
});

// Real services für production
export const apiService = productionFactory.createAPIService();
export const webSocketService = productionFactory.createWebSocketService();
```

### Environment-specific Settings
```bash
# Production .env
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.energy-management.com
VITE_WS_URL=wss://ws.energy-management.com
VITE_LOG_LEVEL=warn
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_STRUCTURED_LOGS=true
VITE_LOG_ENDPOINT=https://logs.energy-management.com/api/logs
VITE_SENTRY_DSN=https://your-sentry-dsn
```

## 📈 Monitoring & Observability

### Service Health Monitoring
```typescript
// Health Check Service
class HealthCheckService {
  static async checkServices(): Promise<ServiceHealth[]> {
    const checks: ServiceHealth[] = [];
    
    // API Service Health
    try {
      await apiService.getDashboardStats();
      checks.push({ service: 'API', status: 'healthy', latency: 0 });
    } catch (error) {
      checks.push({ service: 'API', status: 'unhealthy', error: error.message });
    }
    
    // WebSocket Health
    checks.push({
      service: 'WebSocket',
      status: webSocketService.isConnected ? 'healthy' : 'unhealthy',
      connectionState: webSocketService.connectionState
    });
    
    return checks;
  }
}
```

Die Services bilden das Rückgrat der Energy Management MVP mit robuster Architektur, umfassendem Error Handling und optimaler Developer Experience.