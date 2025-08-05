# Frontend Integration Checklist

**CityPulse Energy Management System - API Integration Guide**

---

## 📋 Übersicht

Diese Checkliste führt durch die Integration der Real API in das bestehende Frontend. Das System ist bereits vollständig mit Mock-Daten funktionsfähig und kann nahtlos auf die echte API umgestellt werden.

---

## ✅ Pre-Integration Setup

### Environment Variables
- [ ] **Supabase Credentials hinzufügen**
  ```bash
  # .env.local
  REACT_APP_API_URL=http://localhost:8000/v1
  REACT_APP_SUPABASE_URL=https://[project].supabase.co
  REACT_APP_SUPABASE_ANON_KEY=eyJ...
  ```

- [ ] **Environment-spezifische Configs**
  ```bash
  # Development
  REACT_APP_API_MODE=mock
  
  # Staging
  REACT_APP_API_MODE=hybrid
  
  # Production
  REACT_APP_API_MODE=real
  ```

### Dependencies Check
- [ ] **Erforderliche Packages installiert**
  ```bash
  npm install @supabase/supabase-js
  # Bereits installiert: react-router-dom, zustand, recharts
  ```

---

## 🔧 API Service Integration

### 1. RealApiService Implementation
- [ ] **`realApiService.ts` vervollständigen**
  - Basis-Service bereits erstellt
  - Supabase Client konfigurieren
  - HTTP Client mit Axios/Fetch
  - Error Handling implementieren

**Beispiel Implementation:**
```typescript
// src/services/api/realApiService.ts
import { createClient } from '@supabase/supabase-js';
import type { ApiServiceInterface } from '../types/apiService';

export class RealApiService implements ApiServiceInterface {
  private supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.REACT_APP_SUPABASE_ANON_KEY!
  );

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return {
      user: data.user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    };
  }

  // ... weitere Methoden implementieren
}
```

### 2. API Service Factory Setup
- [ ] **Factory in App.tsx initialisieren**
  ```typescript
  // src/App.tsx
  import { ApiServiceFactory } from './services/api/ApiServiceFactory';

  function App() {
    useEffect(() => {
      // Smart initialization - auto-detects API availability
      ApiServiceFactory.smartInitialize();
    }, []);
    
    return <Router />;
  }
  ```

### 3. Service Layer Updates
- [ ] **Mock API Service kompatibel machen**
  - Interface-Compliance prüfen
  - Fehlende Methoden hinzufügen
  - Error Handling vereinheitlichen

---

## 📡 Real-time Integration

### WebSocket Setup
- [ ] **WebSocket Connection Manager**
  ```typescript
  // src/services/websocket/WebSocketManager.ts
  class WebSocketManager {
    private ws: WebSocket | null = null;
    
    connect(url: string) {
      this.ws = new WebSocket(url);
      this.setupEventHandlers();
    }
    
    subscribe(channel: string, callback: (data: any) => void) {
      // Subscribe to specific channels
    }
  }
  ```

- [ ] **Supabase Real-time Integration**
  ```typescript
  // src/hooks/useRealtimeData.ts
  export const useRealtimeSensors = (buildingId: string) => {
    const [sensors, setSensors] = useState([]);
    
    useEffect(() => {
      const subscription = supabase
        .channel('sensors')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'sensor_readings',
          filter: `building_id=eq.${buildingId}`
        }, (payload) => {
          setSensors(prev => updateSensorData(prev, payload));
        })
        .subscribe();
        
      return () => subscription.unsubscribe();
    }, [buildingId]);
    
    return sensors;
  };
  ```

### Real-time Hooks Implementation
- [ ] **useRealtimeSensors Hook**
- [ ] **useRealtimeAlerts Hook**
- [ ] **useRealtimeEnergyData Hook**

---

## 🔄 Component Integration

### 1. Dashboard Components
- [ ] **Dashboard.tsx**
  - API Service injection via Context/Props
  - Error Boundary integration
  - Loading states

- [ ] **Building Dashboards**
  ```typescript
  // src/pages/buildings/RathausDashboard.tsx
  import { apiService } from '@/services/api/ApiServiceFactory';

  const RathausDashboard = () => {
    const [building, setBuilding] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const loadData = async () => {
        try {
          const data = await apiService().getBuilding('rathaus-hechingen');
          setBuilding(data);
        } catch (error) {
          console.error('Failed to load building:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }, []);
    
    if (loading) return <LoadingSpinner />;
    
    return (
      <div>
        {/* Existing JSX bleibt unverändert */}
      </div>
    );
  };
  ```

### 2. Charts & Visualizations
- [ ] **EnergyChart Component**
  - Real API data integration
  - Real-time updates
  - Error fallbacks

- [ ] **SensorGrid Component**
  - Live sensor readings
  - WebSocket updates
  - Status indicators

### 3. Admin Components
- [ ] **SensorManagement.tsx**
  - CRUD operations
  - Bulk operations
  - Real-time status updates

- [ ] **UserManagement.tsx**
  - User admin functions
  - Role management
  - Audit logs

---

## 🎛️ State Management

### Zustand Store Updates
- [ ] **AuthStore Integration**
  ```typescript
  // src/stores/authStore.ts
  import { apiService } from '@/services/api/ApiServiceFactory';

  export const useAuthStore = create<AuthState>((set, get) => ({
    // ... existing state
    
    login: async (email: string, password: string) => {
      set({ loading: true });
      try {
        const result = await apiService().login(email, password);
        set({ user: result.user, token: result.token, isAuthenticated: true });
        localStorage.setItem('auth_token', result.token);
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    
    // ... weitere Methoden
  }));
  ```

- [ ] **Data Stores hinzufügen**
  - BuildingStore
  - SensorStore
  - AlertStore
  - EnergyDataStore

### Context Providers
- [ ] **API Context Provider**
  ```typescript
  // src/contexts/ApiContext.tsx
  const ApiContext = createContext<ApiServiceInterface | null>(null);

  export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const api = ApiServiceFactory.getInstance();
    
    return (
      <ApiContext.Provider value={api}>
        {children}
      </ApiContext.Provider>
    );
  };

  export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) throw new Error('useApi must be used within ApiProvider');
    return context;
  };
  ```

---

## 🛡️ Error Handling & Loading States

### Error Boundaries
- [ ] **API Error Boundary**
  ```typescript
  // src/components/error/ApiErrorBoundary.tsx
  class ApiErrorBoundary extends React.Component {
    handleApiError = (error: ApiError) => {
      if (error.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      } else if (error.status >= 500) {
        // Show system error
        this.setState({ hasError: true, error });
      }
    };
    
    render() {
      if (this.state.hasError) {
        return <ErrorFallback error={this.state.error} />;
      }
      
      return this.props.children;
    }
  }
  ```

### Loading States
- [ ] **Global Loading Provider**
- [ ] **Component-level Skeletons**
- [ ] **Optimistic Updates**

### Retry Logic
- [ ] **Auto-retry für fehlgeschlagene Requests**
- [ ] **Offline-Modus mit Cache**
- [ ] **Connection Status Indicator**

---

## 🔍 Testing Strategy

### Unit Tests
- [ ] **API Service Tests**
  ```typescript
  // src/services/__tests__/apiService.test.ts
  describe('ApiService', () => {
    it('should login successfully', async () => {
      const mockResponse = { user: mockUser, token: 'token123' };
      jest.spyOn(apiService(), 'login').mockResolvedValue(mockResponse);
      
      const result = await apiService().login('test@test.com', 'password');
      expect(result).toEqual(mockResponse);
    });
  });
  ```

- [ ] **Component Integration Tests**
- [ ] **Hook Tests**

### E2E Tests
- [ ] **Login Flow**
- [ ] **Building Navigation**
- [ ] **Real-time Updates**
- [ ] **Error Scenarios**

---

## 🚀 Deployment Integration

### Environment Configs
- [ ] **Development**
  ```bash
  REACT_APP_API_MODE=mock
  REACT_APP_API_URL=http://localhost:8000/v1
  ```

- [ ] **Staging**
  ```bash
  REACT_APP_API_MODE=hybrid
  REACT_APP_API_URL=https://staging-api.citypulse.com/v1
  ```

- [ ] **Production**
  ```bash
  REACT_APP_API_MODE=real
  REACT_APP_API_URL=https://api.citypulse.com/v1
  ```

### Build Configuration
- [ ] **Build Scripts anpassen**
  ```json
  {
    "scripts": {
      "build:dev": "REACT_APP_API_MODE=mock npm run build",
      "build:staging": "REACT_APP_API_MODE=hybrid npm run build",
      "build:prod": "REACT_APP_API_MODE=real npm run build"
    }
  }
  ```

---

## 🔧 Development Tools

### API Mode Switching
- [ ] **Development Console Commands**
  ```typescript
  // Available in development console
  window.CityPulseAPI.switchToMock();    // Switch to mock data
  window.CityPulseAPI.switchToReal();    // Switch to real API
  window.CityPulseAPI.switchToHybrid();  // Switch to hybrid mode
  window.CityPulseAPI.getConfig();       // Show current config
  window.CityPulseAPI.checkRealAPI();    // Test real API availability
  ```

### Debug Tools
- [ ] **API Request Logger**
- [ ] **Performance Profiler**
- [ ] **WebSocket Connection Monitor**

---

## 📊 Performance Optimization

### Caching Strategy
- [ ] **Response Caching**
  ```typescript
  // src/services/cache/ApiCache.ts
  class ApiCache {
    private cache = new Map();
    
    get(key: string) {
      const item = this.cache.get(key);
      if (item && item.expires > Date.now()) {
        return item.data;
      }
      return null;
    }
    
    set(key: string, data: any, ttl = 5 * 60 * 1000) {
      this.cache.set(key, {
        data,
        expires: Date.now() + ttl
      });
    }
  }
  ```

### Bundle Optimization
- [ ] **Code Splitting für API Services**
- [ ] **Lazy Loading für Heavy Components**
- [ ] **WebSocket Connection Pooling**

---

## 🚦 Migration Checklist

### Phase 1: Preparation
- [ ] Environment Variables konfiguriert
- [ ] RealApiService implementiert
- [ ] Error Handling getestet

### Phase 2: Soft Launch
- [ ] API Mode auf 'hybrid' umstellen
- [ ] Real API für non-critical Endpoints testen
- [ ] Fallback auf Mock bei Fehlern

### Phase 3: Full Migration
- [ ] API Mode auf 'real' umstellen
- [ ] Monitoring aktivieren
- [ ] Performance überwachen

### Phase 4: Cleanup
- [ ] Mock Service Code entfernen (optional)
- [ ] Unused Dependencies cleanup
- [ ] Documentation updaten

---

## 🆘 Troubleshooting

### Häufige Probleme
- [ ] **CORS Issues**
  - Backend CORS Configuration prüfen
  - Allowed Origins verifizieren

- [ ] **Authentication Failures**
  - Token Expiry handling
  - Refresh Token Flow

- [ ] **WebSocket Connection Issues**
  - Network Proxies
  - Firewall Configurations

### Debug Commands
```typescript
// API Status Check
await ApiServiceFactory.isRealApiAvailable();

// Test specific endpoint
await apiService().getBuildings();

// WebSocket connection test
apiService().connectWebSocket();
```

---

## 📈 Success Metrics

### Technical KPIs
- [ ] **API Response Times** < 200ms
- [ ] **Error Rate** < 1%
- [ ] **WebSocket Latency** < 100ms
- [ ] **Bundle Size** < 500KB

### User Experience
- [ ] **Loading Times** < 2s initial load
- [ ] **Real-time Updates** < 1s delay
- [ ] **Offline Graceful Degradation**

---

## 🎯 Final Validation

### Complete Feature Test
- [ ] Login/Logout funktioniert
- [ ] Alle 7 Gebäude Navigation
- [ ] Real-time Sensor Updates
- [ ] Alert Management
- [ ] Admin Functions
- [ ] Analytics & Charts
- [ ] Mobile Responsiveness

### Performance Validation
- [ ] Lighthouse Score > 90
- [ ] Core Web Vitals grün
- [ ] Memory Leaks geprüft
- [ ] Battery Impact minimal

---

**Integration Ready! 🚀**

Dieses Frontend ist vollständig vorbereitet für die API-Integration. Alle erforderlichen Interfaces, Services und Components sind implementiert und warten nur auf die Backend-Verbindung.