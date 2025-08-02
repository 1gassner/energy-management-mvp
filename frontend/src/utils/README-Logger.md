# Logger Service

Professioneller Logging-Service für die Energy Management MVP Plattform.

## Features

- ✅ **Environment-basierte Log-Level Kontrolle**
- ✅ **Strukturierte Logs für Production (JSON Format)**
- ✅ **Type-safe mit TypeScript**
- ✅ **Einfache API ähnlich zu console**
- ✅ **Context-aware Child Logger**
- ✅ **Externe Logging-Service Integration**

## Verwendung

### Basic Usage

```typescript
import { logger } from '../utils/logger';

// Debug Information (nur in Development)
logger.debug('User interaction', { component: 'Dashboard', action: 'click' });

// Allgemeine Informationen
logger.info('WebSocket connected', { url: 'ws://localhost:3001' });

// Warnungen
logger.warn('High memory usage detected', { usage: '85%' });

// Fehler
logger.error('Database connection failed', error);
```

### Child Logger mit Context

```typescript
import { createLogger } from '../utils/logger';

// Logger mit festem Context erstellen
const componentLogger = createLogger({ 
  component: 'WebSocketService',
  version: '1.0.0'
});

// Alle Logs enthalten automatisch den Context
componentLogger.info('Connection established'); 
// Output: { level: 'info', message: 'Connection established', component: 'WebSocketService', version: '1.0.0' }
```

### Erweiterte Konfiguration

```typescript
import { logger } from '../utils/logger';

// Aktuelle Konfiguration anzeigen
console.log(logger.getConfiguration());

// Konfiguration zur Laufzeit ändern
logger.configure({
  level: 'warn',
  enableConsole: false
});
```

## Environment Variablen

### .env.local (Development)
```env
# Log Level (debug, info, warn, error)
VITE_LOG_LEVEL=debug

# Console Output aktivieren
VITE_ENABLE_CONSOLE_LOGS=true

# Strukturierte Logs aktivieren
VITE_ENABLE_STRUCTURED_LOGS=false
```

### .env.production
```env
# Nur Warnungen und Fehler in Production
VITE_LOG_LEVEL=warn

# Console deaktivieren
VITE_ENABLE_CONSOLE_LOGS=false

# Strukturierte Logs für Log-Aggregation
VITE_ENABLE_STRUCTURED_LOGS=true

# Optional: Endpoint für externe Logging Services
VITE_LOG_ENDPOINT=https://api.yourdomain.com/logs
```

## Log-Level Hierarchie

| Level | Description | Development | Production |
|-------|-------------|-------------|------------|
| `debug` | Detaillierte Debug-Information | ✅ | ❌ |
| `info` | Allgemeine Informationen | ✅ | ❌ |
| `warn` | Warnungen | ✅ | ✅ |
| `error` | Fehler | ✅ | ✅ |

## Output Formate

### Development (Console)
```
[14:30:25] [INFO] WebSocket connected { url: "ws://localhost:3001" }
[14:30:26] [ERROR] Database error Error: Connection timeout
```

### Production (Structured JSON)
```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2025-01-01T14:30:25.123Z",
  "context": { "retryCount": 3, "timeout": 5000 },
  "error": {
    "name": "ConnectionError",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\\n    at Database.connect..."
  }
}
```

## Integration mit externen Services

Der Logger unterstützt die Integration mit externen Logging-Services:

```typescript
// Konfiguration über Environment Variable
VITE_LOG_ENDPOINT=https://logs.datadoghq.com/v1/input/YOUR_API_KEY

// Oder programmatisch konfigurieren
logger.configure({
  enableStructured: true,
  environment: 'production'
});
```

## Migration von console zu logger

### Vorher
```typescript
console.log('User logged in:', user);
console.error('API error:', error);
console.warn('Deprecated function used');
```

### Nachher
```typescript
logger.info('User logged in', { userId: user.id, name: user.name });
logger.error('API error', error);
logger.warn('Deprecated function used', { function: 'oldFunction' });
```

## Best Practices

1. **Strukturierte Daten**: Nutzen Sie den `context` Parameter für strukturierte Informationen
2. **Sensitive Daten**: Loggen Sie niemals Passwörter, Tokens oder andere sensible Daten
3. **Performance**: Debug-Logs werden automatisch in Production gefiltert
4. **Error Handling**: Nutzen Sie den Error-Parameter für vollständige Stack-Traces
5. **Child Logger**: Verwenden Sie Child-Logger für komponenten-spezifische Logs

## Troubleshooting

### Logs erscheinen nicht in Production
- Überprüfen Sie `VITE_LOG_LEVEL` (sollte `warn` oder `error` sein)
- Stellen Sie sicher, dass `VITE_ENABLE_CONSOLE_LOGS=true` gesetzt ist

### Structured Logs funktionieren nicht
- Verifizieren Sie `VITE_ENABLE_STRUCTURED_LOGS=true`
- Überprüfen Sie die `VITE_LOG_ENDPOINT` URL
- Kontrollieren Sie Netzwerk-Fehler in den Browser-Dev-Tools