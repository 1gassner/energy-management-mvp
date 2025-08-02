# API Documentation - Energy Management MVP

Umfassende Dokumentation aller API Endpoints, WebSocket Events und Datenstrukturen der Energy Management MVP Plattform.

## 🌐 Base Configuration

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api  # Production: https://api.yourdomain.com
VITE_WS_URL=ws://localhost:8000/ws      # Production: wss://api.yourdomain.com/ws

# Mode Configuration
VITE_USE_MOCK_DATA=true                 # false für Production
VITE_APP_ENV=development                # production, test
```

### API Base URLs
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.yourdomain.com`
- **Mock Mode**: Lokale Simulation ohne Backend

## 🔐 Authentication

### Overview
Das System verwendet **JWT Token-basierte Authentication** mit folgenden Features:
- Bearer Token in Authorization Header
- Token Refresh Mechanismus
- Role-based Access Control (RBAC)
- Secure Token Storage im localStorage

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/login
Benutzer-Anmeldung mit E-Mail und Passwort.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "admin@example.com",
      "name": "Max Mustermann",
      "role": "admin",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-08-02T14:22:33Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login erfolgreich"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Ungültige Anmeldedaten",
  "data": null
}
```

#### POST /auth/register
Neue Benutzer-Registrierung.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword",
  "name": "Neuer Benutzer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-456",
      "email": "newuser@example.com",
      "name": "Neuer Benutzer",
      "role": "user",
      "createdAt": "2024-08-02T14:30:00Z",
      "lastLogin": "2024-08-02T14:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /auth/me
Aktuelle Benutzerinformationen abrufen (Token erforderlich).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "admin@example.com",
    "name": "Max Mustermann",
    "role": "admin",
    "lastLogin": "2024-08-02T14:22:33Z"
  }
}
```

#### POST /auth/logout
Benutzer abmelden und Token invalidieren.

**Response:**
```json
{
  "success": true,
  "message": "Erfolgreich abgemeldet"
}
```

### User Roles
- **admin**: Vollzugriff auf alle Funktionen
- **manager**: Gebäude-Management und Analytics
- **user**: Grundlegende Dashboard-Funktionen
- **public**: Nur öffentliche Daten

## ⚡ Energy Data Endpoints

### GET /energy
Energiedaten abrufen mit optionalen Filtern.

**Query Parameters:**
- `buildingId` (optional): Filter nach Gebäude-ID
- `period` (optional): Zeitraum (day, week, month, year)
- `startDate` (optional): Startdatum (ISO 8601)
- `endDate` (optional): Enddatum (ISO 8601)

**Request:**
```http
GET /energy?buildingId=rathaus-001&period=week
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "energy-123",
      "buildingId": "rathaus-001",
      "timestamp": "2024-08-02T12:00:00Z",
      "consumption": 145.7,
      "production": 89.3,
      "efficiency": 87.5,
      "co2Saved": 23.4
    },
    {
      "id": "energy-124",
      "buildingId": "rathaus-001",
      "timestamp": "2024-08-02T13:00:00Z",
      "consumption": 152.1,
      "production": 92.8,
      "efficiency": 89.2,
      "co2Saved": 25.1
    }
  ]
}
```

### GET /energy/latest/{buildingId}
Neueste Energiedaten für ein spezifisches Gebäude.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "energy-current",
    "buildingId": "rathaus-001",
    "timestamp": "2024-08-02T14:30:00Z",
    "consumption": 148.3,
    "production": 91.7,
    "efficiency": 88.1,
    "co2Saved": 24.8
  }
}
```

## 🏢 Building Management Endpoints

### GET /buildings
Alle Gebäude abrufen.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rathaus-001",
      "name": "Rathaus",
      "type": "rathaus",
      "address": "Marktplatz 1, 12345 Stadt",
      "capacity": 200,
      "status": "online",
      "sensors": [
        {
          "id": "sensor-temp-001",
          "buildingId": "rathaus-001",
          "type": "temperature",
          "name": "Außentemperatur",
          "value": 22.5,
          "unit": "°C",
          "status": "active",
          "lastReading": "2024-08-02T14:30:00Z"
        }
      ],
      "lastUpdate": "2024-08-02T14:30:00Z"
    }
  ]
}
```

### GET /buildings/{id}
Spezifisches Gebäude abrufen.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rathaus-001",
    "name": "Rathaus",
    "type": "rathaus",
    "address": "Marktplatz 1, 12345 Stadt",
    "capacity": 200,
    "status": "online",
    "sensors": [...],
    "lastUpdate": "2024-08-02T14:30:00Z"
  }
}
```

### PUT /buildings/{id}
Gebäude-Informationen aktualisieren (Admin/Manager erforderlich).

**Request:**
```json
{
  "name": "Rathaus (Renoviert)",
  "capacity": 220,
  "status": "maintenance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rathaus-001",
    "name": "Rathaus (Renoviert)",
    "capacity": 220,
    "status": "maintenance",
    "lastUpdate": "2024-08-02T14:35:00Z"
  }
}
```

## 🔍 Sensor Endpoints

### GET /sensors
Alle Sensoren abrufen.

**Query Parameters:**
- `buildingId` (optional): Filter nach Gebäude-ID
- `type` (optional): Filter nach Sensor-Typ

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sensor-temp-001",
      "buildingId": "rathaus-001",
      "type": "temperature",
      "name": "Außentemperatur",
      "value": 22.5,
      "unit": "°C",
      "status": "active",
      "lastReading": "2024-08-02T14:30:00Z"
    },
    {
      "id": "sensor-energy-001",
      "buildingId": "rathaus-001",
      "type": "energy",
      "name": "Stromverbrauch",
      "value": 148.3,
      "unit": "kWh",
      "status": "active",
      "lastReading": "2024-08-02T14:30:00Z"
    }
  ]
}
```

### GET /sensors/{id}
Spezifischen Sensor abrufen.

### PUT /sensors/{id}
Sensor-Konfiguration aktualisieren.

## 🚨 Alert Management Endpoints

### GET /alerts
Alle Alerts abrufen.

**Query Parameters:**
- `buildingId` (optional): Filter nach Gebäude-ID
- `type` (optional): Filter nach Alert-Typ
- `unread` (optional): Nur ungelesene Alerts (true/false)
- `unresolved` (optional): Nur ungelöste Alerts (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-001",
      "buildingId": "rathaus-001",
      "type": "warning",
      "title": "Hoher Energieverbrauch",
      "message": "Der Energieverbrauch liegt 15% über dem Durchschnitt",
      "timestamp": "2024-08-02T14:00:00Z",
      "isRead": false,
      "isResolved": false,
      "priority": "medium",
      "source": "energy_monitor"
    }
  ]
}
```

### PATCH /alerts/{id}/read
Alert als gelesen markieren.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "isRead": true,
    "message": "Alert als gelesen markiert"
  }
}
```

### PATCH /alerts/{id}/resolve
Alert als gelöst markieren.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "isRead": true,
    "isResolved": true,
    "message": "Alert erfolgreich gelöst"
  }
}
```

## 📊 Analytics Endpoints

### GET /analytics
Analytische Daten abrufen.

**Query Parameters:**
- `period` (required): Zeitraum (day, week, month, year)
- `buildingId` (optional): Filter nach Gebäude-ID

**Request:**
```http
GET /analytics?period=month&buildingId=rathaus-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "totalConsumption": 4250.7,
    "totalProduction": 2890.3,
    "totalSaved": 1360.4,
    "efficiency": 68.0,
    "co2Reduction": 542.1,
    "predictions": [
      {
        "date": "2024-08-03",
        "predictedConsumption": 145.0,
        "predictedProduction": 98.5,
        "confidence": 87.3
      }
    ],
    "trends": [
      {
        "label": "Energieeffizienz",
        "value": 68.0,
        "change": 5.2,
        "trend": "up"
      }
    ]
  }
}
```

### GET /dashboard/stats
Dashboard-Statistiken für die Übersicht.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEnergyProduced": 2890.3,
    "totalEnergyConsumed": 4250.7,
    "totalCO2Saved": 542.1,
    "totalBuildings": 3,
    "activeAlerts": 2,
    "systemEfficiency": 68.0,
    "trends": {
      "energyProduction": 5.2,
      "energyConsumption": -2.1,
      "efficiency": 3.8,
      "co2Savings": 4.5
    }
  }
}
```

## 🔌 WebSocket API

### Connection
WebSocket-Verbindung für Echtzeit-Updates.

**URL:** `ws://localhost:8000/ws` (Development)  
**URL:** `wss://api.yourdomain.com/ws` (Production)

### Authentication
```json
{
  "type": "authenticate",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-08-02T14:30:00Z"
}
```

### Subscription
```json
{
  "type": "subscribe",
  "payload": {
    "events": ["energy_update", "alert", "building_status"],
    "buildingId": "rathaus-001"
  },
  "timestamp": "2024-08-02T14:30:00Z"
}
```

### WebSocket Events

#### energy_update
```json
{
  "type": "energy_update",
  "payload": {
    "totalEnergy": 148.3,
    "co2Saved": 24.8,
    "buildingId": "rathaus-001"
  },
  "timestamp": "2024-08-02T14:30:00Z",
  "source": "energy_monitor"
}
```

#### alert
```json
{
  "type": "alert",
  "payload": {
    "alertCount": 3,
    "message": "Neue kritische Warnung",
    "severity": "critical",
    "buildingId": "rathaus-001"
  },
  "timestamp": "2024-08-02T14:30:00Z",
  "source": "alert_system"
}
```

#### building_status
```json
{
  "type": "building_status",
  "payload": {
    "status": "online",
    "buildingId": "rathaus-001"
  },
  "timestamp": "2024-08-02T14:30:00Z",
  "source": "building_monitor"
}
```

#### sensor_data
```json
{
  "type": "sensor_data",
  "payload": {
    "sensorId": "sensor-temp-001",
    "value": 22.5,
    "unit": "°C",
    "timestamp": "2024-08-02T14:30:00Z"
  },
  "timestamp": "2024-08-02T14:30:00Z",
  "source": "sensor_network"
}
```

#### system_status
```json
{
  "type": "system_status",
  "payload": {
    "status": "online",
    "buildingId": "all"
  },
  "timestamp": "2024-08-02T14:30:00Z",
  "source": "system_monitor"
}
```

## 📊 Data Types & Schemas

### User Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'public';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}
```

### Building Schema
```typescript
interface Building {
  id: string;
  name: string;
  type: 'rathaus' | 'grundschule' | 'realschule' | 'other';
  address: string;
  capacity: number; // max kWh
  status: 'online' | 'offline' | 'maintenance';
  sensors: Sensor[];
  lastUpdate: string;
}
```

### EnergyData Schema
```typescript
interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string;
  consumption: number; // kWh
  production: number; // kWh
  efficiency: number; // percentage
  co2Saved: number; // kg
}
```

### Sensor Schema
```typescript
interface Sensor {
  id: string;
  buildingId: string;
  type: 'temperature' | 'humidity' | 'energy' | 'solar' | 'battery';
  name: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'error';
  lastReading: string;
}
```

### Alert Schema
```typescript
interface Alert {
  id: string;
  buildingId: string;
  type: 'warning' | 'error' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}
```

## 🧪 Mock API System

Das integrierte Mock-System bietet eine vollständige API-Simulation für Development und Testing.

### Aktivierung
```env
VITE_USE_MOCK_DATA=true
```

### Mock Configuration
```typescript
interface MockConfig {
  useMockData: boolean;
  mockDelay: number;        // Netzwerk-Delay in ms
  failureRate: number;      // Fehlerrate 0-1
  webSocketEnabled: boolean;
}
```

### Mock Data Features
- **Realistische Daten**: Zufällige aber konsistente Testdaten
- **Network Simulation**: Konfigurierbare Delays und Failure Rates
- **WebSocket Events**: Simulierte Echtzeit-Updates
- **Authentication**: Mock-Benutzer mit verschiedenen Rollen
- **Error Scenarios**: Testbare Error-Cases

### Mock Users
```json
{
  "admin": {
    "email": "admin@energy.de",
    "password": "admin123",
    "role": "admin"
  },
  "manager": {
    "email": "manager@energy.de",
    "password": "manager123",
    "role": "manager"
  },
  "user": {
    "email": "user@energy.de",
    "password": "user123",
    "role": "user"
  }
}
```

## 🔒 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Fehlermeldung",
  "data": null,
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- **200**: Erfolgreiche Anfrage
- **201**: Ressource erstellt
- **400**: Ungültige Anfrage
- **401**: Nicht autorisiert
- **403**: Zugriff verweigert
- **404**: Ressource nicht gefunden
- **422**: Validierungsfehler
- **500**: Server-Fehler

### Common Error Codes
- `INVALID_CREDENTIALS`: Ungültige Login-Daten
- `TOKEN_EXPIRED`: JWT Token abgelaufen
- `INSUFFICIENT_PERMISSIONS`: Fehlende Berechtigung
- `VALIDATION_ERROR`: Eingabevalidierung fehlgeschlagen
- `RESOURCE_NOT_FOUND`: Ressource nicht vorhanden
- `RATE_LIMIT_EXCEEDED`: Rate Limit überschritten

## 🚀 Rate Limiting

### Limits
- **Authentication**: 5 Versuche pro Minute
- **API Calls**: 100 Anfragen pro Minute
- **WebSocket**: 1000 Nachrichten pro Minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1659444000
```

## 📝 Usage Examples

### JavaScript/TypeScript Client
```typescript
class EnergyAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
    }
    return data;
  }

  async getBuildings() {
    const response = await fetch(`${this.baseURL}/buildings`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  // WebSocket Connection
  connectWebSocket() {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({
        type: 'authenticate',
        payload: { token: this.token },
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
    };

    return ws;
  }
}

// Usage
const client = new EnergyAPIClient('http://localhost:8000/api');
await client.login('admin@energy.de', 'admin123');
const buildings = await client.getBuildings();
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@energy.de","password":"admin123"}'

# Get Buildings (with token)
curl -X GET http://localhost:8000/api/buildings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get Energy Data
curl -X GET "http://localhost:8000/api/energy?buildingId=rathaus-001&period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Related Documentation

- **[README.md](README.md)**: Projekt-Übersicht und Setup
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System-Architektur
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)**: Entwickler-Handbuch
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**: Production Deployment

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Status**: Production Ready ✅