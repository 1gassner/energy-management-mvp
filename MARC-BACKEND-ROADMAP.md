# CityPulse Backend Implementation Roadmap

**Für: Marc (Backend Developer)**  
**Projekt: CityPulse Energy Management System**  
**Geschätzte Dauer: 3-4 Wochen**  
**Stack: Supabase + PostgreSQL + REST API + WebSockets**

---

## 📋 Übersicht

Dieses Dokument beschreibt die komplette Backend-Implementation für CityPulse. Das Frontend ist bereits funktionsfähig mit Mock-Daten und wartet auf die echte API-Integration.

### 🎯 Ziele
- Vollständige REST API Implementation
- Real-time WebSocket Integration
- Supabase Database Setup
- Authentifizierung & Authorization
- Performance-optimierte Queries
- Monitoring & Logging

---

## 🏗️ Architektur-Übersicht

```
Frontend (React/TypeScript) 
    ↕ HTTP/WebSocket
Backend API (Node.js/Python/Go)
    ↕ SQL
Supabase PostgreSQL Database
    ↕ Real-time
WebSocket Server
```

### 📁 Empfohlene Backend-Struktur
```
citypulse-backend/
├── src/
│   ├── controllers/         # API Controllers
│   ├── services/           # Business Logic
│   ├── models/             # Database Models
│   ├── middleware/         # Auth, CORS, etc.
│   ├── routes/             # API Routes
│   ├── websocket/          # WebSocket Handlers
│   ├── utils/              # Helper Functions
│   └── types/              # TypeScript Types
├── database/
│   ├── migrations/         # Database Migrations
│   ├── seeds/              # Seed Data
│   └── schema.sql          # Complete Schema
├── tests/                  # Unit & Integration Tests
├── docs/                   # API Documentation
└── config/                 # Environment Configs
```

---

## 📅 Woche 1: Foundation & Database

### Tag 1-2: Supabase Setup & Database
- [ ] **Supabase Projekt erstellen**
  - Account setup auf supabase.com
  - Neues Projekt für CityPulse
  - Datenbank-URL und API Keys notieren

- [ ] **Database Schema implementieren**
  - `supabase-schema.sql` ausführen (bereits erstellt)
  - Tabellen: users, buildings, sensors, energy_data, alerts
  - RLS (Row Level Security) aktivieren
  - Indizes für Performance erstellen

- [ ] **Seed Data einpflegen**
  - Hechingen Gebäude (7 Stück) importieren
  - Test-User erstellen
  - Beispiel Sensoren & Alerts

**SQL Befehle:**
```sql
-- Schema ausführen
\i supabase-schema.sql

-- Test Queries
SELECT * FROM buildings;
SELECT COUNT(*) FROM sensors;
```

### Tag 3-4: Authentication System
- [ ] **Supabase Auth Setup**
  - JWT Configuration
  - Email/Password Provider
  - User Policies

- [ ] **API Authentication Middleware**
  - JWT Token Validation
  - Role-based Access Control
  - Refresh Token Logic

**Beispiel Code (Node.js):**
```typescript
// middleware/auth.ts
export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { user, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
};
```

### Tag 5: Project Structure & Basic API
- [ ] **Backend Projekt aufsetzen**
  - Node.js/Express oder Python/FastAPI
  - TypeScript Configuration
  - Environment Variables
  - CORS Setup

- [ ] **Grundlegende API Routes**
  - Health Check (`GET /health`)
  - Authentication Routes (`POST /auth/login`, `/auth/logout`)
  - Basic Error Handling

---

## 📅 Woche 2: Core API Development

### Tag 6-7: Buildings & Sensors API
- [ ] **Buildings Controller**
  ```typescript
  GET    /api/v1/buildings           # Liste aller Gebäude
  GET    /api/v1/buildings/:id      # Einzelnes Gebäude
  PATCH  /api/v1/buildings/:id      # Gebäude updaten
  POST   /api/v1/buildings          # Neues Gebäude (Admin)
  ```

- [ ] **Sensors Controller**
  ```typescript
  GET    /api/v1/sensors                    # Alle Sensoren (mit Filtern)
  GET    /api/v1/sensors/:id               # Einzelner Sensor
  GET    /api/v1/buildings/:id/sensors     # Sensoren eines Gebäudes
  POST   /api/v1/sensors                   # Neuer Sensor
  PATCH  /api/v1/sensors/:id              # Sensor updaten
  DELETE /api/v1/sensors/:id              # Sensor löschen
  ```

**Beispiel Implementation:**
```typescript
// controllers/buildingsController.ts
export const getBuildings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select(`
        *,
        sensors(*)
      `);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Tag 8-9: Energy Data & Analytics
- [ ] **Energy Data API**
  ```typescript
  GET /api/v1/energy/consumption     # Verbrauchsdaten
  GET /api/v1/energy/production      # Produktionsdaten
  POST /api/v1/energy/readings       # Neue Messwerte
  ```

- [ ] **Analytics API**
  ```typescript
  GET /api/v1/analytics/dashboard    # Dashboard Statistiken
  GET /api/v1/analytics/predictions  # Vorhersagen
  GET /api/v1/analytics/trends       # Trends & Vergleiche
  ```

- [ ] **Performance Optimierung**
  - Database Indizes prüfen
  - Query Optimierung
  - Caching Strategy (Redis optional)

### Tag 10: Alerts & Admin API
- [ ] **Alerts System**
  ```typescript
  GET    /api/v1/alerts              # Alle Alerts (gefiltert)
  PATCH  /api/v1/alerts/:id          # Alert als gelesen/gelöst markieren
  POST   /api/v1/alerts              # Neuer Alert
  ```

- [ ] **Admin Endpoints**
  ```typescript
  GET    /api/v1/admin/users         # User Management
  POST   /api/v1/admin/users         # User erstellen
  GET    /api/v1/admin/sensors       # Alle Sensoren verwalten
  ```

---

## 📅 Woche 3: Real-time & WebSockets

### Tag 11-12: WebSocket Server
- [ ] **WebSocket Setup**
  - Socket.io oder native WebSockets
  - Connection Management
  - Room/Channel System

- [ ] **Real-time Channels**
  ```typescript
  /ws/realtime?channel=sensors&building_id=rathaus-hechingen
  /ws/realtime?channel=alerts
  /ws/realtime?channel=energy_data&building_id=hallenbad-hechingen
  ```

**WebSocket Events:**
```typescript
// WebSocket Handler
io.on('connection', (socket) => {
  socket.on('join_building', (buildingId) => {
    socket.join(`building:${buildingId}`);
  });
  
  socket.on('subscribe_sensors', (buildingId) => {
    socket.join(`sensors:${buildingId}`);
  });
});

// Broadcast sensor updates
const broadcastSensorUpdate = (buildingId, sensorData) => {
  io.to(`sensors:${buildingId}`).emit('sensor_update', sensorData);
};
```

### Tag 13-14: Supabase Real-time Integration
- [ ] **Supabase Subscriptions**
  - Database Triggers
  - Real-time Listeners
  - Frontend Integration

- [ ] **Real-time Data Pipeline**
  ```sql
  -- Trigger für Sensor Updates
  CREATE OR REPLACE FUNCTION notify_sensor_update()
  RETURNS trigger AS $$
  BEGIN
    PERFORM pg_notify('sensor_update', row_to_json(NEW)::text);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

### Tag 15: Testing & Error Handling
- [ ] **API Testing**
  - Unit Tests für Controller
  - Integration Tests
  - Load Testing (optional)

- [ ] **Error Handling & Logging**
  - Structured Logging
  - Error Monitoring (Sentry optional)
  - Health Checks

---

## 📅 Woche 4: Integration & Production

### Tag 16-17: Frontend Integration
- [ ] **API Dokumentation finalisieren**
  - OpenAPI/Swagger Docs
  - Postman Collection
  - Environment Variables dokumentieren

- [ ] **Frontend API Service Update**
  - `realApiService.ts` implementieren
  - Error Handling anpassen
  - WebSocket Client testen

**Frontend Integration:**
```typescript
// Frontend: ApiServiceFactory nutzen
ApiServiceFactory.initialize({
  mode: 'real',
  baseUrl: 'https://api.citypulse.com/v1',
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
});
```

### Tag 18-19: Performance & Security
- [ ] **Performance Optimierung**
  - Database Query Optimierung
  - Response Caching
  - CDN Setup (optional)

- [ ] **Security Hardening**
  - Rate Limiting
  - Input Validation
  - SQL Injection Prevention
  - CORS Configuration

### Tag 20: Deployment & Monitoring
- [ ] **Production Deployment**
  - Vercel/Netlify für API (oder eigener Server)
  - Environment Variables Setup
  - SSL/HTTPS Configuration

- [ ] **Monitoring Setup**
  - Health Check Endpoints
  - Performance Monitoring
  - Log Aggregation

---

## 🔧 Technische Spezifikationen

### Environment Variables
```bash
# .env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
JWT_SECRET="your-jwt-secret"
NODE_ENV="production"
PORT="8000"
REDIS_URL="redis://localhost:6379" # optional
```

### Performance Targets
- **Response Time**: < 200ms für 95% der Requests
- **Database Queries**: < 50ms durchschnittlich
- **WebSocket Latency**: < 100ms
- **Concurrent Users**: 1000+ gleichzeitig
- **Uptime**: 99.9%

### Security Requirements
- **HTTPS**: Alle API Endpoints
- **CORS**: Nur Frontend Domain erlauben
- **Rate Limiting**: 100 requests/minute pro IP
- **SQL Injection**: Prepared Statements verwenden
- **XSS Protection**: Input Sanitization

---

## 📚 API Dokumentation

### Vollständige OpenAPI Spezifikation
Die komplette API-Spezifikation ist in `backend-api-spec.yaml` verfügbar und umfasst:

- 40+ API Endpoints
- Authentication & Authorization
- Request/Response Schemas
- Error Handling
- WebSocket Dokumentation

### Beispiel API Calls
```typescript
// Login
POST /api/v1/auth/login
{
  "email": "admin@citypulse.com",
  "password": "admin123"
}

// Gebäude abrufen
GET /api/v1/buildings
Authorization: Bearer <token>

// Sensor Daten
GET /api/v1/buildings/rathaus-hechingen/sensors
Authorization: Bearer <token>

// Energy Analytics
GET /api/v1/analytics/dashboard?period=week
Authorization: Bearer <token>
```

---

## 🚀 Quick Start für Marc

1. **Repository clonen & Setup**
```bash
git clone <backend-repo>
cd citypulse-backend
npm install
cp .env.example .env
# .env mit Supabase Credentials füllen
```

2. **Database Setup**
```bash
# Supabase Projekt erstellen
# SQL Schema ausführen: supabase-schema.sql
```

3. **Development starten**
```bash
npm run dev
# API läuft auf http://localhost:8000
```

4. **Frontend testen**
```bash
# Frontend ApiServiceFactory auf 'real' umstellen
ApiServiceFactory.switchMode('real');
```

---

## 🆘 Support & Kontakt

- **Frontend Integration**: Jürgen unterstützt bei Frontend-Anpassungen
- **API Spezifikation**: Alle Endpoints in `backend-api-spec.yaml` dokumentiert
- **Database Schema**: Vollständige Struktur in `supabase-schema.sql`
- **Mock Data**: Frontend läuft bereits mit identischen Datenstrukturen

**Happy Coding! 🚀**