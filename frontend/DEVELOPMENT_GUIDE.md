# 👨‍💻 CityPulse Development Guide

**Version:** 1.0.0  
**Last Updated:** August 3, 2025

---

## 📋 Table of Contents

1. [Getting Started](#-getting-started)
2. [Development Environment](#-development-environment)
3. [Project Structure](#-project-structure)
4. [Code Standards](#-code-standards)
5. [Development Workflow](#-development-workflow)
6. [Testing Guidelines](#-testing-guidelines)
7. [Performance Guidelines](#-performance-guidelines)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

Bevor du mit der Entwicklung beginnst, stelle sicher, dass du folgende Tools installiert hast:

#### Required Tools
- **Node.js** 18.x oder höher ([Download](https://nodejs.org/))
- **npm** 9.x oder höher (kommt mit Node.js)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** oder ein anderer TypeScript-fähiger Editor

#### Recommended Tools
- **VS Code Extensions:**
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

#### System Requirements
- **RAM:** Mindestens 8GB (16GB empfohlen)
- **Storage:** 5GB freier Speicher
- **OS:** Windows 10+, macOS 10.15+, oder Ubuntu 18.04+

### Quick Setup

#### 1. Repository klonen
```bash
git clone <repository-url>
cd citypulse-frontend
```

#### 2. Dependencies installieren
```bash
npm install
```

#### 3. Environment konfigurieren
```bash
# Erstelle .env.local für lokale Entwicklung
cp .env.example .env.local

# Bearbeite .env.local mit deinen Einstellungen
nano .env.local
```

#### 4. Development Server starten
```bash
npm run dev
```

#### 5. Browser öffnen
```
http://localhost:5173
```

### Environment Variables

#### Development (.env.local)
```env
# App Environment
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=500
VITE_MOCK_FAILURE_RATE=0
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Development Features
VITE_ENABLE_CONSOLE_LOGS=true
VITE_DEBUG_MODE=true
VITE_WS_ENABLED=true

# Optional: Real API (wenn verfügbar)
# VITE_USE_MOCK_DATA=false
# VITE_API_URL=https://staging-api.citypulse-hechingen.de/api
# VITE_WS_URL=wss://staging-api.citypulse-hechingen.de/ws
```

---

## 🛠️ Development Environment

### VS Code Configuration

#### Workspace Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### Launch Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### Browser Developer Tools

#### Chrome DevTools Extensions
- **React Developer Tools**
- **Redux DevTools** (für Zustand debugging)
- **Lighthouse** (Performance analysis)
- **Web Vitals** (Performance monitoring)

#### Development Console Commands
```javascript
// Available in development mode
window.debugEnergy.switchToMock()     // Switch to mock API
window.debugEnergy.switchToReal()     // Switch to real API
window.debugEnergy.isMock()           // Check current mode
window.debugEnergy.simulateIssues()   // Simulate network issues
window.debugEnergy.triggerAlert()     // Generate test alert
```

---

## 📁 Project Structure

### Source Code Organization

```
src/
├── components/                 # React Components
│   ├── ui/                    # Basic UI Components
│   │   ├── ModernCard.tsx     # Base card component
│   │   ├── MetricCard.tsx     # Metric display cards
│   │   ├── ChartCard.tsx      # Chart container cards
│   │   ├── AlertCard.tsx      # Alert notification cards
│   │   ├── Button.tsx         # Button components
│   │   └── LoadingSpinner.tsx # Loading state component
│   ├── charts/                # Chart Components (Lazy Loaded)
│   │   ├── LazyBarChart.tsx   # Bar chart component
│   │   ├── LazyLineChart.tsx  # Line chart component
│   │   └── LazyPieChart.tsx   # Pie chart component
│   ├── layout/                # Layout Components
│   │   ├── Layout.tsx         # Main app layout
│   │   ├── Header.tsx         # Navigation header
│   │   └── PublicHeader.tsx   # Public page header
│   └── dev/                   # Development Tools
│       └── MockDataToggle.tsx # Mock/Real API toggle
├── pages/                     # Page Components
│   ├── dashboard/             # Dashboard Pages
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   └── HechingenOverview.tsx # City overview
│   ├── buildings/             # Building-specific Dashboards
│   │   ├── RathausDashboard.tsx
│   │   ├── GymnasiumDashboard.tsx
│   │   ├── RealschuleDashboard.tsx
│   │   ├── WerkrealschuleDashboard.tsx
│   │   ├── GrundschuleDashboard.tsx
│   │   ├── SporthallenDashboard.tsx
│   │   └── HallenbadDashboard.tsx
│   ├── admin/                 # Admin Pages
│   │   ├── AdminDashboard.tsx
│   │   └── SensorManagement.tsx
│   ├── auth/                  # Authentication Pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── alerts/                # Alert Management
│   │   ├── AlertsDashboard.tsx
│   │   └── ActiveAlerts.tsx
│   ├── analytics/             # Analytics Pages
│   │   └── AIAnalyticsDashboard.tsx
│   └── public/                # Public Pages
│       └── BuergerDashboard.tsx
├── services/                  # Service Layer
│   ├── serviceFactory.ts      # Service Factory (Main)
│   ├── api/                   # Real API Services
│   │   ├── realApiService.ts
│   │   └── realWebSocketService.ts
│   ├── mock/                  # Mock Services
│   │   ├── mockApiService.ts
│   │   ├── mockWebSocketService.ts
│   │   └── mockData.ts
│   ├── types/                 # Service Type Definitions
│   │   └── apiService.ts
│   ├── notification.service.ts # Notification system
│   └── websocket.service.ts   # WebSocket wrapper
├── stores/                    # State Management
│   └── authStore.ts           # Authentication store
├── hooks/                     # Custom React Hooks
│   └── useWebSocket.ts        # WebSocket hook
├── utils/                     # Utility Functions
│   ├── logger.ts              # Logging utility
│   └── index.ts               # Utility exports
├── types/                     # TypeScript Definitions
│   ├── api.ts                 # API types
│   ├── index.ts               # Main type exports
│   └── logger.d.ts            # Logger types
└── styles/                    # Styling
    ├── index.css              # Global styles
    └── design-system.css      # Design system variables
```

### Naming Conventions

#### Files & Directories
```
PascalCase:    ComponentName.tsx, ServiceName.ts
camelCase:     utilityFunction.ts, helperName.ts
kebab-case:    design-system.css, api-types.ts
lowercase:     index.ts, globals.css
```

#### Components
```typescript
// Component files
export const MetricCard: React.FC<MetricCardProps> = ({ ... }) => { ... }

// Props interfaces
interface MetricCardProps {
  title: string;
  value: number;
  // ...
}

// Default exports for pages
export default Dashboard;
```

#### Constants & Enums
```typescript
// Constants
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  ENERGY_DATA: '/energy',
  BUILDINGS: '/buildings'
} as const;

// Enums
export enum UserRole {
  ADMIN = 'admin',
  TECHNIKER = 'techniker',
  ENERGIEMANAGER = 'energiemanager'
}
```

---

## 📏 Code Standards

### TypeScript Guidelines

#### Strict Type Checking
```typescript
// tsconfig.json - Already configured
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### Type Definitions
```typescript
// Always define comprehensive interfaces
interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string; // ISO 8601
  produced: number;
  consumed: number;
  efficiency: number; // 0-1
  co2Saved: number;
  metadata?: Record<string, unknown>;
}

// Use union types for restricted values
type BuildingType = 'administrative' | 'educational' | 'sports' | 'recreational';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Generic types for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
}
```

#### Error Handling
```typescript
// Use Result pattern for better error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Service methods should return Results
async function fetchEnergyData(buildingId: string): Promise<Result<EnergyData[]>> {
  try {
    const data = await apiService.getEnergyData(buildingId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### React Guidelines

#### Component Structure
```typescript
// 1. Imports (grouped logically)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/serviceFactory';

// 2. Type definitions
interface DashboardProps {
  buildingId: string;
  className?: string;
}

// 3. Component implementation
export const Dashboard: React.FC<DashboardProps> = ({ 
  buildingId, 
  className 
}) => {
  // 4. Hooks (in logical order)
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);

  // 5. Event handlers
  const handleMetricClick = useCallback((metricId: string) => {
    navigate(`/analytics/${metricId}`);
  }, [navigate]);

  // 6. Effects
  useEffect(() => {
    loadEnergyData();
  }, [buildingId]);

  // 7. Helper functions
  const loadEnergyData = async () => {
    setLoading(true);
    const result = await fetchEnergyData(buildingId);
    if (result.success) {
      setEnergyData(result.data);
    }
    setLoading(false);
  };

  // 8. Render logic
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={className}>
      {energyData.map(data => (
        <MetricCard 
          key={data.id}
          title="Energy Consumption"
          value={data.consumed}
          onClick={() => handleMetricClick(data.id)}
        />
      ))}
    </div>
  );
};

// 9. Default export (for pages)
export default Dashboard;
```

#### Hooks Best Practices
```typescript
// Custom hooks should be pure and testable
export const useEnergyData = (buildingId: string) => {
  const [data, setData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getEnergyData(buildingId);
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  return { data, loading, error };
};
```

### CSS & Styling Guidelines

#### Tailwind CSS Usage
```tsx
// Use Tailwind utility classes for styling
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    Energy Dashboard
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Content */}
  </div>
</div>

// Use clsx for conditional classes
import { cn } from '@/lib/utils';

<button 
  className={cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>
```

#### CSS Custom Properties
```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #1e40af;
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
  --backdrop-blur: blur(12px);
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-glass);
}
```

---

## 🔄 Development Workflow

### Git Workflow

#### Branch Strategy
```bash
main                    # Production-ready code
├── develop            # Integration branch
├── feature/new-chart  # Feature branches
├── bugfix/chart-fix   # Bug fix branches
└── hotfix/urgent-fix  # Urgent production fixes
```

#### Commit Convention
```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore

feat(dashboard): add energy efficiency metrics
fix(charts): resolve chart rendering issue on mobile
docs(api): update authentication documentation
style(ui): improve button hover animations
refactor(services): extract common API logic
test(components): add MetricCard unit tests
chore(deps): update dependencies to latest versions
```

#### Development Process
```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/energy-analytics

# 2. Make changes and commit
git add .
git commit -m "feat(analytics): add energy trend analysis"

# 3. Push and create PR
git push origin feature/energy-analytics
# Create Pull Request via GitHub/GitLab

# 4. After code review and approval
git checkout develop
git pull origin develop
git branch -d feature/energy-analytics
```

### Code Review Guidelines

#### PR Checklist
- [ ] **Code Quality**
  - [ ] TypeScript compilation without errors
  - [ ] ESLint passes without warnings
  - [ ] No console.log statements in production code
  - [ ] Proper error handling implemented

- [ ] **Testing**
  - [ ] Unit tests written for new functionality
  - [ ] Existing tests still pass
  - [ ] Test coverage maintained above 85%

- [ ] **Performance**
  - [ ] No unnecessary re-renders
  - [ ] Lazy loading implemented where appropriate
  - [ ] Bundle size impact assessed

- [ ] **Accessibility**
  - [ ] ARIA labels added where needed
  - [ ] Keyboard navigation works
  - [ ] Color contrast meets WCAG standards

- [ ] **Documentation**
  - [ ] Component props documented
  - [ ] README updated if needed
  - [ ] API changes documented

#### Review Process
1. **Self Review** - Review your own code before submitting
2. **Peer Review** - At least one team member reviews
3. **Testing** - Reviewer tests the functionality
4. **Approval** - Code meets all standards
5. **Merge** - Squash and merge to develop

---

## 🧪 Testing Guidelines

### Testing Strategy

#### Test Types
- **Unit Tests** - Individual component/function testing
- **Integration Tests** - Component interaction testing
- **E2E Tests** - End-to-end user flow testing
- **Visual Tests** - UI regression testing

#### Testing Tools
```json
{
  "vitest": "^1.0.0",           // Test runner
  "@testing-library/react": "^14.1.2",  // React testing utilities
  "@testing-library/jest-dom": "^6.1.5", // DOM matchers
  "@testing-library/user-event": "^14.5.1" // User interaction simulation
}
```

### Unit Testing

#### Component Testing Template
```typescript
// MetricCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricCard } from '../MetricCard';
import { Zap } from 'lucide-react';

// Test data
const defaultProps = {
  title: 'Energy Consumption',
  value: 1245.6,
  unit: 'kWh',
  icon: <Zap className="w-6 h-6" />,
};

describe('MetricCard', () => {
  it('renders metric data correctly', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Energy Consumption')).toBeInTheDocument();
    expect(screen.getByText('1,245.6')).toBeInTheDocument();
    expect(screen.getByText('kWh')).toBeInTheDocument();
  });

  it('displays trend when provided', () => {
    const trend = { value: 12.5, isPositive: true, label: 'vs. last month' };
    render(<MetricCard {...defaultProps} trend={trend} />);
    
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs. last month')).toBeInTheDocument();
  });

  it('applies correct color theme', () => {
    const { container } = render(<MetricCard {...defaultProps} color="green" />);
    const iconContainer = container.querySelector('.bg-green-600');
    
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MetricCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Service Testing
```typescript
// mockApiService.test.ts
import { mockAPIService } from '../mockApiService';

describe('MockAPIService', () => {
  beforeEach(() => {
    // Reset service state
    mockAPIService.setMockDelay(0);
    mockAPIService.setFailureRate(0);
  });

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const credentials = {
        email: 'admin@hechingen.de',
        password: 'admin123'
      };

      const result = await mockAPIService.login(credentials);

      expect(result.user.email).toBe(credentials.email);
      expect(result.token).toMatch(/^mock-jwt-token-/);
    });

    it('throws error with invalid credentials', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrong'
      };

      await expect(mockAPIService.login(credentials))
        .rejects
        .toThrow('Ungültige Anmeldedaten');
    });
  });

  describe('getEnergyData', () => {
    it('returns energy data for building', async () => {
      const data = await mockAPIService.getEnergyData('rathaus');

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('buildingId', 'rathaus');
    });
  });
});
```

### Integration Testing

#### Component Integration
```typescript
// Dashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { serviceFactory } from '@/services/serviceFactory';

// Mock the service factory
vi.mock('@/services/serviceFactory', () => ({
  serviceFactory: {
    createAPIService: () => ({
      getEnergyData: vi.fn().mockResolvedValue([
        {
          id: 'energy-001',
          buildingId: 'rathaus',
          consumed: 1245.6,
          produced: 987.3
        }
      ])
    })
  }
}));

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Dashboard Integration', () => {
  it('loads and displays energy data', async () => {
    render(
      <DashboardWrapper>
        <Dashboard buildingId="rathaus" />
      </DashboardWrapper>
    );

    // Check loading state
    expect(screen.getByText('Lade Daten...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1,245.6')).toBeInTheDocument();
    });

    // Verify metric cards are rendered
    expect(screen.getByText('Energieverbrauch')).toBeInTheDocument();
    expect(screen.getByText('Energieproduktion')).toBeInTheDocument();
  });
});
```

### Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test MetricCard.test.tsx

# Run tests for specific pattern
npm run test -- --grep "MetricCard"
```

---

## ⚡ Performance Guidelines

### React Performance

#### Component Optimization
```typescript
// Use React.memo for expensive components
export const MetricCard = React.memo<MetricCardProps>(({ 
  title, 
  value, 
  trend,
  ...props 
}) => {
  // Memoize expensive calculations
  const formattedValue = useMemo(() => {
    return new Intl.NumberFormat('de-DE').format(value);
  }, [value]);

  // Memoize event handlers
  const handleClick = useCallback(() => {
    props.onClick?.(props.id);
  }, [props.onClick, props.id]);

  return (
    <div onClick={handleClick}>
      <h3>{title}</h3>
      <p>{formattedValue}</p>
      {trend && <TrendIndicator trend={trend} />}
    </div>
  );
});
```

#### Lazy Loading
```typescript
// Lazy load heavy components
const LazyBarChart = lazy(() => import('./LazyBarChart'));
const LazyLineChart = lazy(() => import('./LazyLineChart'));

// Use Suspense for loading states
<Suspense fallback={<ChartSkeleton />}>
  <LazyBarChart data={data} />
</Suspense>
```

#### State Management
```typescript
// Optimize Zustand selectors
const useAuthStore = create<AuthStore>((set, get) => ({
  // State and actions
}));

// Use specific selectors to prevent unnecessary re-renders
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Instead of
const { user, isAuthenticated, isLoading, error } = useAuthStore();
```

### Bundle Optimization

#### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// Feature-based code splitting
const AnalyticsFeature = lazy(() => import('@/features/analytics'));
```

#### Tree Shaking
```typescript
// Import only what you need
import { format } from 'date-fns';
// Instead of: import * as dateFns from 'date-fns';

// Use named imports
import { Button } from '@/components/ui/Button';
// Instead of: import * as UI from '@/components/ui';
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check individual package sizes
npx bundlephobia-cli package-name
```

### Memory Management

#### Cleanup Patterns
```typescript
// Clean up subscriptions and timers
useEffect(() => {
  const timer = setInterval(updateData, 5000);
  const subscription = webSocketService.subscribe('energy_updates', handleUpdate);

  return () => {
    clearInterval(timer);
    webSocketService.unsubscribe(subscription);
  };
}, []);

// Abort fetch requests on unmount
useEffect(() => {
  const abortController = new AbortController();

  fetchData({ signal: abortController.signal })
    .then(setData)
    .catch(error => {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    });

  return () => {
    abortController.abort();
  };
}, []);
```

---

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

##### TypeScript Errors
```bash
# Error: Property 'X' does not exist on type 'Y'
# Solution: Check type definitions and imports

# Check types
npm run typecheck

# Fix import paths
# Use absolute imports: @/components/ui/Button
# Instead of: ../../components/ui/Button
```

##### Vite Build Issues
```bash
# Error: Failed to resolve import
# Solution: Check file extensions and paths

# Clear cache
rm -rf node_modules/.vite
npm run dev

# Check vite.config.ts for correct alias configuration
```

#### Runtime Errors

##### WebSocket Connection Issues
```typescript
// Debug WebSocket connection
const wsService = serviceFactory.createWebSocketService();
console.log('WebSocket state:', wsService.connectionState);

// Check environment variables
console.log('WS URL:', import.meta.env.VITE_WS_URL);
```

##### Service Factory Issues
```typescript
// Debug service factory mode
console.log('Mock mode:', serviceFactory.isMockMode());
console.log('Config:', serviceFactory.getMockConfig());

// Switch modes in development
window.debugEnergy.switchToMock();
window.debugEnergy.switchToReal();
```

#### Performance Issues

##### Slow Component Rendering
```typescript
// Use React DevTools Profiler
// 1. Open React DevTools
// 2. Go to Profiler tab
// 3. Record a session
// 4. Identify slow components

// Common solutions:
// - Add React.memo()
// - Use useMemo() for expensive calculations
// - Use useCallback() for event handlers
// - Implement virtualization for long lists
```

##### Memory Leaks
```typescript
// Use Chrome DevTools Memory tab
// 1. Open DevTools
// 2. Go to Memory tab
// 3. Take heap snapshots
// 4. Compare snapshots to find leaks

// Common causes:
// - Unsubscribed event listeners
// - Uncleaned timers/intervals
// - Retained references in closures
```

### Debug Commands

```bash
# Development debugging
npm run dev -- --debug

# Build debugging
npm run build -- --mode development

# Test debugging
npm run test -- --reporter=verbose

# Type checking
npm run typecheck

# Linting
npm run lint -- --debug
```

### Environment Debugging

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check environment variables
printenv | grep VITE_

# Check package installations
npm list --depth=0

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📚 Learning Resources

### Documentation
- **[React Documentation](https://react.dev/)** - Official React docs
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript guide
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[Vite Guide](https://vitejs.dev/guide/)** - Build tool documentation
- **[Vitest](https://vitest.dev/)** - Testing framework

### Code Examples
- **[Component Library](./COMPONENT_GUIDE.md)** - CityPulse component documentation
- **[API Reference](./API_DOCUMENTATION.md)** - Complete API documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture overview

### Best Practices
- **[React Patterns](https://reactpatterns.com/)** - Common React patterns
- **[TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)**
- **[Web Performance](https://web.dev/performance/)** - Performance optimization

---

## 🤝 Getting Help

### Team Communication
- **Slack/Discord** - Daily communication
- **GitHub Issues** - Bug reports and feature requests
- **Code Reviews** - Pull request discussions
- **Team Meetings** - Weekly sync meetings

### Escalation Process
1. **Self-help** - Check documentation and troubleshooting guide
2. **Peer Help** - Ask team members
3. **Senior Developer** - Complex technical issues
4. **Team Lead** - Architecture decisions
5. **External Help** - Community resources and Stack Overflow

### Code Review Process
1. **Create Feature Branch** - Start from develop
2. **Implement Changes** - Follow coding standards
3. **Write Tests** - Maintain test coverage
4. **Create Pull Request** - Detailed description
5. **Code Review** - Address feedback
6. **Approval & Merge** - Squash and merge

---

**Development Guide** - Your companion for CityPulse development

*Built for efficient and maintainable code*