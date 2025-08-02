# Testing Dokumentation

## 📚 Übersicht

Das Energy Management MVP nutzt eine moderne Testing-Strategie mit **Vitest**, **React Testing Library** und umfassenden Mock-Strategien. Ziel ist mindestens 50% Test Coverage für kritische Business Logic mit Focus auf Qualität und Zuverlässigkeit.

## 🧪 Testing Stack

### Core Testing Tools
- **Vitest**: Schneller Unit Test Runner mit Vite-Integration
- **React Testing Library**: Component Testing mit User-centric Approach
- **jsdom**: Browser Environment Simulation
- **Coverage**: v8 Provider für genauer Code Coverage
- **TypeScript**: Vollständige Typisierung der Tests

### Test Categories
```
testing/
├── Unit Tests           # Isolated component/function tests
├── Integration Tests    # Service integration tests
├── Component Tests      # React component behavior tests
├── Store Tests         # State management tests
└── Performance Tests   # Bundle size and runtime performance
```

## ⚙️ Vitest Configuration

### Test Environment Setup
**Datei**: `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                 // Global test functions
    environment: 'jsdom',          // Browser-like environment
    setupFiles: ['./src/test/setup.ts'],
    css: true,                     // CSS processing
    testTimeout: 10000,            // 10s timeout for async tests
    hookTimeout: 10000,            // 10s for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      // ... weitere aliases
    },
  },
});
```

### Coverage Configuration
```typescript
// Excluded from Coverage
coverage: {
  exclude: [
    'node_modules/',
    'src/test/',              // Test utilities
    'src/vite-env.d.ts',     // Type definitions
    '**/*.d.ts',             // Type declaration files
    'dist/',                 // Build output
    '**/*.config.{js,ts}',   // Configuration files
    'src/main.tsx',          // App entry point
    'src/index.css'          // Global styles
  ]
}
```

## 🛠️ Test Utilities

### Enhanced Test Utils
**Datei**: `src/test/utils.tsx`

Comprehensive mock factories und test helpers für optimale Developer Experience.

#### Mock Factories
```typescript
// Auth Store Mock Factory
export interface MockAuthStore extends AuthState {
  login: Mock;
  logout: Mock;
  register: Mock;
  clearError: Mock;
  updateUser: Mock;
  refreshUser: Mock;
}

export const createMockAuthStore = (overrides?: Partial<MockAuthStore>): MockAuthStore => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn(),
  register: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
  updateUser: vi.fn(),
  refreshUser: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});
```

#### Service Mocks
```typescript
// WebSocket Service Mock
export const createMockWebSocketService = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
  subscribe: vi.fn().mockReturnValue('mock-subscription-id'),
  unsubscribe: vi.fn(),
  onConnectionChange: vi.fn().mockReturnValue(() => {}),
  isConnected: false,
  connectionState: 'disconnected',
});

// Logger Mock
export const createMockLogger = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn().mockReturnThis(),
  configure: vi.fn(),
  getConfiguration: vi.fn().mockReturnValue({
    level: 'debug',
    enableConsole: true,
    enableStructured: false,
    environment: 'test'
  }),
});
```

#### Test Data Factories
```typescript
// User Factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLogin: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Admin User Factory
export const createMockAdminUser = (): User => 
  createMockUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  });
```

#### Test Providers
```typescript
// All-in-one Test Provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

// Custom Render with Providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });
```

## 🧩 Component Testing

### Component Test Strategy
React Testing Library mit User-centric Testing Approach.

#### Dashboard Component Tests
**Datei**: `src/pages/__tests__/EnergyFlowDashboard.test.tsx`

```typescript
describe('EnergyFlowDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup DOM and mock data
  });

  test('should render energy flow visualization', () => {
    render(<EnergyFlowDashboard />);
    
    // Check for key UI elements
    expect(screen.getByText('Energy Flow Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Current Production')).toBeInTheDocument();
    expect(screen.getByText('Consumption')).toBeInTheDocument();
    
    // Check for SVG energy flow diagram
    const svgElement = screen.getByRole('img', { hidden: true });
    expect(svgElement).toBeInTheDocument();
  });

  test('should display real-time energy values', () => {
    render(<EnergyFlowDashboard />);
    
    // Verify energy values are displayed
    expect(screen.getByText(/\\d+\\.\\d+ kW/)).toBeInTheDocument();
    expect(screen.getByText(/\\d+ kWh/)).toBeInTheDocument();
  });

  test('should update values periodically', async () => {
    vi.useFakeTimers();
    render(<EnergyFlowDashboard />);
    
    // Fast-forward time to trigger updates
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Values should have updated
    await waitFor(() => {
      expect(screen.getByText(/Production: \\d+\\.\\d+ kW/)).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
});
```

#### Error Boundary Tests
**Datei**: `src/components/__tests__/ErrorBoundary.test.tsx`

```typescript
describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  test('should catch and display errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument();
    expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
    expect(screen.getByText('Seite neu laden')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('should log errors to logger service', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error',
      expect.objectContaining({
        error: expect.any(Error),
        componentStack: expect.any(String)
      })
    );
    
    consoleSpy.mockRestore();
  });

  test('should allow retry after error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Erneut versuchen');
    fireEvent.click(retryButton);

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
```

## 🏪 Store Testing

### Zustand Store Tests
**Datei**: `src/stores/__tests__/authStore.test.ts`

State management testing mit focus auf business logic.

```typescript
describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // Clear localStorage
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('login functionality', () => {
    test('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login({
          email: 'admin@energy.com',
          password: 'admin123'
        });
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({
          email: 'admin@energy.com',
          role: 'admin'
        })
      );
      expect(result.current.error).toBeNull();
    });

    test('should handle login failure', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid email or password');
    });
  });

  describe('token management', () => {
    test('should store token in localStorage on login', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          email: 'admin@energy.com',
          password: 'admin123'
        });
      });

      expect(localStorage.getItem('auth_token')).toBeTruthy();
    });

    test('should remove token on logout', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Login first
      await act(async () => {
        await result.current.login({
          email: 'admin@energy.com',
          password: 'admin123'
        });
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('error handling', () => {
    test('should clear errors', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ error: 'Some error' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
```

## 🌐 Service Testing

### WebSocket Service Tests
**Datei**: `src/services/__tests__/websocket.service.test.ts`

Real-time communication testing mit sophisticated mocking.

```typescript
describe('WebSocket Service', () => {
  let mockWebSocket: any;
  let mockWebSocketConstructor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock WebSocket implementation
    mockWebSocket = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: WebSocket.CONNECTING,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };

    mockWebSocketConstructor = vi.fn(() => mockWebSocket);
    global.WebSocket = mockWebSocketConstructor;
  });

  test('should connect to WebSocket', () => {
    const service = new MockWebSocketService();
    service.connect();

    expect(mockWebSocketConstructor).toHaveBeenCalledWith(
      expect.stringContaining('ws://')
    );
  });

  test('should handle connection events', () => {
    const service = new MockWebSocketService();
    const connectionCallback = vi.fn();
    
    service.onConnectionChange(connectionCallback);
    service.connect();

    // Simulate connection open
    mockWebSocket.readyState = WebSocket.OPEN;
    const openHandler = mockWebSocket.addEventListener.mock.calls
      .find(call => call[0] === 'open')?.[1];
    
    if (openHandler) {
      openHandler(new Event('open'));
    }

    expect(connectionCallback).toHaveBeenCalledWith(true);
  });

  test('should handle reconnection after connection loss', async () => {
    const service = new MockWebSocketService();
    service.connect();

    // Simulate connection loss
    mockWebSocket.readyState = WebSocket.CLOSED;
    const closeHandler = mockWebSocket.addEventListener.mock.calls
      .find(call => call[0] === 'close')?.[1];
    
    if (closeHandler) {
      closeHandler(new CloseEvent('close', { code: 1006, reason: 'Connection lost' }));
    }

    // Wait for reconnection attempt
    await vi.advanceTimersByTimeAsync(1000);

    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(2);
  });

  test('should subscribe to messages', () => {
    const service = new MockWebSocketService();
    const callback = vi.fn();
    
    const subscriptionId = service.subscribe('energy_update', callback);
    
    expect(subscriptionId).toMatch(/^mock_energy_update_/);
    expect(service['subscriptions']).toHaveLength(1);
  });

  test('should unsubscribe from messages', () => {
    const service = new MockWebSocketService();
    const callback = vi.fn();
    
    const subscriptionId = service.subscribe('energy_update', callback);
    service.unsubscribe(subscriptionId);
    
    expect(service['subscriptions']).toHaveLength(0);
  });
});
```

### Logger Service Tests
**Datei**: `src/utils/__tests__/logger.test.ts`

Professional logging infrastructure testing.

```typescript
describe('Logger Service', () => {
  let consoleSpies: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Spy on console methods
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(consoleSpies).forEach((spy: any) => spy.mockRestore());
  });

  test('should log messages at appropriate levels', () => {
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(consoleSpies.debug).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      'Debug message'
    );
    expect(consoleSpies.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'Info message'
    );
    expect(consoleSpies.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      'Warning message'
    );
    expect(consoleSpies.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'Error message'
    );
  });

  test('should include context in log messages', () => {
    const context = { userId: 123, action: 'login' };
    logger.info('User action', context);

    expect(consoleSpies.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'User action',
      context
    );
  });

  test('should create child loggers with inherited context', () => {
    const childLogger = logger.child({ module: 'auth' });
    childLogger.info('Auth action', { userId: 123 });

    expect(consoleSpies.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'Auth action',
      expect.objectContaining({
        module: 'auth',
        userId: 123
      })
    );
  });

  test('should handle errors with stack traces', () => {
    const error = new Error('Test error');
    logger.error('Operation failed', error);

    expect(consoleSpies.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'Operation failed',
      error
    );
  });

  test('should filter logs based on level', () => {
    logger.configure({ level: 'warn' });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');

    expect(consoleSpies.debug).not.toHaveBeenCalled();
    expect(consoleSpies.info).not.toHaveBeenCalled();
    expect(consoleSpies.warn).toHaveBeenCalled();
  });
});
```

## 🚀 Performance Testing

### Bundle Size Testing
```typescript
// Bundle Size Tests
describe('Bundle Size', () => {
  test('should maintain reasonable chunk sizes', async () => {
    const stats = await getBundleStats();
    
    // Main bundle should be under 500KB
    expect(stats.chunks.main.size).toBeLessThan(500 * 1024);
    
    // Chart chunk should be under 200KB
    expect(stats.chunks.charts.size).toBeLessThan(200 * 1024);
    
    // Vendor chunk should be under 1MB
    expect(stats.chunks.vendor.size).toBeLessThan(1024 * 1024);
  });

  test('should lazy load chart components', async () => {
    const chartImport = await import('@/components/charts/LazyLineChart');
    expect(chartImport.default).toBeDefined();
  });
});
```

### Runtime Performance Testing
```typescript
// Performance Tests
describe('Component Performance', () => {
  test('should render dashboard within performance budget', async () => {
    const startTime = performance.now();
    
    render(<Dashboard />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('should handle large datasets efficiently', () => {
    const largeDataset = generateMockEnergyData('test', 1000);
    
    const startTime = performance.now();
    render(<EnergyChart data={largeDataset} />);
    const endTime = performance.now();
    
    // Should handle 1000 data points within 200ms
    expect(endTime - startTime).toBeLessThan(200);
  });
});
```

## 🔧 Test Commands

### Basic Test Commands
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/stores/__tests__/authStore.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Update snapshots
npm test -- --updateSnapshot
```

### Advanced Test Commands
```bash
# Run tests with UI
npm run test:ui

# Run tests with verbose output
npm test -- --verbose

# Run tests with specific timeout
npm test -- --testTimeout=30000

# Generate coverage report
npm run test:coverage -- --reporter=html

# Run tests in CI mode
npm test -- --run --coverage
```

## 📊 Coverage Targets

### Current Coverage Goals
```typescript
// Coverage Thresholds
coverage: {
  thresholds: {
    statements: 50,    // 50% statement coverage
    branches: 50,      // 50% branch coverage
    functions: 50,     // 50% function coverage
    lines: 50,         // 50% line coverage
  }
}
```

### Coverage per Module
```
- Auth Store: ~85% (Critical business logic)
- WebSocket Service: ~90% (Real-time communication)
- Logger Service: ~95% (Utility functions)
- Error Boundary: ~80% (Error handling)
- Dashboard Components: ~70% (UI + business logic)
- API Services: ~75% (HTTP communication)
```

## 🎯 Testing Best Practices

### 1. Test Structure
```typescript
// AAA Pattern: Arrange, Act, Assert
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Arrange: Setup
  });

  test('should behavior description', () => {
    // Arrange: Setup specific to this test
    const input = createTestData();
    
    // Act: Execute the behavior
    const result = performAction(input);
    
    // Assert: Verify the outcome
    expect(result).toBe(expectedValue);
  });
});
```

### 2. Mock Strategy
```typescript
// Mock External Dependencies
vi.mock('@/services/api', () => ({
  apiService: {
    login: vi.fn().mockResolvedValue(mockResponse),
    getData: vi.fn().mockImplementation((id) => Promise.resolve(mockData[id]))
  }
}));

// Mock Environment Variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3001',
    VITE_APP_ENV: 'test'
  }
}));
```

### 3. Async Testing
```typescript
// Async/Await Pattern
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expectedValue);
});

// waitFor for eventual consistency
test('should update UI after async operation', async () => {
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Updated content')).toBeInTheDocument();
  });
});

// Act wrapper for state updates
test('should update state', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### 4. Component Testing
```typescript
// User-centric testing
test('should allow user to login', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  // User interactions
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  // Verify outcome
  await waitFor(() => {
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

### 5. Error Testing
```typescript
// Error boundary testing
test('should handle component errors gracefully', () => {
  const ThrowError = () => {
    throw new Error('Component error');
  };
  
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  
  consoleSpy.mockRestore();
});
```

## 🔍 Debugging Tests

### Test Debugging Strategies
```typescript
// Debug failing tests
test('debug test', () => {
  render(<Component />);
  
  // Print current DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
  
  // Log test data
  console.log('Test data:', testData);
});

// Test with delays for debugging
test('slow test for debugging', async () => {
  render(<Component />);
  
  // Add delay to see what's happening
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  expect(screen.getByText('Expected text')).toBeInTheDocument();
});
```

### Test Environment Debugging
```typescript
// Check test environment
beforeEach(() => {
  console.log('Test environment:', {
    userAgent: global.navigator.userAgent,
    location: global.location.href,
    localStorage: typeof global.localStorage
  });
});
```

## 📈 Continuous Integration

### CI Test Configuration
```yaml
# GitHub Actions example
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

Die Testing-Strategie bietet comprehensive Abdeckung aller kritischen Anwendungsbereiche mit focus auf Qualität, Performance und Zuverlässigkeit.