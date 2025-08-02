# Development Guide - Energy Management MVP

Umfassendes Entwickler-Handbuch für die Energy Management MVP Plattform mit Best Practices, Code Standards und Development Workflows.

## 🚀 Quick Start für Entwickler

### Setup in 5 Minuten
```bash
# 1. Repository klonen und Dependencies installieren
git clone [repository-url]
cd Energy-Management-MVP/frontend
npm install

# 2. Environment konfigurieren
cp .env.example .env.local
# VITE_USE_MOCK_DATA=true für lokale Entwicklung

# 3. Development Server starten
npm run dev
# ➜ http://localhost:3000

# 4. Tests ausführen
npm run test
npm run test:coverage

# 5. Code Quality prüfen
npm run lint
npm run typecheck
```

## 📋 Code Standards

### TypeScript Guidelines

#### Strikte Typisierung
```typescript
// ✅ Gut: Explizite Typen
interface EnergyData {
  id: string;
  buildingId: string;
  consumption: number;
  timestamp: string;
}

const processEnergyData = (data: EnergyData[]): ProcessedData => {
  return data.map(item => ({
    ...item,
    efficiency: calculateEfficiency(item)
  }));
};

// ❌ Schlecht: any oder unbekannte Typen
const processData = (data: any) => {
  return data.map((item: any) => item.value);
};
```

#### Utility Types verwenden
```typescript
// Pick für Teilmengen von Interfaces
type CreateEnergyData = Pick<EnergyData, 'buildingId' | 'consumption'>;

// Partial für optionale Updates
type UpdateBuilding = Partial<Building>;

// Record für Key-Value Mappings
type BuildingStatusMap = Record<string, 'online' | 'offline'>;

// Generic Constraints
interface APIResponse<T extends Record<string, unknown>> {
  success: boolean;
  data: T;
}
```

### React Best Practices

#### Component Patterns
```typescript
// ✅ Functional Components mit TypeScript
interface DashboardCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  unit = '', 
  trend 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
```

#### Custom Hooks Pattern
```typescript
// ✅ Business Logic in Custom Hooks
interface UseEnergyDataReturn {
  data: EnergyData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useEnergyData = (buildingId?: string, period?: string): UseEnergyDataReturn => {
  const [data, setData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const energyData = await apiService.getEnergyData(buildingId, period);
      setData(energyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [buildingId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
```

#### Error Boundaries
```typescript
// Error Boundary für robuste Anwendungen
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component Error Boundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Styling Guidelines

#### Tailwind CSS Patterns
```typescript
// ✅ Consistent Spacing und Colors
const styles = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Cards
  card: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
  
  // Buttons
  button: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded font-medium',
    danger: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium'
  },
  
  // Status Colors
  status: {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100'
  }
};

// Responsive Design Patterns
const ResponsiveComponent = () => (
  <div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    lg:grid-cols-3 
    xl:grid-cols-4 
    gap-4 
    p-4
  ">
    {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3-4 columns */}
  </div>
);
```

## 🛠️ Development Workflow

### Git Workflow
```bash
# 1. Feature Branch erstellen
git checkout main
git pull origin main
git checkout -b feature/energy-analytics-dashboard

# 2. Development
# - Code ändern
# - Tests schreiben
# - Committen

# 3. Quality Checks vor Push
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test          # Unit Tests
npm run test:coverage # Coverage Check

# 4. Commit Guidelines (Conventional Commits)
git add .
git commit -m "feat(analytics): add energy consumption trends chart

- Add responsive line chart for energy trends
- Implement data filtering by time period
- Add loading states and error handling
- Tests: 95% coverage for analytics components"

# 5. Push und Pull Request
git push origin feature/energy-analytics-dashboard
# Erstelle Pull Request auf GitHub
```

### Commit Message Conventions
```bash
# Format: type(scope): description
#
# Types:
feat:     # Neue Features
fix:      # Bug Fixes
docs:     # Documentation
style:    # Code formatting (no logic changes)
refactor: # Code refactoring
test:     # Tests hinzufügen/ändern
chore:    # Build/Development tasks

# Examples:
feat(dashboard): add real-time energy monitoring
fix(auth): resolve token refresh issue
docs(api): update authentication endpoints
refactor(services): improve error handling
test(components): add integration tests for alerts
chore(deps): update React to v18.2.0
```

### Code Review Checklist
```markdown
## Code Review Checklist

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error scenarios covered
- [ ] Performance considerations

### Code Quality
- [ ] TypeScript types korrekt
- [ ] ESLint warnings resolved
- [ ] Code is readable and well-structured
- [ ] No console.log statements in production code

### Testing
- [ ] Unit tests added/updated
- [ ] Test coverage maintained (>85%)
- [ ] Integration tests where appropriate
- [ ] Manual testing completed

### Documentation
- [ ] Code comments for complex logic
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] TypeScript interfaces documented
```

## 🧪 Testing Strategy

### Test Structure
```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   └── charts/
│       ├── LazyLineChart.tsx
│       └── __tests__/
│           └── LazyLineChart.test.tsx
├── services/
│   ├── apiService.ts
│   └── __tests__/
│       └── apiService.test.ts
└── utils/
    ├── logger.ts
    └── __tests__/
        └── logger.test.ts
```

### Unit Testing Patterns
```typescript
// Component Testing mit React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardCard from '../DashboardCard';

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Energy Consumption',
    value: 145.7,
    unit: 'kWh'
  };

  it('renders title and value correctly', () => {
    render(<DashboardCard {...defaultProps} />);
    
    expect(screen.getByText('Energy Consumption')).toBeInTheDocument();
    expect(screen.getByText('145.7')).toBeInTheDocument();
    expect(screen.getByText('kWh')).toBeInTheDocument();
  });

  it('displays trend indicator when provided', () => {
    const trendProps = {
      ...defaultProps,
      trend: { value: 5.2, isPositive: true }
    };

    render(<DashboardCard {...trendProps} />);
    
    expect(screen.getByText('↗ 5.2%')).toBeInTheDocument();
    expect(screen.getByText('↗ 5.2%')).toHaveClass('text-green-600');
  });

  it('handles missing unit gracefully', () => {
    const { unit, ...propsWithoutUnit } = defaultProps;
    render(<DashboardCard {...propsWithoutUnit} />);
    
    expect(screen.getByText('145.7')).toBeInTheDocument();
    expect(screen.queryByText('kWh')).not.toBeInTheDocument();
  });
});
```

### Service Testing
```typescript
// API Service Testing
import { vi } from 'vitest';
import { mockAPIService } from '../mock/mockApiService';

describe('MockAPIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns user and token for valid credentials', async () => {
      const credentials = {
        email: 'admin@energy.de',
        password: 'admin123'
      };

      const result = await mockAPIService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('admin@energy.de');
      expect(result.token).toMatch(/mock-jwt-token/);
    });

    it('throws error for invalid credentials', async () => {
      const credentials = {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      };

      await expect(mockAPIService.login(credentials))
        .rejects
        .toThrow('Ungültige Anmeldedaten');
    });
  });

  describe('getEnergyData', () => {
    it('returns energy data for specific building', async () => {
      const buildingId = 'rathaus-001';
      const period = 'week';

      const data = await mockAPIService.getEnergyData(buildingId, period);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('buildingId', buildingId);
      expect(data[0]).toHaveProperty('consumption');
      expect(data[0]).toHaveProperty('production');
    });
  });
});
```

### Integration Testing
```typescript
// Integration Test für WebSocket Service
import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocket } from '../hooks/useWebSocket';
import { MockWebSocketService } from '../services/mock/mockWebSocketService';

describe('useWebSocket Integration', () => {
  let mockWS: MockWebSocketService;

  beforeEach(() => {
    mockWS = new MockWebSocketService();
    vi.mocked(WebSocket).mockImplementation(() => mockWS as any);
  });

  it('connects and receives messages', async () => {
    const onMessage = vi.fn();
    
    const { result } = renderHook(() => 
      useWebSocket('energy_update', {
        onMessage,
        autoConnect: true
      })
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate incoming message
    const testMessage = {
      type: 'energy_update',
      payload: { totalEnergy: 150.5 },
      timestamp: new Date().toISOString()
    };

    mockWS.simulateMessage(testMessage);

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(testMessage);
    });
  });
});
```

### Test Coverage Standards
```bash
# Coverage Targets
Statements   : 85%
Branches     : 80%
Functions    : 85%
Lines        : 85%

# Coverage Commands
npm run test:coverage          # Generate coverage report
npm run test:coverage:watch    # Watch mode with coverage
npm run test:coverage:html     # HTML coverage report
```

## 🔧 Mock System Development

### Mock Data Strategy
```typescript
// Realistic Mock Data Generation
export const generateMockEnergyData = (
  buildingId?: string, 
  days: number = 7
): EnergyData[] => {
  const data: EnergyData[] = [];
  const baseConsumption = 150;
  const baseProduction = 100;

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - i);

    // Realistic variations based on time of day
    const hour = timestamp.getHours();
    const dayFactor = hour >= 8 && hour <= 18 ? 1.3 : 0.7; // Higher during day
    const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation

    const consumption = baseConsumption * dayFactor * randomFactor;
    const production = baseProduction * (hour >= 6 && hour <= 18 ? 1.5 : 0.1) * randomFactor;

    data.push({
      id: `energy-${i}`,
      buildingId: buildingId || 'default-building',
      timestamp: timestamp.toISOString(),
      consumption: Math.round(consumption * 100) / 100,
      production: Math.round(production * 100) / 100,
      efficiency: Math.round((production / consumption) * 100 * 100) / 100,
      co2Saved: Math.round((production * 0.233) * 100) / 100 // kg CO2 per kWh
    });
  }

  return data.reverse(); // Chronological order
};
```

### Mock Configuration
```typescript
// Mock System Configuration
interface MockConfiguration {
  // Network Simulation
  delay: {
    min: 300;      // Minimum response time (ms)
    max: 1200;     // Maximum response time (ms)
    realistic: true; // Vary delays based on request type
  };
  
  // Error Simulation
  failures: {
    rate: 0.02;           // 2% failure rate
    networkErrors: true;   // Simulate network failures
    authErrors: true;      // Simulate auth failures
    validationErrors: true; // Simulate validation failures
  };
  
  // Data Variation
  dataVariation: {
    enabled: true;         // Dynamic data changes
    updateInterval: 10000; // Update every 10 seconds
    variationRange: 0.1;   // ±10% variation
  };
}

// Mock Service Factory
export const createMockService = (config: MockConfiguration) => {
  return new MockAPIService(config);
};
```

### WebSocket Mock System
```typescript
// WebSocket Event Simulation
class MockWebSocketService implements IWebSocketService {
  private eventSimulator: NodeJS.Timeout | null = null;

  connect(): void {
    this.isConnected = true;
    this.connectionState = 'connected';
    
    // Start event simulation
    this.startEventSimulation();
  }

  private startEventSimulation(): void {
    this.eventSimulator = setInterval(() => {
      // Simulate realistic events
      this.simulateEnergyUpdate();
      this.simulateRandomAlert();
      this.simulateSystemStatus();
    }, 5000); // Every 5 seconds
  }

  private simulateEnergyUpdate(): void {
    const message: WebSocketMessage = {
      type: 'energy_update',
      payload: {
        totalEnergy: 145 + (Math.random() - 0.5) * 20,
        co2Saved: 23 + (Math.random() - 0.5) * 5
      },
      timestamp: new Date().toISOString(),
      source: 'mock_energy_monitor'
    };

    this.subscribers.forEach(callback => callback(message));
  }
}
```

## 🔍 Debugging Guide

### Browser DevTools Setup
```typescript
// Development Tools Setup
if (import.meta.env.DEV) {
  // React DevTools Integration
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  
  // Redux DevTools für Zustand
  const store = create(
    devtools((set) => ({
      // Store implementation
    }), {
      name: 'energy-management-store'
    })
  );
  
  // Performance Monitoring
  if ('performance' in window) {
    window.performance.mark('app-start');
  }
}
```

### Logging System
```typescript
// Structured Logging
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, { ...context, error });
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };

    // Console output in development
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(`%c[${level.toUpperCase()}] ${message}`, style, context);
    }

    // Send to monitoring service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToSentry(entry);
    }
  }

  private getConsoleStyle(level: LogEntry['level']): string {
    const styles = {
      debug: 'color: #6b7280',
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444; font-weight: bold'
    };
    return styles[level];
  }
}

export const logger = new Logger();
```

### Debug Commands
```bash
# Development Debugging
npm run dev                    # Start dev server with hot reload
npm run dev:debug             # Start with debug logging enabled

# Build Debugging
npm run build                 # Production build
npm run build:analyze         # Bundle analysis
npm run preview               # Preview production build

# Test Debugging
npm run test:debug            # Run tests with debug output
npm run test:ui               # Interactive test UI
npm run test:coverage         # Coverage with detailed reports

# Performance Debugging
npm run lighthouse            # Lighthouse audit
npm run bundle-analyzer       # Bundle size analysis
```

## 📊 Performance Optimization

### Bundle Size Optimization
```typescript
// Lazy Loading Implementation
const LazyAnalyticsDashboard = lazy(() => 
  import('./pages/analytics/AIAnalyticsDashboard').then(module => ({
    default: module.AIAnalyticsDashboard
  }))
);

// Code Splitting Strategy
const routes = [
  {
    path: '/dashboard',
    component: Dashboard, // Eager loaded (critical)
  },
  {
    path: '/analytics',
    component: LazyAnalyticsDashboard, // Lazy loaded
  },
  {
    path: '/buildings/:id',
    component: lazy(() => import('./pages/buildings/BuildingDetail')),
  }
];
```

### Memory Management
```typescript
// Cleanup Patterns
const useCleanupEffect = (cleanup: () => void, deps: React.DependencyList) => {
  useEffect(() => {
    return cleanup;
  }, deps);
};

// WebSocket Cleanup
const useWebSocketConnection = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(url);
    setWs(websocket);

    return () => {
      websocket.close();
      setWs(null);
    };
  }, [url]);

  return ws;
};

// Event Listener Cleanup
const useEventListener = (
  event: string, 
  handler: EventListener, 
  element: Element | Window = window
) => {
  useEffect(() => {
    element.addEventListener(event, handler);
    
    return () => {
      element.removeEventListener(event, handler);
    };
  }, [event, handler, element]);
};
```

### Performance Monitoring
```typescript
// Performance Metrics
const performanceMonitor = {
  // Component Render Times
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    logger.debug(`${componentName} render time: ${end - start}ms`);
  },

  // API Response Times
  measureAPI: async <T>(apiCall: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      logger.debug(`API call completed in ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      logger.error(`API call failed after ${end - start}ms`, error as Error);
      throw error;
    }
  },

  // Memory Usage
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      logger.debug('Memory usage', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
      });
    }
  }
};
```

## 🔒 Security Development Practices

### Input Validation
```typescript
// Validation Schema
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
});

const EnergyDataSchema = z.object({
  buildingId: z.string().uuid('Ungültige Gebäude-ID'),
  consumption: z.number().positive('Verbrauch muss positiv sein'),
  production: z.number().min(0, 'Produktion kann nicht negativ sein'),
  timestamp: z.string().datetime('Ungültiges Zeitstempel-Format')
});

// Validation Usage
const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};
```

### XSS Prevention
```typescript
// Safe HTML Rendering
import DOMPurify from 'dompurify';

const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedHTML = DOMPurify.sanitize(content);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

// Input Sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000); // Limit length
};
```

### Token Management
```typescript
// Secure Token Storage
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    // Consider using httpOnly cookies for refresh tokens in production
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * DashboardCard - Wiederverwendbare Karte für Dashboard-Metriken
 * 
 * Zeigt einen Titel, Wert und optionale Trend-Informationen an.
 * Unterstützt verschiedene Einheiten und Trend-Richtungen.
 * 
 * @example
 * ```tsx
 * <DashboardCard 
 *   title="Energy Consumption"
 *   value={145.7}
 *   unit="kWh"
 *   trend={{ value: 5.2, isPositive: true }}
 * />
 * ```
 */
interface DashboardCardProps {
  /** Titel der Metrik */
  title: string;
  
  /** Numerischer Wert der Metrik */
  value: number;
  
  /** Einheit des Werts (z.B. "kWh", "°C") */
  unit?: string;
  
  /** Trend-Information mit Wert und Richtung */
  trend?: {
    /** Prozentuale Änderung */
    value: number;
    /** Ob der Trend positiv (grün) oder negativ (rot) ist */
    isPositive: boolean;
  };
}
```

### API Documentation
```typescript
/**
 * API Service für Energy Management System
 * 
 * Abstrahiert HTTP-Calls und Error Handling für alle API-Operationen.
 * Unterstützt sowohl Mock- als auch Real-API-Modes.
 */
interface IAPIService {
  /**
   * Benutzer-Anmeldung
   * 
   * @param credentials - E-Mail und Passwort
   * @returns Promise mit User-Objekt und JWT Token
   * @throws Error bei ungültigen Anmeldedaten
   * 
   * @example
   * ```typescript
   * const result = await apiService.login({
   *   email: 'user@example.com',
   *   password: 'securepassword'
   * });
   * console.log(result.user.name);
   * ```
   */
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;

  /**
   * Energiedaten abrufen
   * 
   * @param buildingId - Optional: Filter nach Gebäude-ID
   * @param period - Optional: Zeitraum (day, week, month, year)
   * @returns Promise mit Array von Energiedaten
   * 
   * @example
   * ```typescript
   * const weeklyData = await apiService.getEnergyData('building-123', 'week');
   * ```
   */
  getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]>;
}
```

## 🔄 Development Tools & Automation

### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### VS Code Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer",
    "ms-vscode.test-adapter-converter"
  ]
}
```

### Development Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host",
    "dev:debug": "DEBUG=* vite",
    
    "build": "tsc && vite build",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist",
    "build:stats": "npm run build -- --mode analyze",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    
    "lint": "eslint src --max-warnings 0",
    "lint:fix": "eslint src --max-warnings 0 --fix",
    "lint:check": "eslint src --max-warnings 0 --format table",
    
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    
    "preview": "vite preview",
    "preview:network": "vite preview --host",
    
    "clean": "rm -rf dist coverage node_modules/.vite",
    "reset": "npm run clean && npm install",
    
    "validate": "npm run lint && npm run typecheck && npm run test:run",
    "pre-commit": "npm run validate && npm run build"
  }
}
```

## 🚀 Production Preparation

### Pre-Production Checklist
```markdown
## Pre-Production Checklist

### Code Quality
- [ ] All ESLint warnings resolved
- [ ] TypeScript strict mode enabled
- [ ] No console.log statements in production code
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations

### Performance
- [ ] Bundle size under 500KB
- [ ] Lazy loading implemented for heavy components
- [ ] Image optimization completed
- [ ] Lighthouse score > 90

### Security
- [ ] No API keys in source code
- [ ] Input validation implemented
- [ ] XSS protection in place
- [ ] Secure token storage

### Testing
- [ ] Test coverage > 85%
- [ ] All critical paths tested
- [ ] Integration tests passing
- [ ] Manual testing completed

### Environment
- [ ] Production environment variables configured
- [ ] Mock mode disabled for production
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Deployment guide current
- [ ] Code comments added where necessary
```

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Review Schedule**: Monthly  
**Status**: Active Development Guide ✅