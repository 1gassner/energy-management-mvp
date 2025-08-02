# State Management Dokumentation

## 📚 Übersicht

Das Energy Management MVP nutzt **Zustand** für modernes State Management mit TypeScript-Integration, Persistierung und optimaler Performance. Die Architektur folgt bewährten Patterns für skalierbare und wartbare Anwendungen.

## 🏪 Zustand Store Architecture

### Core Principles
- **Immutable State**: Unveränderliche State-Updates
- **TypeScript Integration**: Vollständige Typisierung
- **Middleware Support**: Persistence, DevTools, Logging
- **Modular Design**: Separate Stores für verschiedene Bereiche
- **Performance Optimized**: Selektive Re-renders

### Store Structure
```
stores/
├── authStore.ts          # Authentication & User Management
├── energyStore.ts        # Energy Data & Real-time Updates
├── uiStore.ts           # UI State & Preferences
├── settingsStore.ts     # Application Settings
└── __tests__/           # Store Tests
```

## 🔐 Auth Store

### Auth Store Architecture
**Datei**: `src/stores/authStore.ts`

Zentrale Authentifizierungs- und Benutzerverwaltung mit Zustand.

#### State Interface
```typescript
interface AuthState {
  user: User | null;              // Current user data
  isAuthenticated: boolean;       // Authentication status
  isLoading: boolean;            // Loading state
  error: string | null;          // Error messages
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}
```

#### Zustand Store Implementation
```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login(credentials);
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          notificationService.success(`Willkommen zurück, ${response.user.name}!`);
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          notificationService.error(errorMessage);
          return false;
        }
      },

      // ... weitere Actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### Persistence Configuration
```typescript
// Persistence Middleware
{
  name: 'auth-storage',                    // Storage key
  storage: createJSONStorage(() => localStorage),  // Storage engine
  partialize: (state) => ({              // Only persist specific state
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    // error and isLoading are NOT persisted
  }),
}
```

#### Usage in Components
```typescript
// Full store access
const authStore = useAuthStore();

// Selective subscriptions (optimized re-renders)
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const login = useAuthStore((state) => state.login);

// Component usage
const LoginComponent = () => {
  const { login, isLoading, error } = useAuthStore();
  
  const handleLogin = async (credentials: LoginCredentials) => {
    const success = await login(credentials);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Anmelden...' : 'Anmelden'}
      </button>
    </form>
  );
};
```

### Auth Store Features

#### 1. Automatic Token Management
```typescript
// Token storage in localStorage
localStorage.setItem('auth_token', response.token);

// Token cleanup on logout
localStorage.removeItem('auth_token');

// Token refresh on app start
refreshUser: async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    set({ user: null, isAuthenticated: false });
    return;
  }

  try {
    const user = await apiService.refreshUser();
    set({ user, isAuthenticated: true, isLoading: false });
  } catch (error) {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  }
}
```

#### 2. Error Handling
```typescript
// Consistent error handling pattern
try {
  const response = await apiService.login(credentials);
  // Success path
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Standardfehler';
  
  set({ error: errorMessage, isLoading: false });
  notificationService.error(errorMessage);
  return false;
}
```

#### 3. Notification Integration
```typescript
// Success notifications
notificationService.success(`Willkommen zurück, ${response.user.name}!`);

// Error notifications
notificationService.error(errorMessage);

// Info notifications
notificationService.info('Sie wurden erfolgreich abgemeldet');
```

## 🌊 Energy Store (Beispiel)

### Energy Data Management
```typescript
interface EnergyState {
  currentData: EnergyData | null;
  historicalData: EnergyData[];
  realTimeUpdates: boolean;
  selectedBuilding: string | null;
  timeRange: TimeRange;
  isLoading: boolean;
}

interface EnergyStore extends EnergyState {
  // Data Actions
  loadEnergyData: (buildingId: string, timeRange: TimeRange) => Promise<void>;
  updateRealTimeData: (data: EnergyData) => void;
  setSelectedBuilding: (buildingId: string) => void;
  setTimeRange: (range: TimeRange) => void;
  
  // Real-time Actions
  enableRealTimeUpdates: () => void;
  disableRealTimeUpdates: () => void;
}

export const useEnergyStore = create<EnergyStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentData: null,
      historicalData: [],
      realTimeUpdates: false,
      selectedBuilding: null,
      timeRange: '24h',
      isLoading: false,

      // Actions
      loadEnergyData: async (buildingId, timeRange) => {
        set({ isLoading: true });
        
        try {
          const data = await apiService.getEnergyData(buildingId, timeRange);
          set({ 
            historicalData: data, 
            selectedBuilding: buildingId,
            timeRange,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          logger.error('Failed to load energy data', error as Error);
        }
      },

      updateRealTimeData: (data) => {
        set((state) => ({
          currentData: data,
          historicalData: [...state.historicalData.slice(-99), data] // Keep last 100 entries
        }));
      },

      setSelectedBuilding: (buildingId) => {
        set({ selectedBuilding: buildingId });
        // Auto-load data for new building
        get().loadEnergyData(buildingId, get().timeRange);
      },

      enableRealTimeUpdates: () => {
        set({ realTimeUpdates: true });
        // Setup WebSocket subscription
      },

      disableRealTimeUpdates: () => {
        set({ realTimeUpdates: false });
        // Cleanup WebSocket subscription
      },
    }),
    { name: 'energy-store' }
  )
);
```

## 🎨 UI Store (Beispiel)

### UI State Management
```typescript
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  modal: {
    isOpen: boolean;
    type: string | null;
    data: unknown;
  };
  loading: {
    [key: string]: boolean;
  };
}

interface UIStore extends UIState {
  // Theme Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Sidebar Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal Actions
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Loading Actions
  setLoading: (key: string, loading: boolean) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial State
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      modal: { isOpen: false, type: null, data: null },
      loading: {},

      // Theme Actions
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Sidebar Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Modal Actions
      openModal: (type, data) => set({ modal: { isOpen: true, type, data } }),
      closeModal: () => set({ modal: { isOpen: false, type: null, data: null } }),

      // Loading Actions
      setLoading: (key, loading) => set((state) => ({
        loading: { ...state.loading, [key]: loading }
      })),

      // Notification Actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }]
        }));
        
        // Auto-remove after timeout
        setTimeout(() => {
          get().removeNotification(id);
        }, notification.duration || 5000);
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
```

## 🔧 Zustand Best Practices

### 1. Store Design Patterns

#### Single Responsibility
```typescript
// ✅ Good: Focused store
const useAuthStore = create(() => ({
  user: null,
  login: async () => {},
  logout: async () => {},
}));

// ❌ Bad: Mixed responsibilities
const useAppStore = create(() => ({
  user: null,
  theme: 'light',
  energyData: [],
  notifications: [],
  // Too many different concerns in one store
}));
```

#### Selective Subscriptions
```typescript
// ✅ Good: Selective subscription
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);

// ❌ Bad: Full store subscription
const authStore = useAuthStore(); // Re-renders on ANY state change
```

#### Immutable Updates
```typescript
// ✅ Good: Immutable updates
set((state) => ({
  notifications: [...state.notifications, newNotification]
}));

// ❌ Bad: Mutation
set((state) => {
  state.notifications.push(newNotification); // Mutates state
  return state;
});
```

### 2. Performance Optimization

#### Computed Values
```typescript
// Computed values with selectors
const useEnergyMetrics = () => {
  return useEnergyStore((state) => {
    if (!state.currentData) return null;
    
    return {
      efficiency: state.currentData.production / state.currentData.consumption,
      totalSaved: state.currentData.co2Saved,
      status: state.currentData.production > state.currentData.consumption ? 'surplus' : 'deficit'
    };
  });
};
```

#### Shallow Comparison
```typescript
// Use shallow comparison for objects
import { shallow } from 'zustand/shallow';

const { user, isAuthenticated } = useAuthStore(
  (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  shallow
);
```

#### Subscriptions Outside React
```typescript
// Subscribe outside React components
const unsubscribe = useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startBackgroundServices();
    } else {
      stopBackgroundServices();
    }
  }
);

// Cleanup
useEffect(() => unsubscribe, []);
```

### 3. Middleware Configuration

#### DevTools Integration
```typescript
import { devtools } from 'zustand/middleware';

export const useEnergyStore = create<EnergyStore>()(
  devtools(
    (set, get) => ({ /* store implementation */ }),
    { name: 'energy-store' } // DevTools name
  )
);
```

#### Persistence Options
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

// localStorage persistence
persist(
  storeImplementation,
  {
    name: 'energy-settings',
    storage: createJSONStorage(() => localStorage),
  }
)

// sessionStorage persistence
persist(
  storeImplementation,
  {
    name: 'session-data',
    storage: createJSONStorage(() => sessionStorage),
  }
)

// Custom storage
persist(
  storeImplementation,
  {
    name: 'custom-storage',
    storage: {
      getItem: (name) => /* custom get */,
      setItem: (name, value) => /* custom set */,
      removeItem: (name) => /* custom remove */,
    }
  }
)
```

#### Logging Middleware
```typescript
import { logger } from '@/utils/logger';

const loggerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      logger.debug('Store update', { args });
      set(...args);
    },
    get,
    api
  );

export const useEnergyStore = create<EnergyStore>()(
  loggerMiddleware(
    devtools(
      persist(storeImplementation, persistConfig),
      { name: 'energy-store' }
    )
  )
);
```

### 4. Testing Stores

#### Store Testing Strategy
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  test('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });

  test('should handle login errors', async () => {
    // Mock API error
    jest.spyOn(apiService, 'login').mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });
});
```

#### Store State Testing
```typescript
// Test state transitions
test('should update user profile', () => {
  const initialState = useAuthStore.getState();
  expect(initialState.user).toBeNull();

  // Set user
  useAuthStore.getState().updateUser({
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  });

  const updatedState = useAuthStore.getState();
  expect(updatedState.user?.name).toBe('Test User');
});

// Test persistence
test('should persist auth state', () => {
  useAuthStore.getState().login(credentials);
  
  // Simulate page reload
  const persistedState = JSON.parse(
    localStorage.getItem('auth-storage') || '{}'
  );
  
  expect(persistedState.state.isAuthenticated).toBe(true);
});
```

## 🚀 Advanced Patterns

### 1. Store Composition
```typescript
// Compose multiple stores
const useAppData = () => {
  const auth = useAuthStore();
  const energy = useEnergyStore();
  const ui = useUIStore();

  return {
    auth,
    energy,
    ui,
    // Computed values across stores
    canViewAnalytics: auth.user?.role === 'admin' && energy.selectedBuilding,
    isDarkMode: ui.theme === 'dark',
  };
};
```

### 2. Store Slices
```typescript
// Create store slices for large stores
interface UserSlice {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
}

interface SessionSlice {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

const createUserSlice: StateCreator<AuthStore, [], [], UserSlice> = (set) => ({
  user: null,
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
});

const createSessionSlice: StateCreator<AuthStore, [], [], SessionSlice> = (set) => ({
  isAuthenticated: false,
  token: null,
  login: async (credentials) => { /* implementation */ },
  logout: async () => { /* implementation */ },
});

// Combine slices
export const useAuthStore = create<AuthStore>()((...a) => ({
  ...createUserSlice(...a),
  ...createSessionSlice(...a),
}));
```

### 3. Store Subscriptions
```typescript
// Subscribe to specific state changes
const useAuthSubscription = () => {
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated, previousValue) => {
        if (isAuthenticated && !previousValue) {
          // User just logged in
          logger.info('User authenticated');
          // Initialize user-specific data
        } else if (!isAuthenticated && previousValue) {
          // User just logged out
          logger.info('User logged out');
          // Cleanup user-specific data
        }
      }
    );

    return unsubscribe;
  }, []);
};
```

## 📊 Store Performance Monitoring

### Performance Metrics
```typescript
// Store performance monitoring
const storePerformanceMiddleware = (config) => (set, get, api) => {
  let updateCount = 0;
  let lastUpdate = Date.now();

  return config(
    (...args) => {
      const now = Date.now();
      updateCount++;
      
      // Log frequent updates
      if (now - lastUpdate < 100) {
        logger.warn('Frequent store updates detected', {
          updateCount,
          timeSinceLastUpdate: now - lastUpdate
        });
      }
      
      lastUpdate = now;
      set(...args);
    },
    get,
    api
  );
};
```

### Memory Usage Monitoring
```typescript
// Monitor store size
const getStoreSize = (store: any) => {
  const stateSize = JSON.stringify(store.getState()).length;
  return {
    stateSize,
    stateSizeKB: Math.round(stateSize / 1024 * 100) / 100,
  };
};

// Periodic monitoring
setInterval(() => {
  const authSize = getStoreSize(useAuthStore);
  const energySize = getStoreSize(useEnergyStore);
  
  logger.debug('Store sizes', { authSize, energySize });
}, 30000); // Every 30 seconds
```

Das State Management mit Zustand bietet eine moderne, performante und typsichere Lösung für die Energy Management MVP mit klaren Patterns und optimaler Developer Experience.