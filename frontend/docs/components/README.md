# Components Dokumentation

## 📚 Übersicht

Die Energy Management MVP verwendet eine moderne React-Komponentenarchitektur mit TypeScript, optimiert für Performance und Benutzerfreundlichkeit.

## 🧩 Komponenten-Kategorien

### Dashboard Components
Zentrale Dashboard-Komponenten für die Hauptbenutzeroberfläche.

### Chart Components
Lazy-loaded Diagramm-Komponenten für Datenvisualisierung.

### UI Components
Wiederverwendbare UI-Bausteine mit einheitlichem Design.

### Layout Components
Strukturelle Komponenten für das Anwendungslayout.

## 📊 Dashboard Components

### DashboardCard
**Datei**: `src/components/ui/DashboardCard.tsx`

Hochperformante Karten-Komponente für Dashboard-Metriken mit Trend-Visualisierung.

#### Features
- **Memoized Rendering**: Optimiert mit `React.memo`
- **Trend-Indikatoren**: Visuelle Darstellung von Änderungen
- **Internationalisierung**: Deutsche Zahlenformatierung
- **Responsive Design**: Flexible Layoutanpassung

#### Props Interface
```typescript
interface DashboardCardProps {
  title: string;                    // Kartentitel
  value: string | number;           // Hauptwert
  unit?: string;                    // Einheit (z.B. "kWh", "kg")
  icon: ReactNode;                  // Icon-Element
  trend?: {                         // Trend-Daten
    value: number;                  // Prozentuale Änderung
    isPositive: boolean;            // Positive/negative Änderung
  };
  color?: string;                   // Tailwind CSS Farb-Klasse
}
```

#### Usage Example
```tsx
import DashboardCard from '@/components/ui/DashboardCard';
import { Zap } from 'lucide-react';

<DashboardCard
  title="Energieproduktion"
  value={1247}
  unit="kWh"
  icon={<Zap className="w-6 h-6" />}
  trend={{ value: 12.5, isPositive: true }}
  color="bg-green-500"
/>
```

#### Performance Features
- **useMemo**: Wert-Formatierung gecacht
- **memo**: Komponente re-rendert nur bei Props-Änderungen
- **Optimized Icons**: Lucide React Icons für kleine Bundle-Größe

### Dashboard Main Component
**Datei**: `src/pages/dashboard/Dashboard.tsx`

Zentrale Dashboard-Komponente mit Real-time Updates und WebSocket-Integration.

#### Features
- **Real-time Data**: WebSocket-basierte Live-Updates
- **Responsive Grid**: Adaptive Karten-Anordnung
- **Activity Feed**: Live-Aktivitätsprotokoll
- **Connection Status**: Verbindungsanzeige
- **Role-based Access**: Benutzerrollenbasierte UI

#### Key Hooks Used
```typescript
// WebSocket für Real-time Updates
const { isConnected, connectionState } = useWebSocket('dashboard_update', {
  onMessage: handleWebSocketMessage,
  onConnect: () => notificationService.success('Connected'),
  autoConnect: true
});

// Auth State
const { user } = useAuthStore();
```

#### State Management
```typescript
const [stats, setStats] = useState<DashboardStats | null>(null);
const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

## 📈 Chart Components

### Lazy Loading Architecture
Alle Chart-Komponenten nutzen React's `lazy()` und `Suspense` für optimierte Bundle-Größe.

#### LazyLineChart
**Datei**: `src/components/charts/LazyLineChart.tsx`

Line Chart mit dynamischem Import der recharts Library.

```tsx
// Lazy Loading Pattern
const RechartsLineChart = lazy(() => 
  import('recharts').then(module => ({
    default: function Chart({ data, height }) {
      return (
        <module.ResponsiveContainer width="100%" height={height}>
          <module.LineChart data={data}>
            <module.CartesianGrid strokeDasharray="3 3" />
            <module.XAxis dataKey="time" />
            <module.YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
            <module.Tooltip />
            <module.Line type="monotone" dataKey="production" stroke="#10B981" strokeWidth={2} />
            <module.Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} />
            <module.Line type="monotone" dataKey="grid" stroke="#8B5CF6" strokeWidth={2} />
          </module.LineChart>
        </module.ResponsiveContainer>
      );
    }
  }))
);
```

#### Usage with Suspense
```tsx
<Suspense fallback={
  <div className="flex justify-center items-center" style={{ height: '300px' }}>
    <LoadingSpinner />
  </div>
}>
  <LazyLineChart data={energyData} height={300} />
</Suspense>
```

#### Bundle Optimization Benefits
- **Code Splitting**: recharts wird nur bei Bedarf geladen
- **Reduced Initial Bundle**: ~200KB weniger in der Hauptbundle
- **Progressive Loading**: Charts laden asynchron nach Bedarf

### LazyBarChart & LazyPieChart
Ähnliche Implementierung für Bar- und Pie-Charts mit spezifischen Konfigurationen.

## 🎨 UI Components

### LoadingSpinner
**Datei**: `src/components/ui/LoadingSpinner.tsx`

Einheitliche Loading-Anzeige für alle Anwendungsbereiche.

#### Size Variants
```typescript
type SpinnerSize = 'sm' | 'md' | 'lg';

// CSS-Klassen für verschiedene Größen
const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};
```

#### Usage Examples
```tsx
// Small spinner for inline loading
<LoadingSpinner size="sm" />

// Full page loading
<LoadingSpinner size="lg" text="Loading dashboard..." />
```

### Button Component
**Datei**: `src/components/ui/Button.tsx`

Standardisierte Button-Komponente mit verschiedenen Varianten.

#### Variants
- **Primary**: `btn-primary` - Hauptaktion
- **Secondary**: `btn-secondary` - Sekundäre Aktionen
- **Danger**: `btn-danger` - Destruktive Aktionen

### ConnectionStatus
**Datei**: `src/components/ui/ConnectionStatus.tsx`

Real-time Verbindungsstatus-Anzeige für WebSocket-Verbindungen.

#### Features
- **Live Status**: Echtzeitanzeige der Verbindung
- **Visual Indicators**: Farbkodierte Status-Anzeige
- **Automatic Updates**: Reagiert auf WebSocket-Events

### ThemeToggle
**Datei**: `src/components/ui/ThemeToggle.tsx`

Dark/Light Mode Toggle für die gesamte Anwendung.

## 🚨 Error Handling

### ErrorBoundary
**Datei**: `src/components/ErrorBoundary.tsx`

React Error Boundary für graceful Error Handling.

#### Features
- **Error Catching**: Fängt JavaScript-Fehler in der Komponenten-Hierarchie
- **Logging Integration**: Automatisches Logging über Logger Service
- **User-friendly UI**: Deutsche Fehlermeldungen für Benutzer
- **Development Details**: Technische Details nur in Development
- **Recovery Options**: Retry und Reload Funktionen

#### Error Handling Flow
```typescript
public static getDerivedStateFromError(error: Error): State {
  return { hasError: true, error };
}

public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Logging
  logger.error('ErrorBoundary caught an error', { 
    error, 
    componentStack: errorInfo.componentStack 
  });
  
  // Production Error Reporting (commented for MVP)
  if (import.meta.env.VITE_SENTRY_DSN) {
    // Sentry.captureException(error, { contexts: { react: { errorInfo } } });
  }
}
```

#### Recovery Methods
```typescript
private handleRetry = () => {
  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
};

private handleReload = () => {
  window.location.reload();
};
```

### HealthCheck Component
**Datei**: `src/components/HealthCheck.tsx`

System-Health-Monitoring für kritische Services.

## 🔧 Layout Components

### Header
**Datei**: `src/components/layout/Header.tsx`

Haupt-Navigation mit Benutzer-Menü und Theme-Toggle.

#### Features
- **Responsive Navigation**: Mobile-optimierte Navigation
- **User Authentication**: Login/Logout Funktionalität
- **Theme Integration**: Dark/Light Mode Toggle
- **Role-based Menus**: Unterschiedliche Menüs je nach Benutzerrolle

### Layout
**Datei**: `src/components/layout/Layout.tsx`

Haupt-Layout-Wrapper für alle Seiten.

#### Structure
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header />
  <main className="flex-1">
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </main>
</div>
```

## 🎯 Best Practices

### Performance Optimization

#### 1. Memoization
```tsx
// React.memo für Pure Components
const DashboardCard = memo(({ title, value, unit, icon, trend, color }) => {
  // Component logic
});

// useMemo für teure Berechnungen
const formattedValue = useMemo(() => formatValue(value), [value, formatValue]);
```

#### 2. Lazy Loading
```tsx
// Code Splitting für große Libraries
const ChartComponent = lazy(() => import('recharts'));

// Suspense für Loading States
<Suspense fallback={<LoadingSpinner />}>
  <ChartComponent />
</Suspense>
```

#### 3. Bundle Optimization
- **Tree Shaking**: Nur benötigte Icon-Komponenten importieren
- **Dynamic Imports**: Große Libraries bei Bedarf laden
- **Component Splitting**: Große Komponenten aufteilen

### Code Organization

#### 1. Klare Verzeichnisstruktur
```
components/
├── ui/           # Wiederverwendbare UI-Komponenten
├── charts/       # Diagramm-Komponenten
├── layout/       # Layout-Komponenten
├── dev/          # Development-Tools
└── __tests__/    # Component Tests
```

#### 2. TypeScript Integration
- **Interface Definitions**: Klare Props-Interfaces
- **Type Safety**: Vollständige Typisierung
- **Generic Components**: Wiederverwendbare typisierte Komponenten

#### 3. Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Isolierte Komponenten-Tests
- **Integration Tests**: Komponenten-Interaktion

### Accessibility

#### 1. Semantic HTML
- **Proper Heading Structure**: h1, h2, h3 Hierarchie
- **ARIA Labels**: Zugänglichkeitslabels für Screen Reader
- **Keyboard Navigation**: Tab-Navigation Support

#### 2. Visual Accessibility
- **Color Contrast**: WCAG 2.1 AA Standard
- **Focus Indicators**: Sichtbare Focus-States
- **Text Scaling**: Responsive Text-Größen

## 🔄 Real-time Features

### WebSocket Integration
Komponenten nutzen den `useWebSocket` Hook für Live-Updates:

```tsx
const { isConnected } = useWebSocket('dashboard_update', {
  onMessage: (message) => {
    // Handle real-time updates
    updateComponentState(message);
  },
  autoConnect: true
});
```

### Notification Integration
Komponenten sind mit dem Notification Service verbunden:

```tsx
import { notificationService } from '@/services/notification.service';

// Success notifications
notificationService.success('Data updated successfully');

// Error notifications
notificationService.error('Failed to load data');
```

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
.container {
  @apply px-4;
}

/* Tablet */
@screen md {
  .container {
    @apply px-6;
  }
}

/* Desktop */
@screen lg {
  .container {
    @apply px-8;
  }
}
```

### Grid Systems
```tsx
// Responsive Dashboard Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {cards.map(card => (
    <DashboardCard key={card.id} {...card} />
  ))}
</div>
```

## 🚀 Performance Monitoring

### Component Performance
- **React DevTools Profiler**: Komponenten-Performance überwachen
- **Bundle Analyzer**: Bundle-Größe analysieren
- **Lighthouse**: Core Web Vitals überwachen

### Real-world Metrics
- **Loading Times**: < 2s für kritische Komponenten
- **Bundle Size**: Charts: ~50KB gzipped
- **Memory Usage**: Optimiertes State Management