# Energy Management MVP Platform

Eine moderne, React-basierte Plattform für das Management und Monitoring von Energiesystemen mit Echtzeit-Datenvisualisierung und intelligenten Analysen.

## 🚀 Features

### Core Funktionalitäten
- **Dashboard**: Zentrales Monitoring mit Echtzeit-Updates
- **Energiefluss-Visualisierung**: Interaktive Charts und Diagramme
- **Gebäude-Management**: Überwachung von Rathaus, Grundschule und Realschule
- **Alert-System**: Automatische Benachrichtigungen bei Anomalien
- **AI-Analytics**: Intelligente Datenanalyse und Vorhersagen
- **Multi-User Support**: Rollenbasierte Zugriffskontrolle

### Technische Highlights
- **Dual-Mode Architektur**: Mock-System für Development, Real-API für Production
- **WebSocket Integration**: Echtzeit-Datenübertragung
- **Performance Optimiert**: Lazy Loading, Code Splitting, Bundle Optimization
- **Responsive Design**: Mobile-First Ansatz mit Tailwind CSS
- **Umfassende Tests**: Unit Tests, Integration Tests, 85%+ Coverage

## 🛠️ Tech Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** für Build-System und Development Server
- **Tailwind CSS** für Styling
- **Zustand** für State Management
- **React Router** für Navigation
- **Recharts** für Datenvisualisierung
- **React Hot Toast** für Notifications

### Development Tools
- **ESLint** + **TypeScript ESLint** für Code Quality
- **Vitest** für Testing
- **Testing Library** für Component Tests
- **Coverage Reports** mit v8

### Performance & Optimization
- **Bundle Splitting**: Optimierte Chunk-Struktur
- **Lazy Loading**: Code und Component Splitting
- **Tree Shaking**: Eliminierung ungenutzten Codes
- **Source Maps**: Deaktiviert für Production

## 📦 Installation

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Git

### Setup
```bash
# Repository klonen
git clone [repository-url]
cd Energy-Management-MVP/frontend

# Dependencies installieren
npm install

# Environment konfigurieren
cp .env.example .env.local
# Anpassen der Environment Variables in .env.local

# Development Server starten
npm run dev
```

### Environment Variables
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_ENV=development
VITE_USE_MOCK_DATA=true
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here
```

## 🔧 Development

### Verfügbare Scripts
```bash
# Development Server (Port 3000)
npm run dev

# Production Build
npm run build

# Bundle Analyse
npm run build:analyze

# Tests ausführen
npm run test
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage Report

# Code Quality
npm run lint          # ESLint Check
npm run lint:fix      # Auto-fix ESLint Issues
npm run typecheck     # TypeScript Check

# Preview Production Build
npm run preview
```

### Mock vs. Real Mode
Die Anwendung unterstützt zwei Betriebsmodi:

**Mock Mode (Development)**
```env
VITE_USE_MOCK_DATA=true
```
- Simulierte APIs und WebSocket-Verbindungen
- Konsistente Test-Daten
- Keine Backend-Abhängigkeiten
- Perfekt für Frontend-Development

**Real Mode (Production)**
```env
VITE_USE_MOCK_DATA=false
```
- Echte API-Verbindungen
- Live WebSocket-Streams
- Production-Ready Setup

### Development Workflow
1. **Feature Development**: Entwicklung im Mock Mode
2. **Testing**: Comprehensive Test Suite ausführen
3. **Code Quality**: ESLint und TypeScript Checks
4. **Integration**: Real Mode Testing
5. **Build**: Production Build und Optimization
6. **Deployment**: Deployment auf Production Environment

## 🏗️ Architektur

### Projektstruktur
```
frontend/
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── ui/             # Basic UI Elements
│   │   ├── layout/         # Layout Components
│   │   ├── charts/         # Chart Components (Lazy Loaded)
│   │   └── dev/            # Development Tools
│   ├── pages/              # Page Components
│   │   ├── dashboard/      # Main Dashboard
│   │   ├── buildings/      # Building-specific Pages
│   │   ├── alerts/         # Alert Management
│   │   ├── analytics/      # AI Analytics
│   │   ├── auth/           # Authentication
│   │   └── admin/          # Admin Functions
│   ├── services/           # Business Logic
│   │   ├── api/            # API Services
│   │   ├── mock/           # Mock Services
│   │   └── serviceFactory  # Service Abstraction
│   ├── stores/             # Zustand State Management
│   ├── hooks/              # Custom React Hooks
│   ├── types/              # TypeScript Definitions
│   ├── utils/              # Utility Functions
│   └── test/               # Test Utilities
├── dist/                   # Production Build
├── coverage/               # Test Coverage Reports
└── docs/                   # Documentation
```

### Service Architecture
Das System verwendet eine **Service Factory Pattern** für saubere Trennung zwischen Mock und Real Services:

```typescript
// Automatische Service-Auswahl basierend auf Environment
const apiService = createAPIService();
const wsService = createWebSocketService();
```

### State Management
- **Zustand** für globalen Application State
- **React Hooks** für lokalen Component State
- **WebSocket Integration** für Echtzeit-Updates

## 🧪 Testing

### Test Strategy
- **Unit Tests**: Einzelne Funktionen und Components
- **Integration Tests**: Service Integration und Data Flow
- **Coverage Target**: >85% Code Coverage

### Test Execution
```bash
# Alle Tests
npm run test

# Watch Mode für Development
npm run test -- --watch

# Coverage Report generieren
npm run test:coverage

# Vitest UI für interaktive Tests
npm run test:ui
```

### Mock-System für Tests
Umfassendes Mock-System mit:
- Simulierte API Responses
- WebSocket Event Simulation
- Configurable Delay und Failure Rates
- Realistic Data Generation

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatische Bundle-Optimierung
- **Lazy Loading**: Charts und Heavy Components
- **Tree Shaking**: Eliminierung ungenutzten Codes
- **Asset Optimization**: Optimierte Chunk-Namen und Größen

### Performance Metrics
- **Bundle Size**: <500kb Gesamtgröße
- **First Load JS**: <200kb
- **Lighthouse Score**: >90 für alle Metriken
- **Core Web Vitals**: LCP <2.5s, CLS <0.1

### Performance Monitoring
```bash
# Bundle Analyse
npm run build:analyze

# Lighthouse Audit
npx lighthouse http://localhost:3000 --view

# Bundle Size Check
npx bundlephobia-cli package-name
```

## 🔐 Security

### Implementierte Security Features
- **Environment-basierte Configuration**
- **Token-basierte Authentication**
- **Role-based Access Control (RBAC)**
- **Input Validation und Sanitization**
- **Secure WebSocket Connections**

### Security Best Practices
- Keine API Keys im Code
- Environment Variables für sensitive Daten
- Sichere HTTP Headers
- XSS Protection durch React's built-in Escaping

## 🚀 Deployment

### Production Build
```bash
# Build erstellen
npm run build

# Build testen
npm run preview

# Build validieren
npm run typecheck && npm run lint && npm run test
```

### Deployment Targets
- **Vercel**: Optimiert für React SPA
- **Netlify**: Zero-config Deployment
- **AWS S3 + CloudFront**: Enterprise Setup
- **Docker**: Containerized Deployment

### Environment Setup für Production
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_APP_ENV=production
VITE_USE_MOCK_DATA=false
VITE_SENTRY_DSN=your_production_sentry_dsn
```

## 🔧 Troubleshooting

### Häufige Probleme

**Port bereits in Verwendung**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Node Modules Korruption**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**TypeScript Errors**
```bash
npm run typecheck
# oder
npx tsc --noEmit
```

**WebSocket Connection Issues**
- Prüfe VITE_WS_URL in .env.local
- Stelle sicher, dass Backend läuft (Real Mode)
- Verwende Mock Mode für lokale Entwicklung

## 📚 API Integration

### API Endpoints (Real Mode)
- `GET /api/auth/user` - User Profile
- `POST /api/auth/login` - Authentication
- `GET /api/energy/data` - Energy Data
- `GET /api/buildings` - Building Information
- `GET /api/alerts` - Active Alerts
- `WebSocket /ws` - Real-time Updates

### Mock System (Development)
Vollständiges Mock-System mit:
- Realistic Data Generation
- Configurable Response Times
- Error Simulation
- WebSocket Event Streaming

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: ESLint Konfiguration befolgen
2. **Testing**: Tests für neue Features schreiben
3. **TypeScript**: Strikte Typisierung verwenden
4. **Performance**: Bundle Size im Auge behalten
5. **Documentation**: Code-Kommentare und README Updates

### Git Workflow
```bash
# Feature Branch erstellen
git checkout -b feature/new-feature

# Changes committen
git add .
git commit -m "feat: add new feature"

# Tests ausführen
npm run test && npm run lint && npm run typecheck

# Push und Pull Request
git push origin feature/new-feature
```

## 📄 License

Copyright (c) 2024 Energy Management MVP. Alle Rechte vorbehalten.

## 📞 Support

Bei Fragen oder Problemen:
- **Issues**: GitHub Issues für Bug Reports
- **Documentation**: Siehe `/docs` Verzeichnis für detaillierte Guides
- **Development**: DEVELOPMENT_GUIDE.md für Entwickler-Informationen

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Status**: Production Ready ✅