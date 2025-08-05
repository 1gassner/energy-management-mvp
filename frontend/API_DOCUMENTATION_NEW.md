# CityPulse Hechingen - API Dokumentation

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![API Status](https://img.shields.io/badge/status-production-green.svg)
![Uptime](https://img.shields.io/badge/uptime-99.9%25-green.svg)

Eine vollständige API-Referenz für das CityPulse Hechingen Energy Management System mit REST-Endpunkten und WebSocket-Integration.

## 📋 Inhaltsverzeichnis

1. [API-Übersicht](#-api-übersicht)
2. [Service Factory Pattern](#-service-factory-pattern)
3. [Authentifizierung](#-authentifizierung)
4. [Gebäude-Management](#-gebäude-management)
5. [Sensor-Verwaltung](#-sensor-verwaltung)
6. [Energie-Daten](#-energie-daten)
7. [Alert-System](#-alert-system)
8. [Analytics & Reporting](#-analytics--reporting)
9. [WebSocket Real-time Events](#-websocket-real-time-events)
10. [Datenmodelle](#-datenmodelle)
11. [Fehlerbehandlung](#-fehlerbehandlung)
12. [Rate Limiting](#-rate-limiting)

---

## 🌐 API-Übersicht

Das CityPulse API-System nutzt eine moderne Service Factory Architecture, die nahtlos zwischen Mock- und Production-Services wechselt. Dies ermöglicht eine robuste Entwicklungsumgebung und einfache Deployment-Strategien.

### Basis-URLs

| Umgebung | URL | Beschreibung |
|----------|-----|--------------|
| **Development** | `http://localhost:5173` | Mock Services für lokale Entwicklung |
| **Staging** | `https://staging-api.citypulse-hechingen.de` | Test-Umgebung mit echten APIs |
| **Production** | `https://api.citypulse-hechingen.de` | Live-System |

### API-Charakteristika

- **RESTful Design** mit standardisierten HTTP-Methoden
- **JSON-First** API mit optionalen CSV/Excel-Exporten
- **JWT-basierte Authentifizierung** mit Refresh-Token-Support
- **Role-Based Access Control (RBAC)** für 6 Benutzerrollen
- **Real-time WebSocket-Integration** für Live-Updates
- **Comprehensive Error Handling** mit strukturierten Fehlermeldungen
- **Rate Limiting** nach Benutzerrolle
- **OpenAPI 3.0** konforme Spezifikation

### Überwachte Infrastruktur

Das System verwaltet **7 kommunale Gebäude** mit insgesamt **745+ Sensoren**:

| Gebäude | Typ | Sensoren | Spezialfeatures |
|---------|-----|----------|-----------------|
| **Rathaus Hechingen** | Verwaltung | 125 | Bürgerservice-Integration |
| **Gymnasium Hechingen** | Bildung | 142 | Sportanlagen-Monitoring |
| **Realschule Hechingen** | Bildung | 98 | Labor-Energiemessung |
| **Werkrealschule Hechingen** | Bildung | 87 | Werkstatt-Sicherheitssysteme |
| **Grundschule Hechingen** | Bildung | 76 | Spielplatz-Überwachung |
| **Sporthallen Komplex** | Sport | 112 | Belüftungs-Optimierung |
| **Hallenbad Hechingen** | Freizeit | 105 | Wasserqualitäts-Monitoring |

---

## 🏗️ Service Factory Pattern

Das CityPulse System verwendet ein Service Factory Pattern für maximale Flexibilität zwischen Entwicklung und Produktion.

### Architektur-Übersicht

```typescript
interface IAPIService {
  // Authentication
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
  register(data: RegisterData): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;

  // Energy Data
  getEnergyData(buildingId?: string, period?: string): Promise<EnergyData[]>;
  getLatestEnergyData(buildingId: string): Promise<EnergyData>;

  // Buildings
  getBuildings(): Promise<Building[]>;
  getBuilding(id: string): Promise<Building>;
  updateBuilding(id: string, data: Partial<Building>): Promise<Building>;

  // Sensors
  getSensors(buildingId?: string): Promise<Sensor[]>;
  getSensor(id: string): Promise<Sensor>;
  updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor>;

  // Alerts
  getAlerts(buildingId?: string): Promise<Alert[]>;
  markAlertAsRead(id: string): Promise<Alert>;
  resolveAlert(id: string): Promise<Alert>;

  // Analytics
  getAnalytics(period: string, buildingId?: string): Promise<AnalyticsData>;
  getDashboardStats(): Promise<DashboardStats>;
}
```

### Service Factory Implementation

```typescript
import { serviceFactory } from '@/services/serviceFactory';

// Automatische Service-Auswahl basierend auf Environment
const apiService = serviceFactory.createAPIService();
const wsService = serviceFactory.createWebSocketService();

// Mock-Modus für Entwicklung
if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  // Nutzt MockAPIService mit simulierten Daten
  const mockData = await apiService.getBuildings();
} else {
  // Nutzt RealAPIService mit echten Backend-Aufrufen
  const realData = await apiService.getBuildings();
}
```

### Environment-Konfiguration

```env
# Development - Mock Services
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=500
VITE_MOCK_FAILURE_RATE=0

# Production - Real Services
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws
```

---

## 🔐 Authentifizierung

### JWT-Token Authentifizierung

Das System verwendet JSON Web Tokens (JWT) für sichere, stateless Authentifizierung.

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hechingen.de",
  "password": "admin123"
}
```

**Erfolgreiche Antwort:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "admin@hechingen.de",
      "name": "Administrator",
      "role": "admin",
      "permissions": ["read", "write", "admin"],
      "createdAt": "2024-01-15T09:00:00Z",
      "lastLogin": "2025-08-05T14:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Login erfolgreich"
}
```

#### Demo-Benutzerkonten

| Rolle | E-Mail | Passwort | Berechtigungen |
|------|-------|----------|----------------|
| **Admin** | admin@hechingen.de | admin123 | Vollzugriff, Benutzerverwaltung |
| **Techniker** | techniker@hechingen.de | tech123 | Wartung, Sensorkonfiguration |
| **Energiemanager** | energie@hechingen.de | energie123 | Analytics, Optimierung |
| **Gebäudeverwalter** | verwalter@hechingen.de | verwalter123 | Betriebsüberwachung |
| **Bürger** | buerger@hechingen.de | buerger123 | Öffentliche Daten, Dashboards |
| **Analyst** | analyst@hechingen.de | analyst123 | Datenanalyse, Reporting |

#### Token Refresh

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Benutzerregistrierung

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@hechingen.de",
  "password": "sicheresPasswort123",
  "confirmPassword": "sicheresPasswort123",
  "role": "bürger"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Authorization Header

Alle geschützten Endpunkte erfordern den Authorization-Header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏢 Gebäude-Management

### Alle Gebäude abrufen

```http
GET /api/buildings
Authorization: Bearer {token}
```

**Antwort:**
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
      "activeSensors": 123,
      "status": "online",
      "coordinates": {
        "lat": 48.3519,
        "lng": 8.9615
      },
      "energyConfig": {
        "installedCapacity": 500.0,
        "peakConsumption": 320.0,
        "averageConsumption": 180.5,
        "solarCapacity": 85.0
      },
      "currentMetrics": {
        "energyConsumption": 165.8,
        "energyProduction": 45.2,
        "efficiency": 0.82,
        "co2Savings": 12.4
      },
      "lastUpdate": "2025-08-05T14:30:00Z"
    }
  ],
  "meta": {
    "total": 7,
    "totalSensors": 745,
    "activeSensors": 738,
    "systemEfficiency": 0.84
  }
}
```

### Einzelnes Gebäude abrufen

```http
GET /api/buildings/{buildingId}
Authorization: Bearer {token}
```

**Beispiel: Grundschule Dashboard-Daten**
```json
{
  "success": true,
  "data": {
    "id": "grundschule",
    "name": "Grundschule Hechingen",
    "type": "educational",
    "description": "Moderne Grundschule mit nachhaltiger Energieversorgung",
    "address": "Schulstraße 15, 72379 Hechingen",
    "buildingDetails": {
      "yearBuilt": 1992,
      "renovationYear": 2018,
      "totalArea": 2100,
      "floors": 2,
      "classrooms": 12,
      "students": 280,
      "staff": 22
    },
    "energySystems": {
      "solarPanels": {
        "capacity": 38.0,
        "efficiency": 0.89,
        "yearInstalled": 2019
      },
      "heating": {
        "type": "heat_pump",
        "efficiency": 4.2,
        "zones": 8
      },
      "lighting": {
        "type": "LED",
        "coverage": 100,
        "motionSensors": true
      }
    },
    "sensors": [
      {
        "id": "gs-energy-main",
        "type": "energy",
        "location": "Hauptverteiler",
        "status": "online",
        "lastReading": "2025-08-05T14:30:00Z"
      }
    ],
    "scheduleData": [
      {
        "time": "07:30",
        "activity": "Schulbeginn",
        "expectedConsumption": 18.0,
        "studentCount": 265
      },
      {
        "time": "09:00", 
        "activity": "Erste große Pause",
        "expectedConsumption": 25.0,
        "studentCount": 280
      }
    ],
    "sustainabilityPrograms": [
      "Energie-Detektive",
      "Schulgarten-Projekt",
      "Recycling-Initiative"
    ]
  }
}
```

### Gebäude aktualisieren

```http
PUT /api/buildings/{buildingId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Rathaus Hechingen - Neubau",
  "energyConfig": {
    "installedCapacity": 650.0,
    "solarCapacity": 120.0
  },
  "metadata": {
    "renovationDate": "2025-08-01",
    "certifications": ["LEED Gold", "BREEAM Excellent"]
  }
}
```

### Gebäude-Status ändern

```http
PATCH /api/buildings/{buildingId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "maintenance",
  "reason": "Planmäßige Wartung der Heizungsanlage",
  "scheduledUntil": "2025-08-10T18:00:00Z"
}
```

---

## 🔍 Sensor-Verwaltung

### Sensoren abrufen

```http
GET /api/sensors?buildingId={id}&type={type}&status={status}
Authorization: Bearer {token}
```

**Query Parameter:**
- `buildingId` (optional): Filtert nach Gebäude-ID
- `type` (optional): `energy`, `temperature`, `humidity`, `co2`, `motion`, `water_quality`
- `status` (optional): `online`, `offline`, `maintenance`, `error`
- `limit` (optional): Anzahl der Ergebnisse (Standard: 50)
- `offset` (optional): Paginierung (Standard: 0)

**Antwort:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sensor-gs-001",
      "buildingId": "grundschule",
      "name": "Haupteingang Energiemesser",
      "type": "energy",
      "location": "Erdgeschoss, Haupteingang",
      "status": "online",
      "currentValue": 125.5,
      "unit": "kWh",
      "accuracy": 0.99,
      "lastReading": "2025-08-05T14:30:00Z",
      "lastCalibration": "2025-01-15T10:00:00Z",
      "nextMaintenance": "2025-12-15T10:00:00Z",
      "alertThresholds": {
        "low": 50.0,
        "high": 200.0,
        "critical": 250.0
      },
      "metadata": {
        "manufacturer": "Siemens",
        "model": "PAC3200",
        "serialNumber": "12345ABC",
        "installationDate": "2019-03-15",
        "warrantyUntil": "2027-03-15"
      }
    }
  ],
  "meta": {
    "total": 745,
    "filtered": 76,
    "online": 74,
    "offline": 1,
    "maintenance": 1
  }
}
```

### Einzelnen Sensor abrufen

```http
GET /api/sensors/{sensorId}
Authorization: Bearer {token}
```

### Sensor konfigurieren

```http
PUT /api/sensors/{sensorId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Klassenzimmer 1A Temperatursensor",
  "location": "1. Stock, Raum 101",
  "alertThresholds": {
    "low": 18.0,
    "high": 26.0,
    "critical": 30.0
  },
  "calibrationInterval": "P3M",
  "metadata": {
    "room": "101",
    "capacity": 28,
    "teacher": "Frau Schmidt"
  }
}
```

### Sensor-Kalibrierung

```http
POST /api/sensors/{sensorId}/calibrate
Authorization: Bearer {token}
Content-Type: application/json

{
  "referenceValue": 23.5,
  "calibratedBy": "techniker@hechingen.de",
  "notes": "Jährliche Kalibrierung, Sensor funktioniert einwandfrei"
}
```

### Batch-Sensor-Update

```http
PATCH /api/sensors/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "sensorIds": ["sensor-001", "sensor-002", "sensor-003"],
  "updates": {
    "status": "maintenance",
    "maintenanceReason": "Planmäßige Wartung Q3 2025"
  }
}
```

---

## ⚡ Energie-Daten

### Energie-Daten abrufen

```http
GET /api/energy?buildingId={id}&period={period}&startDate={date}&endDate={date}
Authorization: Bearer {token}
```

**Query Parameter:**
- `buildingId` (optional): Spezifisches Gebäude
- `period` (optional): `hour`, `day`, `week`, `month`, `year`
- `startDate` (optional): ISO 8601 Datum
- `endDate` (optional): ISO 8601 Datum
- `aggregation` (optional): `sum`, `avg`, `min`, `max`
- `format` (optional): `json`, `csv`

**Antwort:**
```json
{
  "success": true,
  "data": [
    {
      "id": "energy-gs-20250805-1430",
      "buildingId": "grundschule",
      "timestamp": "2025-08-05T14:30:00Z",
      "consumption": {
        "total": 76.8,
        "breakdown": {
          "heating": 25.4,
          "lighting": 15.2,
          "ventilation": 18.1,
          "equipment": 12.3,
          "other": 5.8
        }
      },
      "production": {
        "solar": 45.3,
        "other": 0.0
      },
      "gridInteraction": {
        "imported": 31.5,
        "exported": 0.0,
        "netConsumption": 31.5
      },
      "efficiency": 0.89,
      "co2Impact": {
        "avoided": 18.2,
        "equivalent": 31.5
      },
      "weather": {
        "temperature": 24.5,
        "humidity": 58,
        "sunlight": 850,
        "cloudCover": 20
      },
      "operationalContext": {
        "studentsPresent": 265,
        "staffPresent": 20,
        "classroomsActive": 11,
        "specialEvents": []
      }
    }
  ],
  "meta": {
    "period": "hour",
    "totalRecords": 24,
    "aggregatedMetrics": {
      "totalConsumption": 1843.2,
      "totalProduction": 1087.2,
      "averageEfficiency": 0.84,
      "totalCO2Saved": 436.8
    }
  }
}
```

### Aktuelle Energie-Daten

```http
GET /api/energy/latest/{buildingId}
Authorization: Bearer {token}
```

### Energie-Prognosen

```http
GET /api/energy/forecast/{buildingId}?period={period}&horizon={days}
Authorization: Bearer {token}
```

**Antwort:**
```json
{
  "success": true,
  "data": {
    "buildingId": "gymnasium",
    "forecastPeriod": "week", 
    "generatedAt": "2025-08-05T14:30:00Z",
    "confidence": 0.87,
    "predictions": [
      {
        "date": "2025-08-06",
        "predicted": {
          "consumption": 420.5,
          "production": 285.3,
          "efficiency": 0.82
        },
        "confidence": 0.91,
        "factors": {
          "weather": "sunny",
          "occupancy": "high",
          "events": ["Schulsportfest"]
        }
      }
    ],
    "modelInfo": {
      "algorithm": "LSTM Neural Network",
      "trainedUntil": "2025-08-04T23:59:59Z",
      "accuracy": 0.89
    }
  }
}
```

### Energie-Export

```http
GET /api/energy/export?buildingId={id}&format={format}&period={period}
Authorization: Bearer {token}
```

**Unterstützte Formate:**
- `csv` - Comma-separated values
- `xlsx` - Microsoft Excel
- `pdf` - PDF-Report mit Visualisierungen

---

## 🚨 Alert-System

### Alerts abrufen

```http
GET /api/alerts?buildingId={id}&severity={level}&status={status}&limit={n}
Authorization: Bearer {token}
```

**Query Parameter:**
- `buildingId` (optional): Filtert nach Gebäude
- `severity` (optional): `low`, `medium`, `high`, `critical`
- `status` (optional): `active`, `acknowledged`, `resolved`
- `limit` (optional): Anzahl Ergebnisse (Standard: 50)
- `sortBy` (optional): `timestamp`, `severity`, `building`
- `sortOrder` (optional): `asc`, `desc`

**Antwort:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-gs-20250805-001",
      "buildingId": "grundschule",
      "sensorId": "sensor-gs-heating-main",
      "type": "energy_spike",
      "severity": "high",
      "status": "active",
      "title": "Ungewöhnlich hoher Energieverbrauch",
      "description": "Heizungsverbrauch überschreitet Grenzwert um 45%",
      "detectedValue": 245.8,
      "threshold": 170.0,
      "deviation": "+75.8",
      "timestamp": "2025-08-05T14:15:00Z",
      "location": "Heizungsanlage Hauptgebäude",
      "possibleCauses": [
        "Defekte Thermostatventile",
        "Außergewöhnlich niedrige Außentemperatur",
        "Fenster dauerhaft geöffnet"
      ],
      "recommendedActions": [
        "Sofortige Überprüfung der Heizungsanlage",
        "Kontrolle aller Thermostatventile",
        "Überprüfung der Fenster und Türen"
      ],
      "acknowledgments": [],
      "escalationLevel": 1,
      "autoEscalateAt": "2025-08-05T16:15:00Z",
      "affectedSystems": ["heating", "ventilation"],
      "estimatedImpact": {
        "energyCost": 45.20,
        "co2Impact": 15.8,
        "comfortLevel": "reduced"
      }
    }
  ],
  "meta": {
    "total": 15,
    "active": 8,
    "critical": 1,
    "high": 3,
    "medium": 7,
    "low": 4
  }
}
```

### Alert bestätigen

```http
PATCH /api/alerts/{alertId}/acknowledge
Authorization: Bearer {token}
Content-Type: application/json

{
  "note": "Techniker benachrichtigt, Vor-Ort-Termin für 15:30 geplant",
  "escalationSuppressed": false,
  "assignedTo": "techniker@hechingen.de"
}
```

### Alert lösen

```http
PATCH /api/alerts/{alertId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolution": "Defektes Thermostatventil in Raum 12 ausgetauscht",
  "resolvedBy": "techniker@hechingen.de",
  "actionsTaken": [
    "Ventil ausgetauscht",
    "System neu kalibriert",
    "Testlauf über 2 Stunden durchgeführt"
  ],
  "preventiveMeasures": [
    "Monatliche Ventil-Checks geplant",
    "Wartungsintervall verkürzt"
  ],
  "costIncurred": 87.50,
  "timeSpent": 120
}
```

### Alert-Regeln konfigurieren

```http
POST /api/alert-rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Gymnasium Heizung Überwachung",
  "buildingId": "gymnasium",
  "sensorType": "energy",
  "condition": {
    "operator": "greater_than",
    "value": 200.0,
    "duration": "PT15M"
  },
  "severity": "high",
  "actions": {
    "email": ["techniker@hechingen.de", "verwalter@hechingen.de"],
    "sms": ["+491234567890"],
    "webhook": "https://monitoring.hechingen.de/webhook/energy-alert"
  },
  "schedule": {
    "active": true,
    "timezone": "Europe/Berlin",
    "workingHours": {
      "start": "07:00",
      "end": "18:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  }
}
```

---

## 📈 Analytics & Reporting

### Dashboard-Statistiken

```http
GET /api/dashboard/stats?period={period}&buildings={ids}
Authorization: Bearer {token}
```

**Antwort:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "dateRange": {
      "start": "2025-07-29T00:00:00Z",
      "end": "2025-08-05T23:59:59Z"
    },
    "overview": {
      "totalEnergyProduced": 15432.8,
      "totalEnergyConsumed": 13234.5,
      "netEnergyBalance": 2198.3,
      "totalCO2Saved": 1687.4,
      "totalBuildings": 7,
      "activeSensors": 738,
      "activeAlerts": 8,
      "systemEfficiency": 0.86
    },
    "trends": {
      "energyProduction": {
        "value": 8.5,
        "direction": "up",
        "comparison": "vs_previous_week"
      },
      "energyConsumption": {
        "value": -3.2,
        "direction": "down", 
        "comparison": "vs_previous_week"
      },
      "efficiency": {
        "value": 5.8,
        "direction": "up",
        "comparison": "vs_previous_week"
      },
      "co2Savings": {
        "value": 12.4,
        "direction": "up",
        "comparison": "vs_previous_week"
      }
    },
    "buildingPerformance": [
      {
        "buildingId": "gymnasium",
        "name": "Gymnasium Hechingen",
        "efficiency": 0.91,
        "rank": 1,
        "highlights": ["Beste Effizienz", "Höchste Solarproduktion"]
      }
    ],
    "topAlerts": [
      {
        "type": "energy_spike",
        "count": 3,
        "mostAffectedBuilding": "sporthallen"
      }
    ]
  }
}
```

### Detaillierte Analytics

```http
GET /api/analytics?period={period}&buildingId={id}&metrics={metrics}
Authorization: Bearer {token}
```

**Query Parameter:**
- `period`: `day`, `week`, `month`, `quarter`, `year`
- `buildingId` (optional): Spezifisches Gebäude
- `metrics` (optional): `energy`, `efficiency`, `costs`, `emissions`, `all`
- `comparison` (optional): `previous_period`, `same_period_last_year`

### KI-basierte Insights

```http
GET /api/analytics/insights/{buildingId}?type={analysisType}
Authorization: Bearer {token}
```

**Antwort:**
```json
{
  "success": true,
  "data": {
    "buildingId": "grundschule",
    "analysisType": "efficiency_optimization",
    "generatedAt": "2025-08-05T14:30:00Z",
    "insights": [
      {
        "category": "energy_waste",
        "priority": "high",
        "title": "Beleuchtung in ungenutzten Räumen",
        "description": "Durchschnittlich 2.5 Stunden täglich brennt Licht in leeren Klassenzimmern",
        "impact": {
          "energySavings": 45.2,
          "costSavings": 156.80,
          "co2Reduction": 18.7
        },
        "recommendation": {
          "action": "Installation von Bewegungssensoren",
          "effort": "medium",
          "cost": 890.00,
          "paybackPeriod": "P5M"
        },
        "confidence": 0.94
      }
    ],
    "predictions": {
      "nextMonthConsumption": {
        "predicted": 2847.3,
        "confidence": 0.87,
        "factors": ["Schulferien", "Wartungsarbeiten", "Wetterprognose"]
      }
    },
    "benchmarking": {
      "vsOtherBuildings": {
        "rank": 3,
        "efficiency": "above_average",
        "comparison": "+12% effizienter als Durchschnitt"
      },
      "vsIndustryStandard": {
        "rating": "good",
        "efficiency": 0.89,
        "target": 0.92
      }
    }
  }
}
```

### Custom Reports

```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Monatsbericht Energieeffizienz",
  "type": "efficiency_report",
  "period": {
    "start": "2025-07-01T00:00:00Z",
    "end": "2025-07-31T23:59:59Z"
  },
  "buildings": ["grundschule", "gymnasium", "realschule"],
  "sections": [
    "executive_summary",
    "energy_consumption",
    "production_analysis", 
    "efficiency_trends",
    "cost_analysis",
    "recommendations"
  ],
  "format": "pdf",
  "language": "de",
  "branding": {
    "logo": "stadt_hechingen",
    "colors": "official"
  },
  "distribution": {
    "email": ["buergermeister@hechingen.de", "energie@hechingen.de"],
    "schedule": "monthly"
  }
}
```

---

## 🔄 WebSocket Real-time Events

### Verbindung und Authentifizierung

**WebSocket URLs:**
- **Development:** `ws://localhost:5173/ws`
- **Staging:** `wss://staging-api.citypulse-hechingen.de/ws`
- **Production:** `wss://api.citypulse-hechingen.de/ws`

**Authentifizierung:**
```json
{
  "type": "authenticate",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-08-05T14:30:00Z"
}
```

### Subscriptions

#### Gebäude-Updates abonnieren

```json
{
  "type": "subscribe",
  "payload": {
    "channel": "building_updates",
    "buildingId": "grundschule",
    "events": ["energy_data", "sensor_status", "alerts"]
  }
}
```

#### Alert-Benachrichtigungen abonnieren

```json
{
  "type": "subscribe", 
  "payload": {
    "channel": "alerts",
    "filters": {
      "severity": ["high", "critical"],
      "buildings": ["gymnasium", "sporthallen"],
      "types": ["energy_spike", "system_failure"]
    }
  }
}
```

### Real-time Events

#### Energie-Daten Update (Grundschule)

```json
{
  "type": "energy_update",
  "payload": {
    "buildingId": "grundschule",
    "sensorId": "sensor-gs-main-energy",
    "timestamp": "2025-08-05T14:32:00Z",
    "data": {
      "consumption": 78.5,
      "production": 42.1,
      "efficiency": 0.91,
      "gridImport": 36.4
    },
    "previous": {
      "consumption": 76.2,
      "production": 38.7,
      "efficiency": 0.88
    },
    "context": {
      "studentsPresent": 265,
      "activeClassrooms": 11,
      "weather": "sunny",
      "temperature": 24.5
    },
    "alerts": []
  },
  "timestamp": "2025-08-05T14:32:00Z",
  "source": "sensor_network"
}
```

#### Kritischer Alert

```json
{
  "type": "alert",
  "payload": {
    "id": "alert-hb-20250805-002",
    "buildingId": "hallenbad",
    "severity": "critical",
    "type": "system_failure",
    "title": "Pumpsystem Ausfall",
    "description": "Hauptumwälzpumpe antwortet nicht, Wasserqualität gefährdet",
    "timestamp": "2025-08-05T14:35:00Z",
    "location": "Technikraum UG",
    "affectedSystems": ["water_circulation", "filtration", "heating"],
    "immediateActions": [
      "Badebetrieb sofort einstellen",
      "Techniker alarmieren",
      "Wasserzufuhr stoppen"
    ],
    "estimatedDowntime": "PT4H",
    "requiresImmediate": true,
    "escalationLevel": 3,
    "notificationsSent": [
      "techniker@hechingen.de",
      "+491234567890"
    ]
  },
  "timestamp": "2025-08-05T14:35:00Z",
  "source": "monitoring_system"
}
```

#### Gebäude-Status Update

```json
{
  "type": "building_status",
  "payload": {
    "buildingId": "gymnasium",
    "status": "partial_operation",
    "reason": "Geplante Wartung Lüftungsanlage",
    "systems": {
      "heating": {
        "status": "online",
        "efficiency": 0.87
      },
      "lighting": {
        "status": "online", 
        "activeLights": 45,
        "totalLights": 78
      },
      "ventilation": {
        "status": "maintenance",
        "affectedZones": ["Sporthalle A", "Umkleiden"],
        "alternativeVentilation": "Fensteröffnung"
      },
      "security": {
        "status": "online",
        "armedZones": 12
      }
    },
    "maintenanceWindow": {
      "start": "2025-08-05T16:00:00Z",
      "estimatedEnd": "2025-08-05T20:00:00Z",
      "technician": "HVAC Service GmbH"
    },
    "operationalNotes": "Sportunterricht findet im Freien statt"
  },
  "timestamp": "2025-08-05T14:40:00Z",
  "source": "facility_management"
}
```

### WebSocket Client Implementation

```typescript
class CityPulseWebSocketClient {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Function> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(url: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.authenticate(token);
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code);
        this.attemptReconnect(url, token);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }
  
  private authenticate(token: string): void {
    this.send({
      type: 'authenticate',
      payload: { token },
      timestamp: new Date().toISOString()
    });
  }
  
  subscribe(channel: string, filters: any, callback: Function): string {
    const subscriptionId = `${channel}-${Date.now()}`;
    this.subscriptions.set(subscriptionId, callback);
    
    this.send({
      type: 'subscribe',
      payload: { channel, filters },
      timestamp: new Date().toISOString()
    });
    
    return subscriptionId;
  }
  
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    
    this.send({
      type: 'unsubscribe',
      payload: { subscriptionId },
      timestamp: new Date().toISOString()
    });
  }
  
  private handleMessage(message: any): void {
    // Route message to appropriate subscribers
    this.subscriptions.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }
  
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  private attemptReconnect(url: string, token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connect(url, token);
      }, delay);
    }
  }
}
```

---

## 📝 Datenmodelle

### User Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'techniker' | 'energiemanager' | 'gebäudeverwalter' | 'bürger' | 'analyst';
  permissions: string[];
  avatar?: string;
  department?: string;
  phone?: string;
  createdAt: string; // ISO 8601
  lastLogin: string; // ISO 8601
  preferences: {
    language: 'de' | 'en';
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    dashboard: {
      defaultBuilding?: string;
      preferredCharts: string[];
    };
  };
}
```

### Building Model

```typescript
interface Building {
  id: string;
  name: string;
  type: 'administrative' | 'educational' | 'sports' | 'recreational';
  description?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  buildingDetails: {
    yearBuilt: number;
    renovationYear?: number;
    totalArea: number; // m²
    floors: number;
    rooms?: number;
    capacity?: number; // Personen
  };
  energySystems: {
    solarPanels?: {
      capacity: number; // kWp
      efficiency: number;
      yearInstalled: number;
    };
    heating: {
      type: 'gas' | 'electric' | 'heat_pump' | 'district_heating';
      efficiency: number;
      zones: number;
    };
    lighting: {
      type: 'LED' | 'fluorescent' | 'mixed';
      coverage: number; // percentage
      motionSensors: boolean;
    };
  };
  totalSensors: number;
  activeSensors: number;
  status: 'online' | 'offline' | 'maintenance' | 'partial_operation';
  lastUpdate: string; // ISO 8601
}
```

### Sensor Model

```typescript
interface Sensor {
  id: string;
  buildingId: string;
  name: string;
  type: 'energy' | 'temperature' | 'humidity' | 'co2' | 'motion' | 'water_quality' | 'air_quality' | 'pressure';
  location: string;
  room?: string;
  floor?: number;
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'calibrating';
  currentValue: number;
  unit: string;
  accuracy: number; // 0-1
  lastReading: string; // ISO 8601
  lastCalibration: string; // ISO 8601
  nextMaintenance: string; // ISO 8601
  alertThresholds: {
    low?: number;
    high?: number;
    critical?: number;
  };
  metadata: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    installationDate: string;
    warrantyUntil?: string;
    calibrationInterval: string; // ISO 8601 duration
    [key: string]: any;
  };
}
```

### Energy Data Model

```typescript
interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string; // ISO 8601
  consumption: {
    total: number; // kWh
    breakdown: {
      heating: number;
      lighting: number;
      ventilation: number;
      equipment: number;
      other: number;
    };
  };
  production: {
    solar: number; // kWh
    other: number; // andere Quellen
  };
  gridInteraction: {
    imported: number; // aus dem Netz
    exported: number; // ins Netz
    netConsumption: number; // Import - Export
  };
  efficiency: number; // 0-1
  co2Impact: {
    avoided: number; // kg CO2 vermieden
    equivalent: number; // kg CO2 Äquivalent
  };
  weather?: {
    temperature: number;
    humidity: number;
    sunlight: number; // W/m²
    cloudCover: number; // 0-100%
  };
  operationalContext?: {
    occupancy: number;
    specialEvents: string[];
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
  type: 'energy_spike' | 'energy_low' | 'sensor_offline' | 'system_failure' | 
        'maintenance_required' | 'efficiency_drop' | 'cost_threshold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  location?: string;
  detectedValue?: number;
  threshold?: number;
  deviation?: string;
  timestamp: string; // ISO 8601
  possibleCauses?: string[];
  recommendedActions?: string[];
  acknowledgments: {
    userId: string;
    timestamp: string;
    note?: string;
    assignedTo?: string;
  }[];
  resolution?: {
    userId: string;
    timestamp: string;
    description: string;
    actionsTaken: string[];
    preventiveMeasures?: string[];
    costIncurred?: number;
    timeSpent?: number; // minutes
  };
  escalationLevel: number;
  autoEscalateAt?: string; // ISO 8601
  affectedSystems: string[];
  estimatedImpact?: {
    energyCost: number;
    co2Impact: number;
    comfortLevel: 'normal' | 'reduced' | 'poor';
    operationalImpact: 'none' | 'minimal' | 'moderate' | 'severe';
  };
}
```

---

## ⚠️ Fehlerbehandlung

### Standard-Fehlerantwort

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ungültige Eingabeparameter",
    "details": {
      "field": "buildingId",
      "value": "invalid-id",  
      "reason": "Building with ID 'invalid-id' not found"
    },
    "timestamp": "2025-08-05T14:30:00Z",
    "traceId": "abc123def456",
    "documentation": "https://docs.citypulse-hechingen.de/errors#VALIDATION_ERROR"
  }
}
```

### HTTP Status Codes

| Status | Name | Verwendung | Beispiel |
|--------|------|-----------|----------|
| **200** | OK | Erfolgreiche GET, PUT | Daten erfolgreich abgerufen |
| **201** | Created | Erfolgreiche POST | Neues Alert erstellt |
| **204** | No Content | Erfolgreiche DELETE | Sensor gelöscht |
| **400** | Bad Request | Ungültige Parameter | Fehlendes buildingId |
| **401** | Unauthorized | Authentifizierung fehlgeschlagen | Ungültiger JWT Token |
| **403** | Forbidden | Unzureichende Berechtigungen | Kein Admin-Zugriff |
| **404** | Not Found | Ressource nicht gefunden | Building existiert nicht |
| **409** | Conflict | Ressourcenkonflikt | Sensor bereits vorhanden |
| **422** | Unprocessable Entity | Validierungsfehler | E-Mail-Format ungültig |
| **429** | Too Many Requests | Rate Limit überschritten | Zu viele API-Calls |
| **500** | Internal Server Error | Server-Fehler | Datenbankverbindung fehlgeschlagen |
| **503** | Service Unavailable | Wartungsmodus | System wird gewartet |

### Spezifische Fehlercodes

#### Authentifizierung
- `AUTH_INVALID_CREDENTIALS` - Ungültige Anmeldedaten
- `AUTH_TOKEN_EXPIRED` - JWT Token abgelaufen
- `AUTH_TOKEN_INVALID` - Ungültiger Token
- `AUTH_INSUFFICIENT_PERMISSIONS` - Unzureichende Rechte
- `AUTH_ACCOUNT_LOCKED` - Konto gesperrt

#### Validierung
- `VALIDATION_REQUIRED_FIELD` - Pflichtfeld fehlt
- `VALIDATION_INVALID_FORMAT` - Ungültiges Format
- `VALIDATION_INVALID_VALUE` - Wert außerhalb des erlaubten Bereichs
- `VALIDATION_DUPLICATE_VALUE` - Doppelter Wert

#### Ressourcen
- `RESOURCE_NOT_FOUND` - Ressource nicht gefunden
- `RESOURCE_ALREADY_EXISTS` - Ressource bereits vorhanden
- `RESOURCE_CONFLICT` - Ressourcenkonflikt
- `RESOURCE_LOCKED` - Ressource gesperrt

#### System
- `SYSTEM_MAINTENANCE` - Wartungsmodus
- `SYSTEM_OVERLOAD` - System überlastet
- `SENSOR_OFFLINE` - Sensor nicht erreichbar
- `DATA_PROCESSING_ERROR` - Datenverarbeitungsfehler

### Fehlerbehandlung im Client

```typescript
try {
  const buildings = await apiService.getBuildings();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'AUTH_TOKEN_EXPIRED':
        // Token refresh attemptieren
        await refreshToken();
        break;
      case 'RATE_LIMIT_EXCEEDED':
        // Retry nach Wartezeit
        setTimeout(() => retry(), error.retryAfter * 1000);
        break;
      case 'RESOURCE_NOT_FOUND':
        // Benutzer informieren
        showNotification('Gebäude nicht gefunden', 'error');
        break;
      default:
        // Allgemeine Fehlerbehandlung
        console.error('API Error:', error.message);
    }
  }
}
```

---

## 🔒 Rate Limiting

### Rate Limits nach Benutzerrolle

| Rolle | Requests/Minute | Burst Limit | WebSocket Connections |
|-------|-----------------|-------------|----------------------|
| **Admin** | 1000 | 200 | 10 |
| **Techniker** | 500 | 100 | 5 |
| **Energiemanager** | 500 | 100 | 5 |
| **Gebäudeverwalter** | 300 | 60 | 3 |
| **Analyst** | 800 | 160 | 8 |
| **Bürger** | 100 | 20 | 2 |
| **Unauthenticated** | 50 | 10 | 0 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 495
X-RateLimit-Reset: 1691155834
X-RateLimit-Burst: 100
X-RateLimit-Retry-After: 60
```

### Rate Limit Antwort

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
    "retryAfter": 60,
    "limits": {
      "current": 501,
      "limit": 500,
      "window": 60,
      "resetAt": "2025-08-05T14:31:00Z"
    }
  }
}
```

### Rate Limiting Strategien

#### Per Endpoint
```http
# Sensible Endpoints haben niedrigere Limits
POST /api/sensors/{id}/calibrate  # 10/hour
POST /api/alerts/{id}/resolve     # 50/hour
GET /api/energy/export            # 5/hour

# Häufig genutzte Endpoints haben höhere Limits  
GET /api/buildings                # Standard Limit
GET /api/energy/latest/{id}       # Standard Limit
```

#### Sliding Window
- **Zeitfenster**: 1 Minute rolling window
- **Burst Protection**: Erlaubt kurze Spitzen innerhalb des Limits
- **Fair Usage**: Gleichmäßige Verteilung über das Zeitfenster

---

## 🛠️ SDK und Integration

### TypeScript/JavaScript SDK

```typescript
import { CityPulseAPI } from '@citypulse/sdk';

const client = new CityPulseAPI({
  baseURL: 'https://api.citypulse-hechingen.de',
  timeout: 10000,
  retry: {
    attempts: 3,
    delay: 1000
  }
});

// Authentifizierung
await client.authenticate('admin@hechingen.de', 'admin123');

// Gebäude-Daten abrufen
const buildings = await client.buildings.list();
const grundschule = await client.buildings.get('grundschule');

// Energie-Daten mit Caching
const energyData = await client.energy.getLatest('gymnasium', {
  cache: true,
  cacheTTL: 30000 // 30 Sekunden
});

// Real-time Subscriptions
client.subscribe('alerts', { severity: ['high', 'critical'] }, (alert) => {
  console.log('Kritischer Alert:', alert);
});

// Batch-Operationen
const sensorUpdates = await client.sensors.batchUpdate([
  { id: 'sensor-001', alertThresholds: { high: 180 } },
  { id: 'sensor-002', status: 'maintenance' }
]);
```

### Service Factory Integration

```typescript
// Service Factory für Mock/Real API Switching
import { serviceFactory } from '@/services/serviceFactory';

// Automatische Service-Auswahl
const apiService = serviceFactory.createAPIService();
const wsService = serviceFactory.createWebSocketService();

// Mock-Daten für Development
if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  console.log('Using Mock API Service');
  const mockBuildings = await apiService.getBuildings();
} else {
  console.log('Using Real API Service');
  const realBuildings = await apiService.getBuildings();
}
```

### Environment Configuration

```env
# Development Environment
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=500
VITE_MOCK_FAILURE_RATE=0
VITE_MOCK_SENSOR_COUNT=745

# Production Environment  
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws
VITE_TIMEOUT=10000
VITE_RETRY_ATTEMPTS=3
```

---

## 📊 Performance & Monitoring

### API Performance Metriken

| Metrik | Zielwert | Aktuell | Status |
|--------|----------|---------|--------|
| **Durchschnittliche Antwortzeit** | < 200ms | 165ms | ✅ |
| **95. Perzentil** | < 500ms | 420ms | ✅ |
| **99. Perzentil** | < 1000ms | 890ms | ✅ |
| **Verfügbarkeit** | 99.9% | 99.97% | ✅ |
| **Fehlerrate** | < 0.1% | 0.03% | ✅ |

### Health Check Endpoint

```http
GET /api/health
```

**Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-05T14:30:00Z",
  "version": "1.0.0",
  "uptime": "P7DT14H23M15S",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": {
        "active": 12,
        "total": 50
      }
    },
    "redis": {
      "status": "healthy", 
      "responseTime": 2,
      "memory": "245MB"
    },
    "websocket": {
      "status": "healthy",
      "connections": 156,
      "messagesPerSecond": 45
    },
    "sensors": {
      "status": "degraded",
      "online": 738,
      "total": 745,
      "offline": 7
    }
  },
  "stats": {
    "requestsPerMinute": 1205,
    "averageResponseTime": 165,
    "cacheHitRate": 0.87,
    "queueLength": 23
  }
}
```

### Monitoring Endpoints

```http
GET /api/metrics
Authorization: Bearer {admin_token}
```

### Performance Tipps

#### Caching
```typescript
// Client-side Caching
const cachedBuildings = await client.buildings.list({
  cache: true,
  cacheTTL: 300000 // 5 Minuten
});

// Server-side Caching wird automatisch angewendet
// - Gebäude-Daten: 5 Minuten
// - Sensor-Daten: 30 Sekunden  
// - Alert-Daten: 15 Sekunden
```

#### Pagination
```typescript
// Große Datensätze paginieren
const sensors = await client.sensors.list({
  limit: 50,
  offset: 0,
  buildingId: 'gymnasium'
});
```

#### Batch-Operationen
```typescript
// Mehrere Requests in einem Aufruf
const batchResults = await client.batch([
  { method: 'GET', url: '/buildings' },
  { method: 'GET', url: '/alerts?severity=high' },
  { method: 'GET', url: '/dashboard/stats' }
]);
```

---

## 📚 Weitere Ressourcen

### Entwickler-Dokumentation
- **OpenAPI Spezifikation**: `https://api.citypulse-hechingen.de/openapi.json`
- **Postman Collection**: Verfügbar im Developer Portal
- **SDK Repository**: `https://github.com/citypulse/sdk`

### Support und Kontakt
- **Technical Support**: api-support@citypulse-hechingen.de
- **Documentation Issues**: docs@citypulse-hechingen.de  
- **Security Issues**: security@citypulse-hechingen.de

### Status und Monitoring
- **API Status**: `https://status.citypulse-hechingen.de`
- **Performance Dashboard**: Verfügbar für Admin-Benutzer
- **Incident Reports**: Automatische Benachrichtigungen

---

**CityPulse Hechingen API** - Umfassende Dokumentation für nachhaltiges Energiemanagement

*Version 1.0.0 - Erstellt für Entwickler und Systemintegratoren*