# 📡 CityPulse Hechingen - API Specification

## Overview

This document defines the complete API specification for the CityPulse Hechingen backend. The frontend is fully implemented and expects these endpoints to function with the defined contracts.

## 🔐 Authentication

All API endpoints (except `/api/auth/login`) require JWT authentication via Bearer token.

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production: https://api.citypulse-hechingen.de/api
```

## 📋 API Endpoints

### 1. Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@citypulse.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-001",
    "email": "admin@citypulse.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["VIEW_ALL_BUILDINGS", "MANAGE_SENSORS", ...]
  }
}
```

#### POST /api/auth/refresh
Refresh authentication token.

**Headers:**
```http
Authorization: Bearer <CURRENT_TOKEN>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "user": {
    "id": "user-001",
    "email": "admin@citypulse.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["VIEW_ALL_BUILDINGS", "MANAGE_SENSORS", ...]
  }
}
```

### 2. Building Endpoints

#### GET /api/buildings
Get all buildings.

**Response:**
```json
{
  "buildings": [
    {
      "id": "rathaus-hechingen",
      "name": "Rathaus",
      "type": "office",
      "address": "Marktplatz 1, 72379 Hechingen",
      "totalSensors": 125,
      "status": "online",
      "energyData": {
        "currentPower": 45.2,
        "dailyConsumption": 892.5,
        "monthlyConsumption": 24500,
        "yearlyConsumption": 285000
      }
    },
    ...
  ]
}
```

#### GET /api/buildings/:id
Get specific building details.

**Parameters:**
- `id`: Building ID (e.g., "rathaus-hechingen")

**Response:**
```json
{
  "id": "rathaus-hechingen",
  "name": "Rathaus",
  "type": "office",
  "address": "Marktplatz 1, 72379 Hechingen",
  "totalSensors": 125,
  "status": "online",
  "energyData": {
    "currentPower": 45.2,
    "dailyConsumption": 892.5,
    "monthlyConsumption": 24500,
    "yearlyConsumption": 285000
  },
  "metadata": {
    "buildingManager": "Klaus Fischer",
    "contact": "k.fischer@hechingen.de",
    "area": 3500,
    "floors": 4
  }
}
```

#### GET /api/buildings/:id/sensors
Get all sensors for a building.

**Response:**
```json
{
  "sensors": [
    {
      "id": "sensor-001",
      "buildingId": "rathaus-hechingen",
      "type": "temperature",
      "name": "Büro EG-01 Temperatur",
      "location": "Erdgeschoss, Büro 01",
      "unit": "°C",
      "currentValue": 21.5,
      "status": "online",
      "lastUpdate": "2024-08-09T10:15:00Z",
      "thresholds": {
        "min": 18,
        "max": 26,
        "warning": 24,
        "critical": 28
      }
    },
    ...
  ],
  "total": 125
}
```

### 3. Sensor Endpoints

#### GET /api/sensors
Get all sensors with optional filtering.

**Query Parameters:**
- `buildingId`: Filter by building
- `type`: Filter by sensor type
- `status`: Filter by status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "sensors": [...],
  "total": 745,
  "page": 1,
  "totalPages": 15
}
```

#### GET /api/sensors/:id
Get specific sensor details.

**Response:**
```json
{
  "id": "sensor-001",
  "buildingId": "rathaus-hechingen",
  "type": "temperature",
  "name": "Büro EG-01 Temperatur",
  "location": "Erdgeschoss, Büro 01",
  "unit": "°C",
  "currentValue": 21.5,
  "status": "online",
  "lastUpdate": "2024-08-09T10:15:00Z",
  "thresholds": {
    "min": 18,
    "max": 26,
    "warning": 24,
    "critical": 28
  },
  "metadata": {
    "manufacturer": "Bosch",
    "model": "BME280",
    "installationDate": "2023-01-15",
    "calibrationDate": "2024-01-15"
  }
}
```

#### GET /api/sensors/:id/data
Get historical sensor data.

**Query Parameters:**
- `from`: Start timestamp (ISO 8601)
- `to`: End timestamp (ISO 8601)
- `interval`: Data interval (5m, 15m, 1h, 1d)

**Response:**
```json
{
  "sensorId": "sensor-001",
  "data": [
    {
      "timestamp": "2024-08-09T10:00:00Z",
      "value": 21.2
    },
    {
      "timestamp": "2024-08-09T10:05:00Z",
      "value": 21.3
    },
    ...
  ],
  "interval": "5m",
  "from": "2024-08-09T00:00:00Z",
  "to": "2024-08-09T23:59:59Z"
}
```

### 4. Device Management Endpoints

#### GET /api/devices
Get all devices.

**Response:**
```json
{
  "devices": [
    {
      "id": "device-001",
      "name": "Hauptwärmepumpe",
      "type": "heat_pump",
      "buildingId": "rathaus-hechingen",
      "status": "online",
      "manufacturer": "Viessmann",
      "model": "Vitocal 300-G",
      "installationDate": "2023-04-01",
      "nextMaintenanceDate": "2024-12-15",
      "monthlyOperatingCost": 450,
      "energyConsumption": 1200
    },
    ...
  ]
}
```

#### POST /api/devices
Create new device.

**Request:**
```json
{
  "name": "Neue Wärmepumpe",
  "type": "heat_pump",
  "buildingId": "gymnasium-hechingen",
  "manufacturer": "Viessmann",
  "model": "Vitocal 200-S",
  "installationDate": "2024-08-01"
}
```

#### PUT /api/devices/:id
Update device information.

**Request:**
```json
{
  "status": "maintenance",
  "nextMaintenanceDate": "2024-09-01"
}
```

### 5. Maintenance Endpoints

#### GET /api/maintenance/events
Get maintenance events.

**Query Parameters:**
- `status`: Filter by status (scheduled, in_progress, completed, overdue)
- `priority`: Filter by priority (low, medium, high, critical)
- `buildingId`: Filter by building

**Response:**
```json
{
  "events": [
    {
      "id": "maint-001",
      "deviceId": "device-001",
      "deviceName": "Hauptwärmepumpe",
      "buildingId": "rathaus-hechingen",
      "type": "preventive",
      "status": "scheduled",
      "scheduledDate": "2024-08-15",
      "estimatedDuration": 120,
      "assignedTechnician": "Klaus Fischer",
      "priority": "medium",
      "description": "Quartalswartung der Hauptwärmepumpe",
      "tasks": [
        "Luftfilter reinigen",
        "Kältemittelstand prüfen",
        "Sensoren kalibrieren"
      ],
      "cost": 450
    },
    ...
  ]
}
```

### 6. Energy Optimization Endpoints

#### GET /api/optimization/recommendations
Get optimization recommendations.

**Query Parameters:**
- `buildingId`: Filter by building
- `status`: Filter by status (pending, implemented, rejected)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "opt-001",
      "buildingId": "hallenbad-hechingen",
      "title": "Wassertemperatur-Optimierung",
      "description": "Reduzierung der Beckenwassertemperatur um 1°C während Nicht-Betriebszeiten",
      "type": "energy",
      "priority": "high",
      "savingsPotential": {
        "energy": 12500,
        "cost": 3200,
        "co2": 2800
      },
      "complexity": "easy",
      "status": "pending",
      "implementationCost": 0,
      "roi": 0
    },
    ...
  ]
}
```

#### GET /api/optimization/predictions
Get energy consumption predictions.

**Query Parameters:**
- `buildingId`: Building ID
- `days`: Number of days to predict (1-30)

**Response:**
```json
{
  "predictions": [
    {
      "date": "2024-08-10",
      "buildingId": "rathaus-hechingen",
      "predictedConsumption": 892.5,
      "confidence": 0.87,
      "factors": {
        "weather": 0.3,
        "occupancy": 0.5,
        "historical": 0.2
      }
    },
    ...
  ]
}
```

### 7. Budget & Finance Endpoints

#### GET /api/budget/overview
Get budget overview.

**Query Parameters:**
- `year`: Year (default: current year)
- `month`: Month (optional)

**Response:**
```json
{
  "year": 2024,
  "totalBudget": 1244000,
  "totalSpent": 580000,
  "categories": [
    {
      "category": "energy",
      "budget": 800000,
      "spent": 380000,
      "percentage": 47.5
    },
    ...
  ],
  "buildings": [
    {
      "buildingId": "rathaus-hechingen",
      "budget": 180000,
      "spent": 85000
    },
    ...
  ]
}
```

### 8. Analytics Endpoints

#### GET /api/analytics/kpis
Get key performance indicators.

**Response:**
```json
{
  "kpis": {
    "totalEnergyConsumption": 2450000,
    "totalCost": 580000,
    "co2Emissions": 1250,
    "savingsPotential": 125000,
    "energyEfficiency": 78.5,
    "activeAlerts": 5,
    "devicesOnline": 42,
    "dataQuality": 94.2
  },
  "trends": {
    "energyConsumption": -2.3,
    "costs": -1.8,
    "efficiency": 3.2
  }
}
```

### 9. Report Generation Endpoints

#### GET /api/reports/templates
Get available report templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "energy-monthly",
      "name": "Monatlicher Energiebericht",
      "description": "Standardvorlage für monatliche Energieberichte",
      "type": "energy",
      "sections": ["Verbrauchsübersicht", "Produktionsdaten", "Effizienzanalyse"],
      "formats": ["pdf", "xlsx"]
    },
    ...
  ]
}
```

#### POST /api/reports/generate
Generate a report.

**Request:**
```json
{
  "templateId": "energy-monthly",
  "parameters": {
    "buildingIds": ["rathaus-hechingen", "gymnasium-hechingen"],
    "dateRange": {
      "from": "2024-07-01",
      "to": "2024-07-31"
    },
    "format": "pdf"
  }
}
```

**Response:**
```json
{
  "reportId": "report-20240809-001",
  "status": "generating",
  "estimatedTime": 30,
  "url": null
}
```

### 10. Alert Endpoints

#### GET /api/alerts
Get all alerts.

**Query Parameters:**
- `status`: Filter by status (active, acknowledged, resolved)
- `severity`: Filter by severity (low, medium, high, critical)
- `buildingId`: Filter by building

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "buildingId": "hallenbad-hechingen",
      "sensorId": "sensor-pool-ph-01",
      "type": "threshold",
      "severity": "high",
      "title": "pH-Wert außerhalb des Normalbereichs",
      "message": "Der pH-Wert im Hauptbecken liegt bei 8.2 (Normal: 7.0-7.6)",
      "status": "active",
      "createdAt": "2024-08-09T08:30:00Z"
    },
    ...
  ]
}
```

## 📡 WebSocket Events

### Connection

```javascript
// Connect to WebSocket
const socket = new WebSocket('wss://api.citypulse-hechingen.de/ws');

// Authentication after connection
socket.send(JSON.stringify({
  type: 'auth',
  token: 'Bearer <JWT_TOKEN>'
}));
```

### Server → Client Events

#### sensor:update
Real-time sensor data updates.
```json
{
  "type": "sensor:update",
  "data": {
    "sensorId": "sensor-001",
    "value": 21.5,
    "timestamp": "2024-08-09T10:15:00Z",
    "unit": "°C"
  }
}
```

#### alert:new
New alert notification.
```json
{
  "type": "alert:new",
  "data": {
    "id": "alert-002",
    "severity": "high",
    "buildingId": "rathaus-hechingen",
    "message": "Hoher Energieverbrauch erkannt",
    "timestamp": "2024-08-09T10:16:00Z"
  }
}
```

#### device:status
Device status change.
```json
{
  "type": "device:status",
  "data": {
    "deviceId": "device-001",
    "status": "offline",
    "timestamp": "2024-08-09T10:17:00Z"
  }
}
```

#### optimization:insight
New optimization insight.
```json
{
  "type": "optimization:insight",
  "data": {
    "buildingId": "gymnasium-hechingen",
    "type": "pattern",
    "recommendation": "Heizung kann 2 Stunden später gestartet werden",
    "savingsPotential": 125
  }
}
```

### Client → Server Events

#### subscribe
Subscribe to building updates.
```json
{
  "type": "subscribe",
  "buildings": ["rathaus-hechingen", "gymnasium-hechingen"]
}
```

#### unsubscribe
Unsubscribe from building updates.
```json
{
  "type": "unsubscribe",
  "buildings": ["rathaus-hechingen"]
}
```

## 🔒 Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  },
  "timestamp": "2024-08-09T10:18:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` (401) - Invalid or missing authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid request parameters
- `INTERNAL_ERROR` (500) - Server error
- `RATE_LIMITED` (429) - Too many requests

## 📊 Rate Limiting

- Standard endpoints: 100 requests/minute
- Analytics endpoints: 1000 requests/minute
- WebSocket messages: 50 messages/second

## 🌐 CORS Configuration

```javascript
Access-Control-Allow-Origin: https://citypulse-hechingen.vercel.app, http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

**Note**: This specification defines the complete API contract expected by the frontend. The backend implementation must adhere to these endpoints, request/response formats, and WebSocket events.