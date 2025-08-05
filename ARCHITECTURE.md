# 🏗️ CityPulse Hechingen - System Architecture

## 📐 Architecture Overview

CityPulse Hechingen follows a modern, scalable architecture designed for real-time energy monitoring and management across municipal buildings.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages     │  │  Components  │  │  State (Zustand) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │              ServiceFactory Pattern                 │     │
│  │  ┌─────────────┐              ┌─────────────────┐  │     │
│  │  │ MockService │              │   ApiService    │  │     │
│  │  │  (Active)  │              │   (Pending)     │  │     │
│  │  └─────────────┘              └─────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS/WSS
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Pending)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  API Server │  │  WebSocket   │  │  Auth Service    │   │
│  │  (REST)     │  │   Server     │  │     (JWT)        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │                    Database Layer                    │     │
│  │  ┌─────────────┐              ┌─────────────────┐  │     │
│  │  │ PostgreSQL  │              │     Redis       │  │     │
│  │  │/TimescaleDB │              │    (Cache)      │  │     │
│  │  └─────────────┘              └─────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ MQTT/LoRaWAN (Future)
                               │
┌─────────────────────────────────────────────────────────────┐
│                    IoT Layer (Future)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  LoRaWAN    │  │    MQTT      │  │  Sensor Network  │   │
│  │  Gateway    │  │    Broker    │  │  (745 Sensors)   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── pages/              # Route-based page components
│   ├── dashboard/      # Main dashboards
│   ├── buildings/      # Building-specific views
│   ├── admin/          # Administrative interfaces
│   ├── analytics/      # Analytics dashboards
│   ├── optimization/   # Energy optimization
│   └── finance/        # Budget management
├── components/         # Reusable UI components
│   ├── ui/            # Base UI elements
│   ├── charts/        # Data visualizations
│   └── layout/        # Layout components
├── services/          # API and data services
│   ├── api/          # API service layer
│   └── mock/         # Mock data services
├── stores/           # Zustand state management
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

### ServiceFactory Pattern

The ServiceFactory pattern enables seamless switching between mock and real data:

```typescript
// ServiceFactory.ts
export class ServiceFactory {
  private static instance: IService;

  static getService(): IService {
    if (!this.instance) {
      this.instance = import.meta.env.VITE_USE_MOCK === 'true'
        ? new MockService()
        : new ApiService();
    }
    return this.instance;
  }
}

// Usage in components
const service = ServiceFactory.getService();
const buildings = await service.getBuildings();
```

### State Management (Zustand)

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// connectionStore.ts
interface ConnectionState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastUpdate: Date | null;
}
```

### Routing Structure

```typescript
/                     → Redirect
/login               → Authentication
/dashboard           → Main dashboard
/buildings/:id       → Building details
/admin/*            → Admin functions
/analytics          → Analytics dashboard
/optimization       → Energy optimization
/budget            → Financial management
/maintenance       → Maintenance planning
/reports          → Report generation
```

## 🔧 Backend Architecture (Specification)

### API Layer
- **Framework**: Express.js/FastAPI
- **Protocol**: REST + WebSocket
- **Authentication**: JWT with refresh tokens
- **Rate Limiting**: Per-endpoint limits
- **CORS**: Configured for frontend URLs

### Database Design

```sql
-- Core Tables
buildings (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR,
  address TEXT,
  metadata JSONB
)

sensors (
  id VARCHAR PRIMARY KEY,
  building_id VARCHAR REFERENCES buildings,
  type VARCHAR NOT NULL,
  location TEXT,
  thresholds JSONB,
  metadata JSONB
)

sensor_data (
  time TIMESTAMPTZ NOT NULL,
  sensor_id VARCHAR REFERENCES sensors,
  value DECIMAL,
  unit VARCHAR,
  PRIMARY KEY (sensor_id, time)
) -- TimescaleDB Hypertable

devices (
  id VARCHAR PRIMARY KEY,
  building_id VARCHAR REFERENCES buildings,
  type VARCHAR,
  status VARCHAR,
  metadata JSONB
)

users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  role VARCHAR,
  permissions TEXT[]
)
```

### Service Architecture

```typescript
// Microservices approach (future)
├── auth-service/      # Authentication & authorization
├── sensor-service/    # Sensor data management
├── analytics-service/ # Data processing & analytics
├── notification-service/ # Alerts & notifications
└── gateway/          # API Gateway
```

## 🔄 Data Flow

### Real-time Data Pipeline
```
Sensor → LoRaWAN → Gateway → MQTT → Backend → WebSocket → Frontend
                                         ↓
                                   TimescaleDB
                                         ↓
                                    Analytics
```

### Request Flow
```
Frontend → API Gateway → Service → Database
    ↑          ↓           ↓          ↓
    ← ← ← ← Response ← ← Cache ← ← ←
```

## 🔐 Security Architecture

### Authentication Flow
```
1. User Login → Frontend
2. Frontend → POST /api/auth/login
3. Backend validates credentials
4. Backend generates JWT (15min) + Refresh Token (7d)
5. Frontend stores tokens securely
6. All requests include Bearer token
7. Token refresh before expiry
```

### Security Layers
- **Transport**: HTTPS/WSS only
- **Authentication**: JWT with short expiry
- **Authorization**: Role-based permissions
- **API Security**: Rate limiting, CORS
- **Data**: Encryption at rest
- **Monitoring**: Audit logs

## 📊 Mock System Architecture

### Mock Data Generation
```typescript
class MockDataGenerator {
  // Realistic sensor values
  generateSensorValue(type: SensorType): number {
    switch(type) {
      case 'temperature':
        return 20 + Math.random() * 5; // 20-25°C
      case 'energy':
        return 80 + Math.random() * 40; // 80-120 kW
      // ...
    }
  }

  // WebSocket simulation
  startSimulation() {
    setInterval(() => {
      const event = this.generateRandomEvent();
      this.emit('sensor:update', event);
    }, 5000); // Every 5 seconds
  }
}
```

### Mock Service Implementation
```typescript
class MockService implements IService {
  private data = mockData;
  
  async getBuildings(): Promise<Building[]> {
    // Simulate network delay
    await delay(200);
    return this.data.buildings;
  }
  
  async getSensorData(id: string): Promise<SensorData[]> {
    // Generate historical data
    return generateTimeSeries(id, 24); // 24 hours
  }
}
```

## 🚀 Deployment Architecture

### Current State (Frontend Only)
```
Vercel
  └── React App (Static)
      └── Mock Data (In-Memory)
```

### Target State (With Backend)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │     │   Backend   │     │  Database   │
│  (Frontend) │ ←→  │   Server    │ ←→  │ PostgreSQL  │
└─────────────┘     └─────────────┘     └─────────────┘
                           ↓
                    ┌─────────────┐
                    │    Redis    │
                    │   (Cache)   │
                    └─────────────┘
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Frontend: CDN distribution via Vercel
- Backend: Load balancer + multiple instances
- Database: Read replicas for analytics
- Cache: Redis cluster

### Data Retention
- Raw data: 30 days (high resolution)
- Aggregated: 2 years (hourly)
- Reports: 5 years (monthly)

### Performance Targets
- API Response: < 200ms (p95)
- WebSocket Latency: < 50ms
- Dashboard Load: < 2s
- Concurrent Users: 100+

## 🔌 Integration Points

### Current Integrations
- None (standalone system)

### Planned Integrations
- **LoRaWAN Network**: Sensor data ingestion
- **Weather API**: Correlation analysis
- **Energy Market API**: Price optimization
- **Municipal Systems**: User management
- **Email Service**: Notifications
- **SMS Gateway**: Critical alerts

## 🏭 Development Patterns

### Design Patterns Used
1. **ServiceFactory**: API abstraction
2. **Repository**: Data access layer
3. **Observer**: WebSocket events
4. **Singleton**: Service instances
5. **Strategy**: Chart renderers

### Code Organization
- **Feature-based**: Grouped by functionality
- **Barrel exports**: Clean imports
- **Type safety**: Strict TypeScript
- **Immutability**: State management
- **Composition**: React components

## 🔮 Future Architecture

### Phase 2: IoT Integration
- MQTT broker for sensor data
- Edge computing for preprocessing
- Sensor provisioning system

### Phase 3: AI/ML Platform
- Time series prediction
- Anomaly detection
- Optimization algorithms
- Digital twin simulation

### Phase 4: Multi-Tenant
- Tenant isolation
- Shared infrastructure
- Custom domains
- White-labeling

---

**Note**: This architecture document reflects the current MVP implementation with a complete frontend and pending backend. The system is designed to scale from 7 to 40+ buildings without major architectural changes.