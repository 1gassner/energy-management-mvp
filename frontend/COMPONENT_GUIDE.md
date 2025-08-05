# 🧩 CityPulse Component Guide

**Version:** 1.0.0  
**Last Updated:** August 3, 2025

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Core UI Components](#-core-ui-components)
3. [Chart Components](#-chart-components)
4. [Layout Components](#-layout-components)
5. [Development Components](#-development-components)
6. [Component Patterns](#-component-patterns)
7. [Styling Guidelines](#-styling-guidelines)
8. [Best Practices](#-best-practices)

---

## 🌟 Overview

CityPulse verfügt über eine umfassende Component Library mit modernem Glassmorphism-Design, building-spezifischen Themes und vollständiger TypeScript-Unterstützung. Alle Komponenten sind darauf ausgelegt, in der Energy Management Umgebung optimale Performance und Benutzerfreundlichkeit zu bieten.

### Design Philosophy
- **Glassmorphism First** - Moderne, transparente UI-Elemente
- **Building-Specific Themes** - Eindeutige visuelle Identität für jedes Gebäude
- **Accessibility-Ready** - WCAG 2.1 AA konform
- **Performance-Optimized** - Lazy Loading und Memoization
- **Type-Safe** - Vollständige TypeScript-Integration

### Component Architecture
```
Component Library
├── UI Components (Basic Building Blocks)
│   ├── ModernCard - Base card component
│   ├── MetricCard - Metric display component
│   ├── ChartCard - Chart container component
│   ├── AlertCard - Alert notification component
│   ├── Button - Interactive button component
│   └── LoadingSpinner - Loading state component
├── Chart Components (Data Visualization)
│   ├── LazyBarChart - Bar chart (lazy loaded)
│   ├── LazyLineChart - Line chart (lazy loaded)
│   └── LazyPieChart - Pie chart (lazy loaded)
├── Layout Components (Structure)
│   ├── Layout - Main application layout
│   ├── Header - Navigation header
│   └── PublicHeader - Public page header
└── Development Components (Tools)
    └── MockDataToggle - Mock/Real API toggle
```

---

## 🎨 Core UI Components

### ModernCard - Base Card Component

#### Overview
Der `ModernCard` ist die Basis für alle card-basierten UI-Elemente in CityPulse. Er unterstützt verschiedene Varianten für building-spezifische Themes und Glassmorphism-Effects.

#### Props Interface
```typescript
interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  hover?: boolean;
  animate?: boolean;
}
```

#### Usage Examples

##### Basic Usage
```tsx
import { ModernCard } from '@/components/ui/ModernCard';

<ModernCard>
  <p>Basic card content</p>
</ModernCard>
```

##### Glassmorphism Variant
```tsx
<ModernCard variant="glassmorphism" hover={true} animate={true}>
  <div className="p-6">
    <h3>Glassmorphism Card</h3>
    <p>Transparent, modern appearance with backdrop blur</p>
  </div>
</ModernCard>
```

##### Building-Specific Themes
```tsx
{/* Rathaus - Administrative Theme */}
<ModernCard variant="heritage">
  <p>Rathaus specific styling</p>
</ModernCard>

{/* Educational Buildings */}
<ModernCard variant="education">
  <p>Gymnasium, Realschule, etc.</p>
</ModernCard>

{/* Sports Buildings */}
<ModernCard variant="sports">
  <p>Sporthallen styling</p>
</ModernCard>

{/* Pool/Aquatic Buildings */}
<ModernCard variant="pool">
  <p>Hallenbad styling</p>
</ModernCard>
```

#### Variant Styles
| Variant | Use Case | Color Theme | Visual Effect |
|---------|----------|-------------|---------------|
| `default` | General purpose | Neutral grays | Standard shadows |
| `glassmorphism` | Modern cards | Transparent | Backdrop blur, glass effect |
| `education` | Schools | Green/Purple | Educational theme |
| `pool` | Hallenbad | Cyan/Aqua | Water-inspired gradients |
| `sports` | Sporthallen | Red/Orange | Energy-inspired |
| `heritage` | Rathaus | Gold/Amber | Traditional, elegant |

---

### MetricCard - Metric Display Component

#### Overview
`MetricCard` ist speziell für die Anzeige von Kennzahlen mit Trends, Icons und building-spezifischen Farbthemen konzipiert.

#### Props Interface
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'emerald';
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  animate?: boolean;
}
```

#### Usage Examples

##### Basic Metric Display
```tsx
import { MetricCard } from '@/components/ui/MetricCard';
import { Zap } from 'lucide-react';

<MetricCard
  title="Energieverbrauch"
  value={1245.6}
  unit="kWh"
  icon={<Zap className="w-6 h-6" />}
  color="blue"
/>
```

##### Metric with Trend
```tsx
<MetricCard
  title="CO₂ Einsparung"
  value={567.8}
  unit="kg"
  icon={<Leaf className="w-6 h-6" />}
  color="green"
  trend={{
    value: 12.5,
    isPositive: true,
    label: "vs. letzter Monat"
  }}
  variant="glassmorphism"
/>
```

##### Building-Specific Metrics
```tsx
{/* Rathaus - Heritage Theme */}
<MetricCard
  title="Verwaltungseffizienz"
  value="87.2"
  unit="%"
  icon={<Building className="w-6 h-6" />}
  color="blue"
  variant="heritage"
  trend={{
    value: 5.3,
    isPositive: true
  }}
/>

{/* Gymnasium - Education Theme */}
<MetricCard
  title="Klassenraum-Temperatur"
  value={22.5}
  unit="°C"
  icon={<Thermometer className="w-6 h-6" />}
  color="green"
  variant="education"
/>

{/* Hallenbad - Pool Theme */}
<MetricCard
  title="Wasserqualität"
  value="Optimal"
  icon={<Droplets className="w-6 h-6" />}
  color="cyan"
  variant="pool"
  trend={{
    value: 0.8,
    isPositive: true,
    label: "pH-Wert stabil"
  }}
/>
```

#### Color Mapping
| Color | Hex Code | Use Case | Buildings |
|-------|----------|----------|-----------|
| `blue` | `#3b82f6` | Energy consumption | Rathaus, General |
| `green` | `#10b981` | Environmental metrics | All educational |
| `orange` | `#f59e0b` | Alerts, warnings | Werkrealschule |
| `red` | `#ef4444` | Critical alerts | Sporthallen |
| `purple` | `#8b5cf6` | Analytics | Realschule |
| `cyan` | `#06b6d4` | Water-related | Hallenbad |
| `emerald` | `#059669` | Sustainability | Grundschule |

---

### ChartCard - Chart Container Component

#### Overview
`ChartCard` bietet einen konsistenten Container für alle Chart-Komponenten mit Header, Loading-States und Actions.

#### Props Interface
```typescript
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  headerAction?: React.ReactNode;
  loading?: boolean;
}
```

#### Usage Examples

##### Basic Chart Container
```tsx
import { ChartCard } from '@/components/ui/ChartCard';
import { BarChart3 } from 'lucide-react';
import { LazyBarChart } from '@/components/charts/LazyBarChart';

<ChartCard
  title="Energieverbrauch heute"
  subtitle="Stündliche Werte"
  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
>
  <LazyBarChart data={energyData} />
</ChartCard>
```

##### Chart with Header Actions
```tsx
<ChartCard
  title="Wochentrend"
  subtitle="Energieproduktion vs. Verbrauch"
  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
  headerAction={
    <select className="text-sm border rounded px-2 py-1">
      <option value="week">Woche</option>
      <option value="month">Monat</option>
      <option value="year">Jahr</option>
    </select>
  }
  variant="glassmorphism"
>
  <LazyLineChart data={trendData} />
</ChartCard>
```

##### Loading State
```tsx
<ChartCard
  title="Live Sensor-Daten"
  loading={isLoading}
  variant="education"
>
  {/* Chart content rendered when loading is false */}
  <LazyLineChart data={sensorData} />
</ChartCard>
```

#### Building-Specific Chart Cards
```tsx
{/* Rathaus Analytics */}
<ChartCard
  title="Verwaltungsgebäude Effizienz"
  subtitle="Monatliche Auswertung"
  icon={<Building2 className="w-5 h-5 text-amber-600" />}
  variant="heritage"
>
  <LazyBarChart data={rathausData} theme="heritage" />
</ChartCard>

{/* Gymnasium Dashboard */}
<ChartCard
  title="Klassenraum-Auslastung"
  subtitle="Bildungsbereich Monitoring"
  icon={<Users className="w-5 h-5 text-green-600" />}
  variant="education"
>
  <LazyPieChart data={gymnasiumData} theme="education" />
</ChartCard>

{/* Hallenbad Monitoring */}
<ChartCard
  title="Wassertemperatur Verlauf"
  subtitle="Schwimmbad-System"
  icon={<Thermometer className="w-5 h-5 text-cyan-600" />}
  variant="pool"
>
  <LazyLineChart data={hallenbadData} theme="aqua" />
</ChartCard>
```

---

### AlertCard - Alert Notification Component

#### Overview
`AlertCard` zeigt verschiedene Arten von Benachrichtigungen, Alerts und Achievements mit kontextuellen Styling an.

#### Props Interface
```typescript
interface AlertCardProps {
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement' | 'heritage';
  title: string;
  message: string;
  children?: React.ReactNode;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  animate?: boolean;
}
```

#### Usage Examples

##### Basic Alerts
```tsx
import { AlertCard } from '@/components/ui/AlertCard';

{/* Success Alert */}
<AlertCard
  type="success"
  title="Energieziel erreicht"
  message="Das Rathaus hat sein monatliches Energiespar-Ziel erreicht."
/>

{/* Warning Alert */}
<AlertCard
  type="warning"
  title="Hoher Verbrauch erkannt"
  message="Ungewöhnlich hoher Energieverbrauch in der Sporthalle A."
  dismissible={true}
  onDismiss={() => handleDismiss()}
/>

{/* Error Alert */}
<AlertCard
  type="error"
  title="Sensor Ausfall"
  message="Temperatursensor im Gymnasium ist offline."
  variant="education"
/>
```

##### Achievement Alerts
```tsx
{/* Energy Efficiency Achievement */}
<AlertCard
  type="achievement"
  title="Effizienz-Meilenstein"
  message="Die Realschule hat eine Energieeffizienz von 95% erreicht!"
  variant="education"
>
  <div className="mt-3 flex space-x-2">
    <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded">
      Details anzeigen
    </button>
    <button className="px-3 py-1 border border-emerald-600 text-emerald-600 text-sm rounded">
      Teilen
    </button>
  </div>
</AlertCard>

{/* Heritage Achievement */}
<AlertCard
  type="heritage"
  title="Historische Effizienz"
  message="Das Rathaus erreicht die beste Energieeffizienz seit 1950!"
  variant="heritage"
/>
```

##### Building-Specific Alerts
```tsx
{/* Hallenbad System Alert */}
<AlertCard
  type="info"
  title="Wartungsfenster"
  message="Planmäßige Wartung der Poolpumpen von 14:00-16:00 Uhr."
  variant="pool"
>
  <div className="mt-3">
    <div className="bg-cyan-100 dark:bg-cyan-900/20 p-3 rounded">
      <p className="text-sm text-cyan-800 dark:text-cyan-200">
        <strong>Betroffene Systeme:</strong> Hauptpumpe, Filtration, Heizung
      </p>
    </div>
  </div>
</AlertCard>

{/* Sports Hall Critical Alert */}
<AlertCard
  type="error"
  title="Kritischer Stromausfall"
  message="Sporthalle A: Hauptstromversorgung unterbrochen."
  variant="sports"
  dismissible={false}
>
  <div className="mt-3 flex space-x-2">
    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded">
      Techniker benachrichtigen
    </button>
    <button className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded">
      Backup aktivieren
    </button>
  </div>
</AlertCard>
```

#### Alert Type Styling
| Type | Icon | Color Scheme | Use Case |
|------|------|--------------|----------|
| `success` | ✅ CheckCircle | Green | Positive outcomes, goals achieved |
| `warning` | ⚠️ AlertTriangle | Yellow | Attention needed, non-critical |
| `error` | ❌ XCircle | Red | Critical issues, failures |
| `info` | ℹ️ Info | Blue | General information, updates |
| `achievement` | 🏆 Award | Emerald | Milestones, achievements |
| `heritage` | 👑 Crown | Amber | Rathaus-specific highlights |

---

## 📊 Chart Components

### LazyBarChart - Bar Chart Component

#### Overview
Lazy-loaded bar chart component mit Recharts integration und CityPulse themes.

#### Usage Examples
```tsx
import { LazyBarChart } from '@/components/charts/LazyBarChart';

<LazyBarChart
  data={[
    { name: 'Jan', verbrauch: 1200, produktion: 800 },
    { name: 'Feb', verbrauch: 1100, produktion: 900 },
    { name: 'Mär', verbrauch: 1300, produktion: 1100 }
  ]}
  xKey="name"
  bars={[
    { key: 'verbrauch', color: '#ef4444', name: 'Verbrauch' },
    { key: 'produktion', color: '#10b981', name: 'Produktion' }
  ]}
  height={300}
/>
```

### LazyLineChart - Line Chart Component

#### Usage Examples
```tsx
import { LazyLineChart } from '@/components/charts/LazyLineChart';

<LazyLineChart
  data={energyTrendData}
  lines={[
    { key: 'temperature', color: '#f59e0b', name: 'Temperatur' },
    { key: 'humidity', color: '#06b6d4', name: 'Luftfeuchtigkeit' }
  ]}
  xKey="timestamp"
  height={250}
/>
```

### LazyPieChart - Pie Chart Component

#### Usage Examples
```tsx
import { LazyPieChart } from '@/components/charts/LazyPieChart';

<LazyPieChart
  data={[
    { name: 'Heizung', value: 45, color: '#ef4444' },
    { name: 'Beleuchtung', value: 30, color: '#f59e0b' },
    { name: 'IT-Systeme', value: 25, color: '#10b981' }
  ]}
  height={300}
  showLegend={true}
/>
```

---

## 🏗️ Layout Components

### Layout - Main Application Layout

#### Overview
Das Haupt-Layout-Component für authentifizierte Benutzer mit Navigation, Header und Content-Bereich.

#### Usage
```tsx
import { Layout } from '@/components/layout/Layout';

<Layout>
  <YourPageContent />
</Layout>
```

### Header - Navigation Header

#### Overview
Hauptnavigation mit User-Menu, Theme-Toggle und Connection-Status.

#### Features
- **User Authentication Status**
- **Dark/Light Mode Toggle**
- **WebSocket Connection Indicator**
- **Responsive Navigation Menu**
- **Role-based Menu Items**

### PublicHeader - Public Page Header

#### Overview
Vereinfachter Header für öffentliche Seiten ohne Authentifizierung.

---

## 🛠️ Development Components

### MockDataToggle - Development Tool

#### Overview
Development-only component zum Umschalten zwischen Mock- und Real-API-Services.

#### Usage
```tsx
import { MockDataToggle } from '@/components/dev/MockDataToggle';

// Only rendered in development
{import.meta.env.DEV && <MockDataToggle />}
```

#### Features
- **Live API Mode Switching**
- **Mock Service Configuration**
- **Network Simulation Controls**
- **Test Alert Generation**

---

## 🎨 Component Patterns

### Compound Components Pattern

#### ModernCard with Compound Structure
```tsx
// Future enhancement - compound component pattern
<ModernCard variant="glassmorphism">
  <ModernCard.Header>
    <ModernCard.Title>Energy Metrics</ModernCard.Title>
    <ModernCard.Actions>
      <Button variant="ghost">⋯</Button>
    </ModernCard.Actions>
  </ModernCard.Header>
  
  <ModernCard.Content>
    <MetricCard {...props} />
  </ModernCard.Content>
  
  <ModernCard.Footer>
    <span className="text-sm text-gray-500">
      Last updated: 2 minutes ago
    </span>
  </ModernCard.Footer>
</ModernCard>
```

### Render Props Pattern

#### ChartCard with Data Fetching
```tsx
<ChartCard
  title="Real-time Data"
  render={({ loading, data, error }) => (
    loading ? <LoadingSpinner /> :
    error ? <ErrorDisplay error={error} /> :
    <LazyLineChart data={data} />
  )}
/>
```

### Higher-Order Components

#### withBuilding HOC
```tsx
const withBuildingTheme = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const buildingId = useBuildingContext();
    const variant = getBuildingVariant(buildingId);
    
    return <WrappedComponent {...props} variant={variant} />;
  };
};

// Usage
const ThemedMetricCard = withBuildingTheme(MetricCard);
```

---

## 🎯 Styling Guidelines

### CSS Custom Properties

#### Building Theme Variables
```css
:root {
  /* Rathaus Theme */
  --rathaus-primary: #3b82f6;
  --rathaus-secondary: #1e40af;
  --rathaus-accent: #60a5fa;
  
  /* Educational Theme */
  --education-primary: #10b981;
  --education-secondary: #047857;
  --education-accent: #34d399;
  
  /* Sports Theme */
  --sports-primary: #ef4444;
  --sports-secondary: #dc2626;
  --sports-accent: #f87171;
  
  /* Pool Theme */
  --pool-primary: #06b6d4;
  --pool-secondary: #0891b2;
  --pool-accent: #22d3ee;
}
```

#### Glassmorphism Variables
```css
:root {
  --glass-bg-light: rgba(255, 255, 255, 0.05);
  --glass-bg-medium: rgba(255, 255, 255, 0.08);
  --glass-bg-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --glass-backdrop: blur(12px);
}
```

### Tailwind CSS Classes

#### Core Component Classes
```css
/* ModernCard Base */
.modern-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300;
}

.modern-card-glassmorphism {
  @apply bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl;
}

/* MetricCard Specific */
.metric-card {
  @apply transform hover:scale-[1.02] transition-transform duration-200;
}

.metric-card-value {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.metric-card-trend-positive {
  @apply text-green-500;
}

.metric-card-trend-negative {
  @apply text-red-500;
}
```

#### Animation Classes
```css
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 📚 Best Practices

### Component Development

#### 1. TypeScript First
```typescript
// Always define comprehensive prop interfaces
interface ComponentProps {
  required: string;
  optional?: boolean;
  callback?: (data: string) => void;
  children?: React.ReactNode;
}

// Use generic types for flexible components
interface DataCardProps<T> {
  data: T;
  render: (item: T) => React.ReactNode;
}
```

#### 2. Performance Optimization
```tsx
// Use React.memo for expensive components
export const MetricCard = React.memo<MetricCardProps>(({ 
  title, 
  value, 
  ...props 
}) => {
  // Component implementation
});

// Memoize expensive calculations
const formattedValue = useMemo(() => {
  return formatNumber(value);
}, [value]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  onAction?.(id);
}, [onAction, id]);
```

#### 3. Accessibility Guidelines
```tsx
// Always include proper ARIA attributes
<button
  aria-label="Dismiss alert"
  aria-describedby="alert-description"
  onClick={onDismiss}
>
  <XCircle className="w-4 h-4" />
</button>

// Use semantic HTML elements
<main role="main">
  <section aria-labelledby="metrics-heading">
    <h2 id="metrics-heading">Energy Metrics</h2>
    <MetricCard {...props} />
  </section>
</main>
```

#### 4. Error Handling
```tsx
// Use error boundaries for robust components
export const ChartCard: React.FC<ChartCardProps> = ({ children, ...props }) => {
  return (
    <ErrorBoundary fallback={<ChartErrorFallback />}>
      <ModernCard {...props}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </ModernCard>
    </ErrorBoundary>
  );
};
```

### Testing Best Practices

#### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 123.45,
    unit: 'kWh',
    icon: <TestIcon />
  };

  it('displays metric value correctly', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('123.45')).toBeInTheDocument();
    expect(screen.getByText('kWh')).toBeInTheDocument();
  });

  it('shows trend when provided', () => {
    const trend = { value: 12.5, isPositive: true };
    render(<MetricCard {...defaultProps} trend={trend} />);
    
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });
});
```

### Component Documentation

#### JSDoc Comments
```tsx
/**
 * MetricCard displays a metric value with optional trend information
 * and building-specific theming.
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   title="Energy Consumption"
 *   value={1245.6}
 *   unit="kWh"
 *   icon={<Zap />}
 *   trend={{ value: 12.5, isPositive: true }}
 *   variant="glassmorphism"
 * />
 * ```
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  // ... rest of props
}) => {
  // Component implementation
};
```

### Performance Guidelines

#### Bundle Size Optimization
```tsx
// Use dynamic imports for heavy components
const LazyBarChart = lazy(() => import('./LazyBarChart'));

// Implement code splitting at component level
const ChartComponents = {
  bar: lazy(() => import('./BarChart')),
  line: lazy(() => import('./LineChart')),
  pie: lazy(() => import('./PieChart'))
};
```

#### Memory Management
```tsx
// Clean up resources in useEffect
useEffect(() => {
  const timer = setInterval(updateMetrics, 5000);
  
  return () => {
    clearInterval(timer);
  };
}, []);

// Avoid creating objects in render
const chartConfig = useMemo(() => ({
  color: getThemeColor(variant),
  animation: true
}), [variant]);
```

---

## 🔧 Development Tools

### Storybook Integration

#### Component Stories
```tsx
// MetricCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';
import { Zap } from 'lucide-react';

const meta: Meta<typeof MetricCard> = {
  title: 'UI/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'orange', 'red', 'purple', 'cyan', 'emerald'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Energy Consumption',
    value: 1245.6,
    unit: 'kWh',
    icon: <Zap className="w-6 h-6" />,
    color: 'blue',
  },
};

export const WithTrend: Story = {
  args: {
    ...Default.args,
    trend: {
      value: 12.5,
      isPositive: true,
      label: 'vs. last month'
    },
  },
};
```

### Design Tokens

#### Building Theme Tokens
```json
{
  "color": {
    "building": {
      "rathaus": {
        "primary": "#3b82f6",
        "secondary": "#1e40af",
        "accent": "#60a5fa"
      },
      "education": {
        "primary": "#10b981",
        "secondary": "#047857", 
        "accent": "#34d399"
      },
      "sports": {
        "primary": "#ef4444",
        "secondary": "#dc2626",
        "accent": "#f87171"
      },
      "pool": {
        "primary": "#06b6d4",
        "secondary": "#0891b2",
        "accent": "#22d3ee"
      }
    }
  }
}
```

---

## 🚀 Future Enhancements

### Planned Component Additions

#### Advanced Chart Components
- **HeatmapChart** - Building floor plan overlays
- **GaugeChart** - Real-time meter displays
- **TreemapChart** - Energy distribution visualization
- **ScatterChart** - Correlation analysis

#### Interactive Components
- **BuildingSelector** - Interactive building picker
- **TimeRangePicker** - Advanced date/time selection
- **FilterPanel** - Multi-criteria filtering
- **ExportModal** - Data export options

#### Visualization Enhancements
- **3D Building Models** - Three.js integration
- **AR Dashboard Overlay** - Augmented reality views
- **VR Analytics Room** - Virtual reality analytics

### Component API Evolution

#### Version 2.0 Planned Features
```typescript
// Enhanced prop interfaces
interface MetricCardPropsV2 extends MetricCardProps {
  // Real-time data binding
  realTimeData?: WebSocketDataStream;
  
  // Advanced interactions
  onClick?: (metric: MetricData) => void;
  onHover?: (details: MetricDetails) => void;
  
  // Animation controls
  animationType?: 'fade' | 'slide' | 'bounce' | 'scale';
  
  // Accessibility enhancements
  announceChanges?: boolean;
  voiceControl?: boolean;
}
```

---

**Component Guide** - Complete reference for CityPulse UI components

*Built for sustainable urban energy management interfaces*