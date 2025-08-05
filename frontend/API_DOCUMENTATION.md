# 📡 CityPulse API Documentation

**Version:** 1.0.0  
**Last Updated:** August 3, 2025

---

## 📋 Table of Contents

1. [API Overview](#-api-overview)
2. [Authentication](#-authentication)
3. [Core Endpoints](#-core-endpoints)
4. [WebSocket Events](#-websocket-events)
5. [Data Models](#-data-models)
6. [Error Handling](#-error-handling)
7. [Rate Limiting](#-rate-limiting)
8. [SDK Usage](#-sdk-usage)

---

## 🌐 API Overview

CityPulse bietet eine umfassende RESTful API mit zusätzlicher WebSocket-Unterstützung für Echtzeit-Funktionen. Das System unterstützt sowohl Mock- als auch Real-API-Services über das Service Factory Pattern.

### Base URLs
- **Development (Mock):** `http://localhost:5173/api` (Mock Services)
- **Staging:** `https://staging-api.citypulse-hechingen.de/api`
- **Production:** `https://api.citypulse-hechingen.de/api`

### API Features
- **RESTful Design** - Standard HTTP methods und Status codes
- **JWT Authentication** - Token-basierte Authentifizierung
- **Real-time Updates** - WebSocket-Integration
- **Role-based Access** - RBAC-System
- **Comprehensive Monitoring** - 745+ Sensoren in 7 Gebäuden
- **Multi-format Support** - JSON primary, CSV export verfügbar

---

## 🔐 Authentication

### JWT Token-based Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hechingen.de",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "admin@hechingen.de",
      "name": "Administrator",
      "role": "admin",
      "createdAt": "2024-01-15T09:00:00Z",
      "lastLogin": "2025-08-03T14:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login erfolgreich"
}
```

#### Demo User Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@hechingen.de | admin123 | Vollzugriff auf alle Systeme |
| **Techniker** | techniker@hechingen.de | tech123 | Wartung & Sensor-Management |
| **Energiemanager** | energie@hechingen.de | energie123 | Analytics & Optimierung |
| **Gebäudeverwalter** | verwalter@hechingen.de | verwalter123 | Betriebsüberwachung |
| **Bürger** | buerger@hechingen.de | buerger123 | Öffentliche Daten |
| **Analyst** | analyst@hechingen.de | analyst123 | AI-Analytics |

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Token Refresh
```http
GET /api/auth/refresh
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Authorization Header
Alle geschützten Endpoints benötigen den Authorization Header:
```http
Authorization: Bearer {jwt_token}
```

---

## 📊 Core Endpoints

### Energy Data

#### Get Energy Data
```http
GET /api/energy?buildingId={id}&period={period}
Authorization: Bearer {token}
```

**Parameters:**
- `buildingId` (optional): Specific building ID
- `period` (optional): `hour`, `day`, `week`, `month`, `year`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "energy-001",
      "buildingId": "rathaus",
      "timestamp": "2025-08-03T14:00:00Z",
      "produced": 125.5,
      "consumed": 98.2,
      "efficiency": 0.78,
      "co2Saved": 15.6,
      "source": "sensor_network",
      "metadata": {
        "weather": "sunny",
        "temperature": 24.5,
        "humidity": 65
      }
    }
  ]
}
```

#### Get Latest Energy Data
```http
GET /api/energy/latest/{buildingId}
Authorization: Bearer {token}
```

### Buildings

#### Get All Buildings
```http
GET /api/buildings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rathaus",
      "name": "Rathaus Hechingen",
      "type": "administrative",
      "address": "Marktplatz 1, 72379 Hechingen",
      "totalSensors": 125,
      "status": "online",
      "coordinates": {
        "lat": 48.3519,
        "lng": 8.9615
      },
      "energyConfig": {
        "capacity": 500.0,
        "peakConsumption": 320.0,
        "averageConsumption": 180.5
      },
      "lastUpdate": "2025-08-03T14:30:00Z"
    }
  ]
}
```

#### Building Details
```http
GET /api/buildings/{buildingId}
Authorization: Bearer {token}
```

#### Update Building
```http
PUT /api/buildings/{buildingId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Building Name",
  "energyConfig": {
    "capacity": 600.0
  }
}
```

### Sensors

#### Get Sensors
```http
GET /api/sensors?buildingId={id}&type={type}&status={status}
Authorization: Bearer {token}
```

**Parameters:**
- `buildingId` (optional): Filter by building
- `type` (optional): `energy`, `temperature`, `humidity`, `co2`, `motion`
- `status` (optional): `online`, `offline`, `maintenance`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sensor-001",
      "buildingId": "rathaus",
      "name": "Haupteingang Energiemesser",
      "type": "energy",
      "location": "Erdgeschoss, Haupteingang",
      "status": "online",
      "value": 125.5,
      "unit": "kWh",
      "lastReading": "2025-08-03T14:30:00Z",
      "calibrationDate": "2025-01-15T10:00:00Z",
      "alertThresholds": {
        "low": 50,
        "high": 200,
        "critical": 250
      }
    }
  ]
}
```

#### Sensor Details
```http
GET /api/sensors/{sensorId}
Authorization: Bearer {token}
```

#### Update Sensor
```http
PUT /api/sensors/{sensorId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Sensor Name",
  "alertThresholds": {
    "high": 180
  }
}
```

### Alerts

#### Get Alerts
```http
GET /api/alerts?buildingId={id}&severity={level}&status={status}
Authorization: Bearer {token}
```

**Parameters:**
- `buildingId` (optional): Filter by building
- `severity` (optional): `low`, `medium`, `high`, `critical`
- `status` (optional): `active`, `acknowledged`, `resolved`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-001",
      "buildingId": "gymnasium",
      "sensorId": "sensor-045",
      "type": "energy_spike",
      "severity": "high",
      "status": "active",
      "title": "Hoher Energieverbrauch erkannt",
      "description": "Ungewöhnlich hoher Energieverbrauch in der Sporthalle",
      "value": 245.8,
      "threshold": 200.0,
      "timestamp": "2025-08-03T14:15:00Z",
      "acknowledgments": [],
      "escalationLevel": 1,
      "metadata": {
        "location": "Sporthalle A",
        "affectedSystems": ["heating", "lighting"]
      }
    }
  ]
}
```

#### Mark Alert as Read
```http
PUT /api/alerts/{alertId}/acknowledge
Authorization: Bearer {token}
```

#### Resolve Alert
```http
PUT /api/alerts/{alertId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolution": "Problem wurde durch Techniker behoben",
  "resolvedBy": "techniker@hechingen.de"
}
```

### Analytics

#### Get Analytics Data
```http
GET /api/analytics?period={period}&buildingId={id}
Authorization: Bearer {token}
```

**Parameters:**
- `period`: `day`, `week`, `month`, `year`
- `buildingId` (optional): Specific building analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "buildingId": "all",
    "summary": {
      "totalEnergyProduced": 8542.5,
      "totalEnergyConsumed": 7234.2,
      "efficiency": 0.85,
      "co2Saved": 892.4,
      "costSavings": 1234.56
    },
    "trends": {
      "energyProduction": 5.2,
      "energyConsumption": -2.1,
      "efficiency": 3.8,
      "co2Savings": 8.5
    },
    "predictions": {
      "nextWeekConsumption": 7456.8,
      "efficiency": 0.87,
      "confidence": 0.92
    },
    "timeSeriesData": [
      {
        "timestamp": "2025-08-01T00:00:00Z",
        "produced": 1245.6,
        "consumed": 1089.2,
        "efficiency": 0.87
      }
    ]
  }
}
```

#### Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEnergyProduced": 12543.8,
    "totalEnergyConsumed": 10234.5,
    "totalCO2Saved": 1456.7,
    "totalBuildings": 7,
    "activeAlerts": 3,
    "systemEfficiency": 0.82,
    "trends": {
      "energyProduction": 8.5,
      "energyConsumption": -3.2,
      "efficiency": 5.8,
      "co2Savings": 12.4
    }
  }
}
```

---

## 🔄 WebSocket Events

### Connection

#### WebSocket URL
- **Development:** `ws://localhost:5173/ws`
- **Staging:** `wss://staging-api.citypulse-hechingen.de/ws`
- **Production:** `wss://api.citypulse-hechingen.de/ws`

#### Authentication
```json
{
  "type": "authenticate",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-08-03T14:30:00Z"
}
```

### Subscriptions

#### Subscribe to Building Updates
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "building_updates",
    "buildingId": "rathaus"
  },
  "timestamp": "2025-08-03T14:30:00Z"
}
```

#### Subscribe to Alert Notifications
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "alerts",
    "severity": ["high", "critical"]
  },
  "timestamp": "2025-08-03T14:30:00Z"
}
```

### Real-time Events

#### Energy Data Update
```json
{
  "type": "energy_update",
  "payload": {
    "buildingId": "gymnasium",
    "sensorId": "sensor-045",
    "timestamp": "2025-08-03T14:32:00Z",
    "value": 178.5,
    "unit": "kWh",
    "previous": 165.2,
    "change": 8.1
  },
  "timestamp": "2025-08-03T14:32:00Z",
  "source": "sensor_network"
}
```

#### Alert Notification
```json
{
  "type": "alert",
  "payload": {
    "id": "alert-002",
    "buildingId": "hallenbad",
    "severity": "critical",
    "type": "system_failure",
    "title": "Pumpsystem Ausfall",
    "description": "Hauptpumpe im Hallenbad nicht erreichbar",
    "timestamp": "2025-08-03T14:35:00Z",
    "requiresImmediate": true
  },
  "timestamp": "2025-08-03T14:35:00Z",
  "source": "monitoring_system"
}
```

#### Building Status Update
```json
{
  "type": "building_status",
  "payload": {
    "buildingId": "realschule",
    "status": "maintenance",
    "systems": {
      "heating": "online",
      "lighting": "maintenance",
      "ventilation": "online",
      "security": "online"
    },
    "maintenanceWindow": {
      "start": "2025-08-03T16:00:00Z",
      "end": "2025-08-03T18:00:00Z"
    }
  },
  "timestamp": "2025-08-03T14:40:00Z",
  "source": "facility_management"
}
```

#### Sensor Data Stream
```json
{
  "type": "sensor_data",
  "payload": {
    "sensorId": "sensor-089",
    "buildingId": "sporthallen",
    "readings": [
      {
        "timestamp": "2025-08-03T14:45:00Z",
        "temperature": 22.5,
        "humidity": 58.2,
        "co2": 420,
        "motion": true
      }
    ],
    "batch": true
  },
  "timestamp": "2025-08-03T14:45:00Z",
  "source": "sensor_batch_processor"
}
```

### WebSocket Client Implementation

```typescript
// TypeScript WebSocket Client
class WebSocketClient {
  private ws: WebSocket;
  private subscriptions: Map<string, Function> = new Map();

  connect(url: string, token: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.authenticate(token);
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  subscribe(channel: string, callback: Function) {
    const subscriptionId = `${channel}-${Date.now()}`;
    this.subscriptions.set(subscriptionId, callback);
    
    this.send({
      type: 'subscribe',
      payload: { channel },
      timestamp: new Date().toISOString()
    });
    
    return subscriptionId;
  }

  private handleMessage(message: WebSocketMessage) {
    this.subscriptions.forEach(callback => {
      callback(message);
    });
  }
}
```

---

## 📝 Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'techniker' | 'energiemanager' | 'gebäudeverwalter' | 'bürger' | 'analyst';
  createdAt: string; // ISO 8601
  lastLogin: string; // ISO 8601
  avatar?: string;
  permissions?: string[];
}
```

### Building Model
```typescript
interface Building {
  id: string;
  name: string;
  type: 'administrative' | 'educational' | 'sports' | 'recreational';
  address: string;
  totalSensors: number;
  status: 'online' | 'offline' | 'maintenance';
  coordinates: {
    lat: number;
    lng: number;
  };
  energyConfig: {
    capacity: number;
    peakConsumption: number;
    averageConsumption: number;
  };
  lastUpdate: string; // ISO 8601
}
```

### Sensor Model
```typescript
interface Sensor {
  id: string;
  buildingId: string;
  name: string;
  type: 'energy' | 'temperature' | 'humidity' | 'co2' | 'motion' | 'water_quality' | 'air_quality';
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  value: number;
  unit: string;
  lastReading: string; // ISO 8601
  calibrationDate: string; // ISO 8601
  alertThresholds: {
    low?: number;
    high?: number;
    critical?: number;
  };
  metadata?: Record<string, any>;
}
```

### Energy Data Model
```typescript
interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string; // ISO 8601
  produced: number; // kWh
  consumed: number; // kWh
  efficiency: number; // 0-1
  co2Saved: number; // kg
  source: string;
  metadata?: {
    weather?: string;
    temperature?: number;
    humidity?: number;
    [key: string]: any;
  };
}
```

### Alert Model
```typescript
interface Alert {
  id: string;
  buildingId: string;
  sensorId?: string;
  type: 'energy_spike' | 'energy_low' | 'sensor_offline' | 'system_failure' | 'maintenance_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  value?: number;
  threshold?: number;
  timestamp: string; // ISO 8601
  acknowledgments: {
    userId: string;
    timestamp: string;
    note?: string;
  }[];
  resolution?: {
    userId: string;
    timestamp: string;
    description: string;
  };
  escalationLevel: number;
  metadata?: Record<string, any>;
}
```

### Analytics Data Model
```typescript
interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  buildingId?: string;
  summary: {
    totalEnergyProduced: number;
    totalEnergyConsumed: number;
    efficiency: number;
    co2Saved: number;
    costSavings: number;
  };
  trends: {
    energyProduction: number; // percentage change
    energyConsumption: number; // percentage change
    efficiency: number; // percentage change
    co2Savings: number; // percentage change
  };
  predictions?: {
    nextPeriodConsumption: number;
    efficiency: number;
    confidence: number;
  };
  timeSeriesData: {
    timestamp: string;
    produced: number;
    consumed: number;
    efficiency: number;
  }[];
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2025-08-03T14:30:00Z"
  }
}
```

### HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|--------|
| **200** | OK | Successful GET, PUT requests |
| **201** | Created | Successful POST requests |
| **204** | No Content | Successful DELETE requests |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Invalid or missing authentication |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists |
| **422** | Unprocessable Entity | Validation errors |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |
| **503** | Service Unavailable | Maintenance mode |

### Error Codes

#### Authentication Errors
- `AUTH_INVALID_CREDENTIALS` - Invalid login credentials
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `AUTH_TOKEN_INVALID` - Invalid JWT token format
- `AUTH_INSUFFICIENT_PERMISSIONS` - User lacks required permissions

#### Validation Errors
- `VALIDATION_REQUIRED_FIELD` - Required field missing
- `VALIDATION_INVALID_FORMAT` - Field format invalid
- `VALIDATION_INVALID_VALUE` - Field value out of range

#### Resource Errors
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `RESOURCE_CONFLICT` - Resource state conflict

#### System Errors
- `SYSTEM_MAINTENANCE` - System in maintenance mode
- `SYSTEM_OVERLOAD` - System temporarily overloaded
- `SENSOR_OFFLINE` - Sensor temporarily unavailable

---

## 🔒 Rate Limiting

### Rate Limits by User Role

| Role | Requests/Minute | Burst Limit |
|------|-----------------|-------------|
| **Admin** | 1000 | 200 |
| **Techniker** | 500 | 100 |
| **Energiemanager** | 500 | 100 |
| **Gebäudeverwalter** | 300 | 60 |
| **Analyst** | 800 | 160 |
| **Bürger** | 100 | 20 |
| **Unauthenticated** | 50 | 10 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 495
X-RateLimit-Reset: 1690981234
X-RateLimit-Burst: 100
```

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 🛠️ SDK Usage

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @citypulse/sdk
```

#### Basic Usage
```typescript
import { CityPulseSDK } from '@citypulse/sdk';

const sdk = new CityPulseSDK({
  baseURL: 'https://api.citypulse-hechingen.de',
  apiKey: 'your-api-key'
});

// Login
const { user, token } = await sdk.auth.login({
  email: 'admin@hechingen.de',
  password: 'admin123'
});

// Get energy data
const energyData = await sdk.energy.getLatest('rathaus');

// Subscribe to real-time updates
sdk.ws.subscribe('energy_updates', (data) => {
  console.log('New energy data:', data);
});
```

#### Service Factory Integration
```typescript
// Using the Service Factory Pattern
import { serviceFactory } from '@/services/serviceFactory';

// Get API service (automatically chooses Mock or Real)
const apiService = serviceFactory.createAPIService();

// Get energy data
const energyData = await apiService.getEnergyData('gymnasium', 'day');

// Get WebSocket service
const wsService = serviceFactory.createWebSocketService();
wsService.connect();
wsService.subscribe('alerts', (alert) => {
  console.log('New alert:', alert);
});
```

### Mock vs Real API Switching

#### Environment Configuration
```env
# Use Mock Services (Development)
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=500
VITE_MOCK_FAILURE_RATE=0

# Use Real Services (Production)
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws
```

#### Runtime Switching (Development)
```javascript
// Available in development only
window.debugEnergy.switchToMock(); // Switch to mock mode
window.debugEnergy.switchToReal();  // Switch to real API
window.debugEnergy.isMock();        // Check current mode
```

---

## 🧪 Testing & Development

### Mock Data Available

#### Buildings (7 Total)
- **Rathaus** - 125 Sensoren
- **Gymnasium** - 142 Sensoren  
- **Realschule** - 98 Sensoren
- **Werkrealschule** - 87 Sensoren
- **Grundschule** - 76 Sensoren
- **Sporthallen** - 112 Sensoren
- **Hallenbad** - 105 Sensoren

#### Mock Features
- **Realistic Data Generation** - Based on actual building patterns
- **Configurable Delays** - Simulate network latency
- **Error Simulation** - Test error handling
- **Real-time Updates** - WebSocket event simulation
- **Alert Generation** - Random alert generation for testing

### API Testing Tools

#### cURL Examples
```bash
# Login
curl -X POST https://api.citypulse-hechingen.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hechingen.de", "password": "admin123"}'

# Get energy data (with token)
curl -X GET https://api.citypulse-hechingen.de/api/energy?buildingId=rathaus \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Postman Collection
```json
{
  "info": {
    "name": "CityPulse API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}"
      }
    ]
  }
}
```

---

## 📊 Performance & Monitoring

### API Performance Metrics
- **Average Response Time:** < 200ms
- **95th Percentile:** < 500ms
- **99th Percentile:** < 1000ms
- **Uptime SLA:** 99.9%

### Monitoring Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-03T14:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy", 
    "websocket": "healthy",
    "sensors": "degraded"
  },
  "stats": {
    "activeConnections": 245,
    "requestsPerMinute": 1205,
    "averageResponseTime": 180
  }
}
```

#### Metrics
```http
GET /api/metrics
Authorization: Bearer {admin_token}
```

---

## 🔄 Changelog & Versioning

### API Versioning
- **Current Version:** v1.0.0
- **Versioning Strategy:** Semantic Versioning (SemVer)
- **Breaking Changes:** Major version bump
- **Backward Compatibility:** Maintained for 2 versions

### Recent Updates

#### v1.0.0 (2025-08-03)
- Initial production release
- 7 buildings with 745+ sensors supported
- Complete authentication system
- Real-time WebSocket integration
- Comprehensive error handling
- Rate limiting implementation

---

## 📞 Support & Contact

### Technical Support
- **API Issues:** api-support@citypulse-hechingen.de
- **Documentation:** docs@citypulse-hechingen.de
- **Security Issues:** security@citypulse-hechingen.de

### Resources
- **API Status Page:** https://status.citypulse-hechingen.de
- **Developer Portal:** https://developers.citypulse-hechingen.de
- **GitHub Repository:** https://github.com/citypulse/api

---

**CityPulse API Documentation** - Complete reference for developers

*Built for sustainable urban energy management*