# Environment-Based Mock System Documentation

## Overview

Das Energy Management MVP Frontend verfügt jetzt über ein vollständiges Environment-basiertes Mock-System, das nahtloses Umschalten zwischen Mock-Daten (Development) und echten APIs (Production) ermöglicht.

## Features

### ✅ Implementiert

1. **Environment-basierte API Service Factory**
   - Automatische Auswahl zwischen Mock und Real APIs basierend auf `VITE_USE_MOCK_DATA`
   - Einheitliche Interfaces für Mock und Real Services
   - Type-Safe Implementation

2. **Mock Data System**
   - Realistische Mock-Daten für alle Features
   - Mock Authentication mit verschiedenen User-Rollen
   - Mock WebSocket für Real-Time Updates
   - Konfigurierbarer Mock-Delay und Failure-Rate

3. **Unified API Interface**
   - Alle Services implementieren dasselbe Interface
   - Keine Code-Änderungen beim Umschalten zwischen Mock/Real
   - TypeScript Type-Safety durchgehend

4. **Development Tools**
   - Live Mock Data Toggle Component
   - Test Alert Trigger
   - Network Issue Simulation
   - Configuration Panel

## Environment Variables

```bash
# .env.local
VITE_USE_MOCK_DATA=true          # Enable/disable mock mode
VITE_MOCK_DELAY=800              # Mock API delay in ms
VITE_MOCK_FAILURE_RATE=0         # Failure rate (0-1)
VITE_WS_ENABLED=true             # Enable WebSocket
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## Architecture

```
src/services/
├── serviceFactory.ts           # Central factory for service creation
├── mock/
│   ├── mockData.ts            # Realistic mock data
│   ├── mockApiService.ts      # Mock API implementation
│   └── mockWebSocketService.ts # Mock WebSocket service
├── api/
│   ├── realApiService.ts      # Real API implementation
│   └── realWebSocketService.ts # Real WebSocket service
└── websocket.service.ts       # Backward compatibility wrapper
```

## Usage

### Automatic Mode (Recommended)
Das System wählt automatisch basierend auf Environment Variables:
- `VITE_USE_MOCK_DATA=true` → Mock Mode
- `VITE_USE_MOCK_DATA=false` → Real API Mode
- Development → Default Mock Mode
- Production → Default Real Mode

### Manual Switching (Development)
```typescript
import { serviceFactory } from '@/services/serviceFactory';

// Switch to mock mode
serviceFactory.switchToMockMode();

// Switch to real mode
serviceFactory.switchToRealMode();

// Check current mode
const isMock = serviceFactory.isMockMode();
```

### Using Services
```typescript
import { apiService, webSocketService } from '@/services/serviceFactory';

// API calls work identically in mock and real mode
const user = await apiService.login(credentials);
const buildings = await apiService.getBuildings();

// WebSocket subscriptions work identically
webSocketService.subscribe('energy_update', (data) => {
  console.log('Energy update:', data);
});
```

## Mock Data Features

### Authentication
- **Admin**: admin@energy.com / admin123
- **Manager**: manager@energy.com / manager123  
- **User**: user@energy.com / user123

### Mock Buildings
- Rathaus (ID: rathaus-001)
- Grundschule (ID: grundschule-001)
- Realschule (ID: realschule-001)

### Real-Time Data
- Simulated sensor updates every 3-5 seconds
- Random energy data variations
- Alert generation
- Building status changes

### Development Tools

In Development Mode ist eine Live Control Panel verfügbar (rechts unten):

- **Mock Mode Toggle**: Umschalten zwischen Mock/Real
- **Delay Configuration**: Anpassen der API Response Zeit
- **Network Issues**: Simuliere Verbindungsprobleme
- **Alert Triggers**: Teste verschiedene Alert-Severity Level

## Testing

### Build Test
```bash
npm run build     # ✅ Production build successful
npm run typecheck # ✅ TypeScript compilation successful
```

### Mock Credentials für Testing
```typescript
// In Mock Mode - diese Credentials funktionieren:
const credentials = {
  admin: { email: 'admin@energy.com', password: 'admin123' },
  manager: { email: 'manager@energy.com', password: 'manager123' },
  user: { email: 'user@energy.com', password: 'user123' }
};
```

## Migration Path

### Von Mock zu Real API

1. **Backend API bereitstellen** mit denselben Endpoints wie Mock Service
2. **Environment Variables anpassen**:
   ```bash
   VITE_USE_MOCK_DATA=false
   VITE_API_URL=https://your-api.com/api
   VITE_WS_URL=wss://your-api.com
   ```
3. **Keine Code-Änderungen nötig** - Services bleiben identisch

### Production Deployment

```bash
# Production .env
VITE_APP_ENV=production
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://prod-api.energy.com/api
VITE_WS_URL=wss://prod-api.energy.com
```

## Debug Tools

In Development Mode verfügbar über `window.debugEnergy`:

```javascript
// Browser Console Commands
window.debugEnergy.switchToMock()    // Switch to mock mode
window.debugEnergy.switchToReal()    // Switch to real mode
window.debugEnergy.simulateIssues()  // Simulate network issues
window.debugEnergy.triggerAlert('rathaus-001', 'critical')
window.debugEnergy.getConfig()       // Get current configuration
window.debugEnergy.isMock()          // Check if in mock mode
```

## Benefits

1. **Seamless Development**: Sofortige Entwicklung ohne Backend-Abhängigkeiten
2. **Production Ready**: Ein-Knopf-Umschaltung zu echten APIs
3. **Type Safety**: Vollständige TypeScript-Unterstützung
4. **Testing**: Realistische Mock-Daten für UI/UX Testing
5. **Debugging**: Live-Configuration und Test-Tools
6. **Performance**: Optimierte Bundle-Größe durch Code-Splitting

## Status: ✅ PRODUCTION READY

Das Mock-System ist vollständig implementiert und getestet. Die Anwendung kann sowohl mit Mock-Daten (Development) als auch mit echten APIs (Production) betrieben werden, ohne Code-Änderungen.