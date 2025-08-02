# System Architecture - Energy Management MVP

Detaillierte technische Architektur der Energy Management MVP Plattform mit Fokus auf Performance, Skalierbarkeit und Wartbarkeit.

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (React)  │    │   Backend API       │    │   External Services │
│                     │    │                     │    │                     │
│ ┌─────────────────┐ │    │ ┌─────────────────┐ │    │ ┌─────────────────┐ │
│ │  UI Components  │ │    │ │  REST API       │ │    │ │  Energy Sensors │ │
│ │  State Mgmt     │◄┼────┼►│  WebSocket      │◄┼────┼►│  Building IoT   │ │
│ │  Service Layer  │ │    │ │  Authentication │ │    │ │  Weather API    │ │
│ └─────────────────┘ │    │ └─────────────────┘ │    │ └─────────────────┘ │
│                     │    │                     │    │                     │
│ ┌─────────────────┐ │    │ ┌─────────────────┐ │    │ ┌─────────────────┐ │
│ │  Mock System    │ │    │ │  Database       │ │    │ │  Analytics AI   │ │
│ │  Dev Tools      │ │    │ │  Cache Layer    │ │    │ │  Notifications  │ │
│ └─────────────────┘ │    │ └─────────────────┘ │    │ └─────────────────┘ │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Technology Stack

#### Frontend Stack
```
┌─────────────────────────────────────────────────────┐
│                React Application                    │
├─────────────────────────────────────────────────────┤
│ UI Layer: React 18 + TypeScript + Tailwind CSS     │
│ State: Zustand + React Hooks                        │
│ Routing: React Router v6                            │
│ Charts: Recharts (Lazy Loaded)                      │
│ Build: Vite + ESBuild                              │
│ Testing: Vitest + Testing Library                   │
└─────────────────────────────────────────────────────┘
```

#### Service Architecture
```
┌─────────────────────────────────────────────────────┐
│                Service Factory                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐    ┌─────────────────────────┐ │
│  │   Mock Mode     │    │     Real Mode           │ │
│  │                 │    │                         │ │
│  │ Mock API        │    │ Real API Service        │ │
│  │ Mock WebSocket  │    │ Real WebSocket          │ │
│  │ Synthetic Data  │    │ Live Data Streams       │ │
│  │ Local Storage   │    │ Remote Database         │ │
│  └─────────────────┘    └─────────────────────────┘ │
│                                                     │
│         ↑ Environment-based Selection ↑             │
└─────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### Request-Response Flow
```
User Interaction
    ↓
React Component
    ↓
Service Factory
    ↓
[Mock Service] OR [Real API Service]
    ↓
Data Processing
    ↓
State Management (Zustand)
    ↓
Component Re-render
    ↓
UI Update
```

### Real-time Data Flow
```
External Data Source (Sensors/IoT)
    ↓
Backend WebSocket Server
    ↓
Frontend WebSocket Service
    ↓
Message Router
    ↓
State Updates (Zustand)
    ↓
Component Subscriptions
    ↓
Live UI Updates
```

## 🧩 Component Architecture

### Component Hierarchy
```
App
├── Router
├── Layout
│   ├── Header
│   │   ├── ThemeToggle
│   │   ├── ConnectionStatus
│   │   └── User Menu
│   └── Main Content
│       ├── Dashboard
│       │   ├── DashboardCard (×4)
│       │   ├── QuickStats
│       │   └── RecentActivity
│       ├── Buildings
│       │   ├── BuildingList
│       │   └── BuildingDetail
│       ├── EnergyFlow
│       │   ├── LazyLineChart
│       │   ├── LazyBarChart
│       │   └── LazyPieChart
│       ├── Alerts
│       │   ├── AlertsList
│       │   └── AlertDetail
│       └── Analytics
│           ├── AI Analytics
│           └── Predictions
└── ErrorBoundary
```

### Component Design Patterns

#### 1. Service Factory Pattern
```typescript
// Service abstraction for Mock vs Real mode
interface IAPIService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  getEnergyData(filters: EnergyFilters): Promise<EnergyData[]>;
  // ... weitere methods
}

// Automatische Service-Auswahl
const apiService = createAPIService(); // Mock oder Real basierend auf ENV
```

#### 2. Lazy Loading Pattern
```typescript
// Lazy loaded components für Performance
const LazyLineChart = lazy(() => import('./charts/LazyLineChart'));
const LazyBarChart = lazy(() => import('./charts/LazyBarChart'));

// Verwendung mit Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyLineChart data={energyData} />
</Suspense>
```

#### 3. Hook-based Architecture
```typescript
// Custom Hooks für Business Logic
const useWebSocket = (eventType: string, options: WebSocketOptions) => {
  // WebSocket Management Logic
  return { isConnected, connectionState, lastMessage };
};

const useEnergyData = (buildingId: string) => {
  // Data fetching und Caching Logic
  return { data, loading, error, refetch };
};
```

## 📊 State Management Architecture

### Zustand Store Structure
```typescript
// Global State Architecture
interface AppState {
  // Authentication State
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  };
  
  // Real-time Data State
  realtime: {
    energyData: EnergyData[];
    connectionStatus: WebSocketConnectionState;
    lastUpdate: string;
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: Notification[];
  };
}
```

### State Flow
```
Action Dispatch
    ↓
Zustand Store Update
    ↓
Component Re-render (React Suspense)
    ↓
UI Update
    ↑
WebSocket Events (Real-time Updates)
```

## 🌐 Network Architecture

### API Communication
```typescript
// HTTP Client mit Interceptors
class APIClient {
  private async request<T>(config: RequestConfig): Promise<T> {
    // Request Interceptor: Auth Token, Headers
    // Response Interceptor: Error Handling, Token Refresh
    // Retry Logic für Network Failures
  }
}

// WebSocket Management
class WebSocketService {
  private reconnect(): void {
    // Exponential Backoff Reconnection
    // Message Queue für Offline Messages
    // Connection Health Monitoring
  }
}
```

### Network Flow
```
Frontend Request
    ↓
Service Factory (Route zu Mock/Real)
    ↓
[Mock: Local Processing] OR [Real: HTTP/WebSocket]
    ↓
Response Processing
    ↓
Error Handling & Retry Logic
    ↓
State Update
```

## 🔒 Security Architecture

### Authentication Flow
```
User Login
    ↓
Credentials Validation
    ↓
JWT Token Generation
    ↓
Token Storage (localStorage)
    ↓
API Request Headers (Bearer Token)
    ↓
Token Validation (Server/Mock)
    ↓
Protected Resource Access
```

### Security Layers
```typescript
// 1. Input Validation
interface ValidationSchema {
  email: string;     // Email format validation
  password: string;  // Min length, complexity
  // XSS Protection durch React's eingebaute Escaping
}

// 2. Authorization
interface RolePermissions {
  admin: string[];    // Vollzugriff
  manager: string[];  // Gebäude-Management
  user: string[];     // Basis-Dashboard
  public: string[];   // Nur öffentliche Daten
}

// 3. Secure Communication
const secureWebSocket = {
  url: 'wss://secure-endpoint.com',
  authentication: 'Bearer token',
  encryption: 'TLS 1.3'
};
```

## 📱 Responsive Design Architecture

### Breakpoint System
```scss
// Tailwind CSS Breakpoints
$breakpoints: (
  'sm': '640px',   // Mobile
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large Desktop
  '2xl': '1536px'  // Extra Large
);
```

### Component Responsive Patterns
```typescript
// Mobile-First Design Pattern
const DashboardLayout = () => {
  return (
    <div className="
      grid 
      grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-4 
      gap-4 
      p-4
    ">
      {/* Responsive Grid für Dashboard Cards */}
    </div>
  );
};
```

## ⚡ Performance Architecture

### Build Optimization
```typescript
// Vite Build Configuration
const buildOptimization = {
  // Code Splitting
  manualChunks: {
    vendor: ['react', 'react-dom'],
    router: ['react-router-dom'],
    charts: ['recharts'],
    ui: ['react-hot-toast', 'lucide-react']
  },
  
  // Bundle Optimization
  minify: 'esbuild',        // Fastest minification
  sourcemap: false,         // Disabled für Production
  reportCompressedSize: false, // Schnellere Builds
  
  // Asset Optimization
  chunkSizeWarningLimit: 600, // Größere Chunks für Lazy Loading
  cssCodeSplit: true         // CSS Code Splitting
};
```

### Runtime Performance
```typescript
// Lazy Loading Strategy
const componentLoadingStrategy = {
  // Kritische Komponenten: Eager Loading
  critical: ['Dashboard', 'Layout', 'Header'],
  
  // Sekundäre Komponenten: Lazy Loading
  lazy: ['Charts', 'Analytics', 'DetailViews'],
  
  // Heavy Components: Dynamic Import
  heavy: ['recharts', 'ai-analytics']
};

// Memory Management
const memoryOptimization = {
  // WebSocket Connection Pooling
  maxConnections: 1,
  
  // Data Caching Strategy
  cacheSize: 100, // Max cached API responses
  ttl: 300000,   // 5 Minuten Cache TTL
  
  // Event Listener Cleanup
  useEffect: () => {
    return () => cleanup(); // Automatisches Cleanup
  }
};
```

## 🧪 Testing Architecture

### Test Strategy Pyramid
```
┌─────────────────────────────────────┐
│            E2E Tests (10%)          │ ← Cypress/Playwright
├─────────────────────────────────────┤
│       Integration Tests (20%)       │ ← Service Integration
├─────────────────────────────────────┤
│         Unit Tests (70%)            │ ← Component + Utilities
└─────────────────────────────────────┘
```

### Mock System Architecture
```typescript
// Comprehensive Mock System
interface MockSystem {
  // API Mocking
  mockAPIService: {
    realistic: boolean;      // Realistic response times
    failureRate: number;     // Network failure simulation
    dataVariation: boolean;  // Dynamic test data
  };
  
  // WebSocket Mocking
  mockWebSocketService: {
    eventSimulation: boolean;  // Real-time event simulation
    connectionStates: string[]; // Connection state testing
    messageQueue: Message[];   // Message buffering
  };
  
  // Test Data Generation
  dataGenerators: {
    users: () => User[];
    buildings: () => Building[];
    energyData: (days: number) => EnergyData[];
    sensors: () => Sensor[];
  };
}
```

## 🚀 Deployment Architecture

### Build Pipeline
```
Source Code (Git)
    ↓
Dependency Installation (npm ci)
    ↓
Code Quality Checks (ESLint + TypeScript)
    ↓
Test Suite (Vitest)
    ↓
Production Build (Vite)
    ↓
Bundle Analysis & Optimization
    ↓
Deployment (Vercel/Netlify/AWS)
```

### Environment Configuration
```typescript
// Environment-specific Configuration
interface EnvironmentConfig {
  development: {
    VITE_API_URL: 'http://localhost:8000/api';
    VITE_USE_MOCK_DATA: 'true';
    VITE_WS_URL: 'ws://localhost:8000/ws';
  };
  
  production: {
    VITE_API_URL: 'https://api.yourdomain.com';
    VITE_USE_MOCK_DATA: 'false';
    VITE_WS_URL: 'wss://api.yourdomain.com/ws';
  };
  
  test: {
    VITE_API_URL: 'http://test-api.local';
    VITE_USE_MOCK_DATA: 'true';
    VITE_WS_URL: 'ws://test-api.local/ws';
  };
}
```

## 📈 Monitoring & Logging Architecture

### Client-side Monitoring
```typescript
// Logging System
interface LoggingArchitecture {
  // Development Logging
  development: {
    console: true,           // Console output
    level: 'debug',         // Detailed logging
    websocket: true,        // WebSocket event logging
  };
  
  // Production Monitoring
  production: {
    sentry: true,           // Error tracking
    analytics: true,        // User behavior tracking
    performance: true,      // Core Web Vitals
    console: false,         // No console pollution
  };
}

// Error Boundary Architecture
const errorHandling = {
  // Component-level Error Boundaries
  componentBoundaries: ['Dashboard', 'Charts', 'Forms'],
  
  // Global Error Handler
  globalHandler: {
    unhandledRejections: true,
    windowErrors: true,
    webSocketErrors: true,
  };
};
```

### Performance Monitoring
```typescript
// Core Web Vitals Tracking
const performanceMetrics = {
  // Bundle Size Monitoring
  bundleSize: {
    warning: 500, // KB
    error: 1000   // KB
  },
  
  // Load Performance
  loadTimes: {
    firstContentfulPaint: 2000, // ms
    largestContentfulPaint: 2500, // ms
    cumulativeLayoutShift: 0.1,   // score
  },
  
  // Runtime Performance
  runtime: {
    memoryUsage: true,
    componentRenderTimes: true,
    webSocketLatency: true,
  }
};
```

## 🔄 Scalability Considerations

### Horizontal Scaling
```typescript
// Frontend Scaling Strategy
const scalingStrategy = {
  // CDN Distribution
  assets: {
    distribution: 'global',
    caching: 'aggressive',
    compression: 'gzip + brotli'
  },
  
  // Load Balancing
  apiEndpoints: {
    distribution: 'geographic',
    failover: 'automatic',
    healthCheck: 'continuous'
  },
  
  // Caching Strategy
  clientSide: {
    apiResponses: '5min TTL',
    staticAssets: '1year TTL',
    dynamicContent: '1min TTL'
  }
};
```

### Performance Scaling
```typescript
// Component-level Optimizations
const componentOptimizations = {
  // Virtual Scrolling für große Listen
  virtualScrolling: ['BuildingList', 'SensorList', 'AlertsList'],
  
  // Memoization für expensive calculations
  memoization: ['ChartCalculations', 'StatisticsComputation'],
  
  // Debouncing für User Input
  debouncing: ['SearchInput', 'FilterControls'],
  
  // Progressive Loading
  progressiveLoading: ['Charts', 'Analytics', 'Reports']
};
```

## 🔧 Development Architecture

### Hot Module Replacement (HMR)
```typescript
// Vite HMR Configuration
const hmrConfig = {
  port: 24678,
  host: 'localhost',
  // Fast refresh für React Components
  react: {
    fastRefresh: true,
    strictMode: true
  },
  // State Preservation
  statePreservation: true
};
```

### Development Tools Integration
```typescript
// Development Tool Chain
const devTools = {
  // TypeScript Integration
  typescript: {
    strict: true,
    noEmit: true,        // Type checking only
    incremental: true    // Faster subsequent builds
  },
  
  // ESLint Integration
  eslint: {
    realtime: true,      // IDE Integration
    autofix: true,       // Auto-correction
    typescript: true     // TypeScript support
  },
  
  // Testing Integration
  testing: {
    watch: true,         // Test watch mode
    coverage: true,      // Coverage reports
    ui: true            // Vitest UI
  }
};
```

## 📚 Architecture Documentation Standards

### Code Documentation
```typescript
/**
 * Service Factory für API und WebSocket Services
 * 
 * Automatische Service-Auswahl basierend auf VITE_USE_MOCK_DATA
 * Environment Variable. Mock Services für Development,
 * Real Services für Production.
 * 
 * @example
 * ```typescript
 * const apiService = createAPIService();
 * const energyData = await apiService.getEnergyData();
 * ```
 */
export function createAPIService(): IAPIService {
  // Implementation
}
```

### Architecture Decision Records (ADRs)
```markdown
# ADR-001: Service Factory Pattern

## Status
Accepted

## Context
Need für saubere Trennung zwischen Mock und Real Services
für Development vs Production environments.

## Decision
Implementierung eines Service Factory Patterns mit
environment-basierter Service-Auswahl.

## Consequences
- Klare Separation of Concerns
- Einfaches Testing und Development
- Einheitliche API Interface
```

## 🎯 Future Architecture Considerations

### Potential Enhancements
```typescript
// Progressive Web App (PWA)
const pwaFeatures = {
  serviceWorker: true,    // Offline functionality
  appManifest: true,      // Installable app
  pushNotifications: true, // Alert notifications
  backgroundSync: true    // Offline data sync
};

// Micro-frontend Architecture
const microfrontendStrategy = {
  // Module Federation
  modules: ['dashboard', 'analytics', 'admin'],
  
  // Independent Deployment
  deployment: 'independent',
  
  // Shared Dependencies
  shared: ['react', 'react-dom', 'zustand']
};

// Real-time Collaboration
const realtimeCollaboration = {
  // Multi-user Dashboard
  multiUser: true,
  
  // Shared State Synchronization
  stateSync: 'operational-transform',
  
  // Conflict Resolution
  conflictResolution: 'last-writer-wins'
};
```

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Architecture Review**: Quarterly  
**Status**: Production Ready ✅