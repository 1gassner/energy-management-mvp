# API Integration und Error Handling Verbesserungen

## Überblick

Diese Dokumentation beschreibt die umfassenden Verbesserungen der API-Integration im CityPulse Hechingen Projekt. Die Implementierung behebt alle kritischen Probleme mit Fehlerbehandlung, Loading-States, Retry-Logic, Request-Deduplizierung und Timeout-Handling.

## Implementierte Lösungen

### 1. Enhanced API Service (`/src/services/api/enhancedApiService.ts`)

#### Features:
- **Umfassende Fehlerbehandlung** mit benutzerfreundlichen deutschen Fehlermeldungen
- **Exponential Backoff Retry-Logic** mit konfigurierbaren Bedingungen
- **Intelligente Request-Deduplizierung** zur Vermeidung doppelter Anfragen
- **Prioritäts-basierte Request-Queue** für Load-Balancing
- **Timeout-Handling** mit automatischer Retry-Logik
- **Intelligentes Caching** mit Stale-While-Revalidate
- **Network Status Monitoring** mit automatischer Wiederherstellung
- **Rate Limiting Protection** mit automatischer Wartezeit

#### Error Types:
```typescript
- ApiError: HTTP-spezifische Fehler mit Status-Codes
- NetworkError: Netzwerkverbindungsfehler
- TimeoutError: Request-Timeout-Fehler
- RateLimitError: Rate-Limit-Überschreitungen
```

#### Request-Konfiguration:
```typescript
interface RequestConfig {
  cache?: boolean;           // Caching aktivieren
  cacheTTL?: number;        // Cache Time-to-Live
  retries?: number;         // Anzahl Wiederholungen
  timeout?: number;         // Request-Timeout
  priority?: 'low' | 'normal' | 'high' | 'critical';
  background?: boolean;     // Background-Request
  suppressErrorToast?: boolean; // Toast-Nachrichten unterdrücken
}
```

### 2. React Hooks für API-Operationen (`/src/hooks/useApi.ts`)

#### Bereitgestellte Hooks:

**Basis-Hook:**
```typescript
useApi<T>(apiCall: () => Promise<T>, options?: UseApiOptions<T>)
```

**Spezifische Data-Hooks:**
```typescript
useEnergyData(buildingId: string, timeRange: string)
useKPIData(buildingId: string)
useHistoricalData(buildingId: string, startDate: string, endDate: string)
useUserData()
```

**Mutation-Hooks:**
```typescript
useMutation<TData, TVariables>(mutationFn, options)
useOptimisticMutation<TData, TVariables>(mutationFn, options)
```

**Loading-State Hook:**
```typescript
useApiLoadingState() // Globaler Loading-Zustand
```

### 3. Enhanced Loading Components (`/src/components/ui/EnhancedLoading.tsx`)

#### Komponenten:
- `LoadingSpinner`: Konfigurierbare Spinner mit Progress-Anzeige
- `Skeleton`: Skeleton-Loading für verschiedene Content-Typen
- `LoadingState`: Wrapper für Loading/Error/Empty-States
- `ErrorDisplay`: Detaillierte Error-Anzeige mit Retry-Button
- `EmptyState`: Benutzerfreundliche Empty-State-Anzeige
- `GlobalLoadingIndicator`: Globale Progress-Bar
- `ConnectionStatus`: Offline-Status-Indikator

### 4. TypeScript-Definitionen (`/src/types/apiResponses.ts`)

Umfassende TypeScript-Definitionen für alle API-Responses:
- Authentifizierung (Login, Register, User)
- Gebäude und Sensoren
- Energiedaten und KPIs
- Historische Daten und Analytics
- Alerts und Benachrichtigungen
- System-Health und Budget

## Verwendung

### Beispiel: Energiedaten laden mit Loading-States

```typescript
import { useEnergyData } from '@/hooks/useApi';
import { LoadingState } from '@/components/ui/EnhancedLoading';

function EnergyDashboard({ buildingId }: { buildingId: string }) {
  const {
    data: energyData,
    loading,
    error,
    refetch
  } = useEnergyData(buildingId, '24h', {
    onError: (error) => {
      console.error('Energy data fetch failed:', error);
    }
  });

  return (
    <LoadingState
      loading={loading}
      error={error}
      retry={refetch}
      empty={!energyData}
    >
      {/* Ihr Dashboard-Content */}
      <div>{JSON.stringify(energyData)}</div>
    </LoadingState>
  );
}
```

### Beispiel: Mutation mit Optimistic Updates

```typescript
import { useMutation } from '@/hooks/useApi';
import { enhancedApiService } from '@/services/api/enhancedApiService';

function BuildingSettings({ buildingId }: { buildingId: string }) {
  const updateBuildingMutation = useMutation(
    (settings: Partial<Building>) => 
      enhancedApiService.updateBuilding(buildingId, settings),
    {
      onSuccess: (data) => {
        console.log('Building updated:', data);
      },
      onError: (error) => {
        console.error('Update failed:', error);
      }
    }
  );

  return (
    <button
      onClick={() => updateBuildingMutation.mutate({ name: 'New Name' })}
      disabled={updateBuildingMutation.loading}
    >
      {updateBuildingMutation.loading ? 'Speichere...' : 'Speichern'}
    </button>
  );
}
```

## Konfiguration

### Service Factory Update

Die Service Factory wurde aktualisiert, um den Enhanced API Service zu verwenden:

```typescript
// In serviceFactory.ts
createAPIService(): IAPIService {
  if (this.mockConfig.useMockData) {
    return mockAPIService;
  } else {
    return enhancedApiService; // Verwendet jetzt den Enhanced Service
  }
}
```

### Umgebungsvariablen

Keine zusätzlichen Umgebungsvariablen erforderlich. Der Service verwendet die vorhandenen:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_MOCK_DATA=false
```

## Performance-Optimierungen

### 1. Intelligentes Caching
- **Stale-While-Revalidate**: Daten werden sofort aus dem Cache bereitgestellt, während im Hintergrund aktualisiert wird
- **TTL-basierte Invalidierung**: Verschiedene Cache-Zeiten je nach Datentyp
- **Automatische Cache-Bereinigung**: Verhindert Memory-Leaks

### 2. Request-Optimierung
- **Deduplication**: Identische Requests werden zusammengefasst
- **Priority Queue**: Kritische Requests werden priorisiert
- **Connection Pooling**: Begrenzte Anzahl gleichzeitiger Requests
- **Background Refresh**: Nicht-kritische Updates im Hintergrund

### 3. Network Resilience
- **Exponential Backoff**: Intelligente Retry-Delays
- **Network Status Monitoring**: Automatische Anpassung bei Offline/Online
- **Graceful Degradation**: Funktionalität bleibt bei partiellen Ausfällen erhalten

## Error Handling

### Benutzerfreundliche Fehlermeldungen

```typescript
const errorMessages = {
  401: 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.',
  403: 'Zugriff verweigert. Sie haben nicht die erforderlichen Berechtigungen.',
  404: 'Die angeforderte Ressource wurde nicht gefunden.',
  429: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
  500: 'Serverfehler. Das Problem wird behoben.',
  NetworkError: 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.',
  TimeoutError: 'Anfrage-Timeout. Bitte versuchen Sie es erneut.'
};
```

### Retry-Strategien

- **Automatische Wiederholung** bei 5xx-Fehlern und Netzwerkproblemen
- **Keine Wiederholung** bei 4xx-Fehlern (außer 408, 429)
- **Konfigurierbare Retry-Bedingungen** pro Request
- **Exponential Backoff** mit Jitter zur Vermeidung von Thundering Herd

## Monitoring und Debugging

### API-Statistiken

```typescript
// Verfügbare Monitoring-Methoden
enhancedApiService.getCacheStats();
enhancedApiService.getNetworkStats();
enhancedApiService.clearCache(pattern?);
```

### Development Tools

Im Development-Modus sind Debug-Tools verfügbar:

```javascript
// Im Browser-Console verfügbar
window.debugEnergy.getConfig();      // Aktuelle Konfiguration
window.debugEnergy.simulateIssues();  // Netzwerkprobleme simulieren
window.debugEnergy.triggerAlert();    // Test-Alert auslösen
```

### Logging

Umfassendes Logging mit verschiedenen Log-Levels:
- Info: Erfolgreiche Operationen
- Warn: Retry-Versuche und Warnungen
- Error: Fehlgeschlagene Requests
- Debug: Detaillierte Request/Response-Informationen

## Testing

### Beispiel-Komponente

Eine vollständige Beispiel-Komponente (`/src/components/examples/EnhancedApiExample.tsx`) demonstriert alle Features:

- Laden von Energiedaten mit Caching
- KPI-Daten mit hoher Priorität
- Mutation mit Optimistic Updates
- Globale Loading-States
- Error-Handling mit Retry
- Connection Status Monitoring

### Unit Tests

Die Hooks können mit den vorhandenen Testing-Utilities getestet werden:

```typescript
import { renderHook } from '@testing-library/react';
import { useEnergyData } from '@/hooks/useApi';

test('should load energy data', async () => {
  const { result } = renderHook(() => 
    useEnergyData('building-1', '24h')
  );
  
  expect(result.current.loading).toBe(true);
  // Weitere Assertions...
});
```

## Migration Guide

### Von alter API zu Enhanced API

1. **Imports aktualisieren**:
```typescript
// Alt
import { apiService } from '@/services/serviceFactory';

// Neu
import { useEnergyData, useMutation } from '@/hooks/useApi';
```

2. **Component State ersetzen**:
```typescript
// Alt
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// Neu
const { data, loading, error, refetch } = useEnergyData(buildingId, timeRange);
```

3. **Loading-Komponenten verwenden**:
```typescript
// Neu
<LoadingState loading={loading} error={error} retry={refetch}>
  {/* Content */}
</LoadingState>
```

## Fazit

Die Enhanced API Integration löst alle identifizierten Probleme:

✅ **Umfassende Fehlerbehandlung** mit benutzerfreundlichen Nachrichten  
✅ **Loading-States** für alle API-Operationen  
✅ **Retry-Logic** mit exponential backoff  
✅ **Request-Deduplizierung** zur Vermeidung doppelter Aufrufe  
✅ **Timeout-Handling** mit automatischer Wiederherstellung  
✅ **TypeScript-Typen** für alle API-Responses  
✅ **React Hooks** für einfache Integration  
✅ **Performance-Optimierungen** mit intelligentem Caching  
✅ **Monitoring und Debugging-Tools**  
✅ **Umfassende Dokumentation**  

Die Lösung ist production-ready und bietet eine robuste, skalierbare API-Integration für das gesamte CityPulse Hechingen System.