# Layout Components - Sidebar Navigation

## Übersicht

Diese Komponenten implementieren eine vollständige Sidebar-Navigation basierend auf dem CityPulse Design, portiert für das Energy Management MVP.

## Komponenten

### 1. Sidebar.tsx
**Hauptsidebar für Desktop-Ansicht**
- ✅ **Collapsible Design**: Klappbare Sidebar mit Zustandspersistierung
- ✅ **Role-based Access**: Benutzerrollen-basierte Navigation
- ✅ **Active State Highlighting**: Aktuelle Route wird hervorgehoben
- ✅ **Categorized Navigation**: Gruppierte Navigation (Main, Admin, Gebäude)
- ✅ **Responsive Icons**: Lucide Icons statt Heroicons
- ✅ **Smooth Transitions**: Animierte Übergänge

**Features:**
```typescript
interface SidebarProps {
  isCollapsed?: boolean;          // Sidebar-Status
  onToggleCollapse?: () => void;  // Toggle-Handler
}
```

**Navigation Sections:**
- **Main Navigation**: Dashboard, Energiefluss, Hechingen, Alerts
- **Analytics**: Analytics, Optimierung, Budget (manager+)
- **Admin Section**: Geräte, Benutzer, Admin (admin only)
- **Buildings**: Expandable/Collapsible Gebäude-Liste
- **Maintenance**: Wartung (admin/gebaeudemanager)

### 2. MobileSidebar.tsx
**Mobile Overlay-Sidebar**
- ✅ **Full-Screen Overlay**: Modal-ähnliches Verhalten
- ✅ **Touch-Friendly**: Große Touch-Targets
- ✅ **Keyboard Navigation**: ESC-Taste zum Schließen
- ✅ **Body Scroll Lock**: Verhindert Hintergrund-Scrolling
- ✅ **Smooth Animations**: CSS-Transitions ohne externe Bibliotheken

**Features:**
```typescript
interface MobileSidebarProps {
  isOpen: boolean;      // Sichtbarkeitsstatus
  onClose: () => void;  // Schließen-Handler
}
```

### 3. Layout.tsx (Updated)
**Hauptlayout mit Sidebar-Integration**
- ✅ **Responsive Design**: Desktop/Mobile automatisch
- ✅ **State Management**: localStorage-Persistierung
- ✅ **Conditional Rendering**: Public vs. Authenticated Layouts

**Features:**
- Desktop: Kollapsible Sidebar
- Mobile: Overlay-Sidebar mit Header-Button
- State-Persistierung für Sidebar-Zustand
- Automatische Responsive-Umschaltung

### 4. Header.tsx (Updated)
**Header mit Mobile-Menu-Button**
- ✅ **Mobile Menu Button**: Burger-Menu für mobile Geräte
- ✅ **Responsive Logo**: Kompakte Darstellung auf kleinen Screens
- ✅ **Integration**: onMobileMenuToggle Prop

## Verwendung

### Basic Setup
```tsx
import Layout from '@/components/layout/Layout';

function App() {
  return (
    <Layout>
      <YourPageContent />
    </Layout>
  );
}
```

### Mit Custom Sidebar
```tsx
import Sidebar from '@/components/layout/Sidebar';

function CustomLayout() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex">
      <Sidebar 
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1">
        {/* Content */}
      </main>
    </div>
  );
}
```

## Migration von CityPulse

### Änderungen
1. **Icons**: Heroicons → Lucide React Icons
2. **Router**: Next.js Router → React Router DOM
3. **Links**: `<Link href="">` → `<Link to="">`
4. **Hooks**: `usePathname()` → `useLocation()`
5. **Auth**: Next.js Auth → Zustand Auth Store

### Icon-Mapping
```typescript
// CityPulse (Heroicons)
import { HomeIcon } from '@heroicons/react/24/outline';

// Energy MVP (Lucide)
import { Home } from 'lucide-react';
```

### Navigation-Routen
```typescript
// Angepasst für Energy MVP
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Energiefluss', href: '/energy-flow', icon: Zap },  // Neu
  { name: 'Hechingen', href: '/hechingen', icon: Building2 }, // Angepasst
  // ...
];
```

## Styling

### Tailwind Classes
```css
/* Hauptcontainer */
.sidebar-container {
  @apply flex flex-col bg-white border-r border-gray-200 transition-all duration-300;
}

/* Active State */
.nav-item-active {
  @apply bg-blue-100 text-blue-900 border-r-2 border-blue-500;
}

/* Hover State */
.nav-item-hover {
  @apply text-gray-600 hover:bg-gray-50 hover:text-gray-900;
}
```

### Responsive Breakpoints
- **Desktop**: `md:block` (768px+)
- **Mobile**: `md:hidden` (<768px)
- **Collapse Width**: `w-64` → `w-16`

## Benutzerrollen & Berechtigungen

### Role-based Navigation
```typescript
// Beispiel: Analytics nur für Manager+
const hasManagerAccess = user?.role === 'admin' || 
                        user?.role === 'manager' || 
                        user?.role === 'buergermeister';

// Filter Navigation
const filteredNavigation = navigation.filter(item => {
  if (item.requiresAdmin && !hasAdminAccess) return false;
  if (item.requiresManager && !hasManagerAccess) return false;
  return true;
});
```

### Verfügbare Rollen
- **admin**: Vollzugriff auf alle Features
- **manager**: Erweiterte Analytics und Reports
- **buergermeister**: Analytics und Budget
- **gebaeudemanager**: Gebäude-spezifische Features
- **user**: Basic Dashboard und Gebäude-Ansicht

## Performance

### Optimierungen
- ✅ **Lazy Icons**: Icons nur bei Bedarf geladen
- ✅ **Memoized Navigation**: React.memo für Navigation Items
- ✅ **localStorage Caching**: Sidebar-State wird persistiert
- ✅ **CSS Transitions**: Hardware-beschleunigte Animationen
- ✅ **Conditional Rendering**: Mobile/Desktop Components

### Bundle Size
- **Lucide Icons**: Tree-shakeable, nur verwendete Icons
- **CSS**: Tailwind purging entfernt ungenutzte Styles
- **Components**: Modularer Aufbau für Code-Splitting

## Testing

### Unit Tests
```bash
npm test -- components/layout/Sidebar
npm test -- components/layout/MobileSidebar  
npm test -- components/layout/Layout
```

### Integration Tests
```bash
# Navigation funktionalität
npm test -- navigation.integration.test

# Responsive behavior
npm test -- responsive.integration.test
```

## Troubleshooting

### Häufige Probleme

1. **Icons werden nicht angezeigt**
   ```bash
   npm install lucide-react
   ```

2. **Sidebar kollabiert nicht**
   ```typescript
   // localStorage prüfen
   localStorage.getItem('sidebarCollapsed')
   ```

3. **Mobile Sidebar öffnet nicht**
   ```typescript
   // Z-index prüfen
   className="fixed inset-0 z-40"
   ```

4. **Navigation Items fehlen**
   ```typescript
   // User-Rolle prüfen
   console.log(user?.role);
   ```

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+

## Deployment

### Build Optimization
```bash
# Production build
npm run build

# Bundle analysis
npm run build:analyze
```

### Environment Variables
Keine speziellen Environment Variables erforderlich.

---

**Erstellt:** August 2025  
**Version:** 1.0.0  
**Autor:** Claude Code  
**Basis:** CityPulse Hechingen Frontend