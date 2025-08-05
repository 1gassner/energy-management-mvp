# Hechingen Glass 3.0 Design System

## 🎨 Übersicht

Das **Hechingen Glass 3.0 Design System** ist ein innovatives, glassmorphism-basiertes Design-Framework, das speziell für das CityPulse Hechingen Portal entwickelt wurde. Es kombiniert moderne Web-Design-Trends mit nachhaltigen, eco-freundlichen Designprinzipien und bietet eine optimale User Experience auf allen Geräten.

## 🌟 Design-Philosophie

### Kernprinzipien

1. **Nachhaltigkeit First** - Eco-freundliche Farbpalette und energiesparende Animationen
2. **Mobile-First** - Touch-optimierte Interfaces für alle Bildschirmgrößen
3. **Glassmorphism** - Moderne, transparente Oberflächen mit Tiefe
4. **Accessibility** - WCAG 2.1 AA konforme Kontraste und Navigation
5. **Performance** - GPU-beschleunigte Animationen und optimierte Rendering

### Designsprache

- **Transparent & Leicht**: Glasmorphism-Effekte schaffen visuelle Tiefe
- **Natürlich & Organisch**: Eco-Farbpalette inspiriert von der Natur
- **Modern & Zukunftsorientiert**: Cutting-edge Web-Design-Trends
- **Funktional & Benutzerfreundlich**: Intuitive Navigation und klare Hierarchien

---

## 🌈 Color System

### Primary Color Palette

#### Building-Specific Colors

##### Rathaus (Administrative Blue)
```css
:root {
  --rathaus-primary: #3b82f6;      /* Primary Blue */
  --rathaus-secondary: #1e40af;    /* Dark Blue */
  --rathaus-accent: #60a5fa;       /* Light Blue */
  --rathaus-background: #eff6ff;   /* Very Light Blue */
  --rathaus-text: #1e3a8a;         /* Deep Blue */
}
```

##### Gymnasium (Educational Green)
```css
:root {
  --gymnasium-primary: #10b981;    /* Emerald */
  --gymnasium-secondary: #047857;  /* Dark Emerald */
  --gymnasium-accent: #34d399;     /* Light Emerald */
  --gymnasium-background: #ecfdf5; /* Very Light Green */
  --gymnasium-text: #064e3b;       /* Deep Green */
}
```

##### Realschule (Knowledge Purple)
```css
:root {
  --realschule-primary: #8b5cf6;   /* Violet */
  --realschule-secondary: #7c3aed; /* Dark Violet */
  --realschule-accent: #a78bfa;    /* Light Violet */
  --realschule-background: #f5f3ff; /* Very Light Purple */
  --realschule-text: #5b21b6;      /* Deep Purple */
}
```

##### Werkrealschule (Practical Orange)
```css
:root {
  --werkrealschule-primary: #f59e0b;   /* Amber */
  --werkrealschule-secondary: #d97706; /* Dark Amber */
  --werkrealschule-accent: #fbbf24;    /* Light Amber */
  --werkrealschule-background: #fffbeb; /* Very Light Yellow */
  --werkrealschule-text: #92400e;      /* Deep Orange */
}
```

##### Grundschule (Playful Pink)
```css
:root {
  --grundschule-primary: #ec4899;    /* Pink */
  --grundschule-secondary: #db2777;  /* Dark Pink */
  --grundschule-accent: #f472b6;     /* Light Pink */
  --grundschule-background: #fdf2f8; /* Very Light Pink */
  --grundschule-text: #9d174d;       /* Deep Pink */
}
```

##### Sporthallen (Energy Red)
```css
:root {
  --sporthallen-primary: #ef4444;    /* Red */
  --sporthallen-secondary: #dc2626;  /* Dark Red */
  --sporthallen-accent: #f87171;     /* Light Red */
  --sporthallen-background: #fef2f2; /* Very Light Red */
  --sporthallen-text: #991b1b;       /* Deep Red */
}
```

##### Hallenbad (Aqua Cyan)
```css
:root {
  --hallenbad-primary: #06b6d4;      /* Cyan */
  --hallenbad-secondary: #0891b2;    /* Dark Cyan */
  --hallenbad-accent: #22d3ee;       /* Light Cyan */
  --hallenbad-background: #ecfeff;   /* Very Light Cyan */
  --hallenbad-text: #164e63;         /* Deep Cyan */
}
```

### Neutral Colors

#### Gray Scale
```css
:root {
  /* Light Mode Grays */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Dark Mode Grays */
  --gray-dark-50: #18181b;
  --gray-dark-100: #27272a;
  --gray-dark-200: #3f3f46;
  --gray-dark-300: #52525b;
  --gray-dark-400: #71717a;
  --gray-dark-500: #a1a1aa;
  --gray-dark-600: #d4d4d8;
  --gray-dark-700: #e4e4e7;
  --gray-dark-800: #f4f4f5;
  --gray-dark-900: #fafafa;
}
```

### Semantic Colors

#### Status Colors
```css
:root {
  /* Success */
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-600: #059669;
  --success-900: #064e3b;

  /* Warning */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-900: #92400e;

  /* Error */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-900: #991b1b;

  /* Info */
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-600: #2563eb;
  --info-900: #1e3a8a;
}
```

### Color Usage Guidelines

#### Color Contrast Ratios (WCAG 2.1 AA)
| Use Case | Minimum Ratio | Example |
|----------|---------------|---------|
| Normal Text | 4.5:1 | `#374151` on `#ffffff` |
| Large Text | 3:1 | `#6b7280` on `#ffffff` |
| UI Components | 3:1 | `#3b82f6` on `#ffffff` |
| Focus Indicators | 3:1 | `#2563eb` outline |

#### Color Application
```css
/* Primary Actions */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

/* Building-Specific Accents */
.building-rathaus {
  --building-primary: var(--rathaus-primary);
  --building-accent: var(--rathaus-accent);
}

/* Status Indicators */
.status-online { color: var(--success-500); }
.status-warning { color: var(--warning-500); }
.status-error { color: var(--error-500); }
```

---

## 📝 Typography

### Font Stack

#### Primary Font - Inter
```css
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Font Scale

#### Font Sizes
```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
}
```

#### Font Weights
```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

#### Line Heights
```css
:root {
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Typography Scale

#### Headings
```css
/* H1 - Page Titles */
.text-h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

/* H2 - Section Titles */
.text-h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

/* H3 - Subsection Titles */
.text-h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* H4 - Card Titles */
.text-h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
}
```

#### Body Text
```css
/* Body Large */
.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Body Regular */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Body Small */
.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}
```

#### Metric Text
```css
/* Large Metrics */
.text-metric-xl {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}

/* Medium Metrics */
.text-metric-lg {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}

/* Small Metrics */
.text-metric {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
}
```

---

## 📐 Spacing & Layout

### Spacing Scale

#### Base Spacing Unit
```css
:root {
  --space-px: 1px;
  --space-0: 0px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-28: 7rem;       /* 112px */
  --space-32: 8rem;       /* 128px */
}
```

### Layout Components

#### Container Sizes
```css
:root {
  --container-sm: 640px;    /* Small screens */
  --container-md: 768px;    /* Medium screens */
  --container-lg: 1024px;   /* Large screens */
  --container-xl: 1280px;   /* Extra large screens */
  --container-2xl: 1536px;  /* 2X large screens */
}

.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: var(--container-sm); }
}

@media (min-width: 768px) {
  .container { max-width: var(--container-md); }
}

@media (min-width: 1024px) {
  .container { max-width: var(--container-lg); }
}

@media (min-width: 1280px) {
  .container { max-width: var(--container-xl); }
}

@media (min-width: 1536px) {
  .container { max-width: var(--container-2xl); }
}
```

#### Grid System
```css
/* Grid Templates */
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.grid-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.grid-building-overview {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: var(--space-8);
}

@media (max-width: 768px) {
  .grid-building-overview {
    grid-template-columns: 1fr;
  }
}
```

---

## 🧩 Components

### Card Components

#### Base Card Styling
```css
.modern-card {
  background: white;
  border-radius: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--gray-200);
  padding: var(--space-6);
  transition: all 0.2s ease-in-out;
}

.modern-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

/* Dark mode */
.dark .modern-card {
  background: var(--gray-dark-100);
  border-color: var(--gray-dark-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

#### Component Structure
```css
.modern-card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-100);
}

.modern-card-content {
  margin-bottom: var(--space-4);
}

.modern-card-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-100);
  font-size: var(--text-sm);
  color: var(--gray-500);
}
```

### Button Components

#### Button Variants
```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--space-2);
  font-weight: var(--font-medium);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--space-2);
  font-weight: var(--font-medium);
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--gray-600);
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--space-2);
  font-weight: var(--font-medium);
  transition: all 0.2s ease-in-out;
}

.btn-ghost:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}
```

---

## ✨ Glassmorphism

### Glass Effect Implementation

#### Base Glass Styles
```css
:root {
  /* Glassmorphism Variables */
  --glass-bg-light: rgba(255, 255, 255, 0.05);
  --glass-bg-medium: rgba(255, 255, 255, 0.08);
  --glass-bg-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --glass-backdrop: blur(12px);
}

.glassmorphism {
  background: var(--glass-bg-medium);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--space-4);
  box-shadow: var(--glass-shadow);
}
```

#### Glass Depth Levels
```css
/* Light Glass - Subtle effect */
.glass-light {
  background: var(--glass-bg-light);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Medium Glass - Standard effect */
.glass-medium {
  background: var(--glass-bg-medium);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}

/* Strong Glass - Prominent effect */
.glass-strong {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

#### Building-Specific Glass
```css
/* Rathaus Glass */
.glass-rathaus {
  background: rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
}

/* Education Glass */
.glass-education {
  background: rgba(16, 185, 129, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.1);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
}

/* Sports Glass */
.glass-sports {
  background: rgba(239, 68, 68, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(239, 68, 68, 0.1);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
}

/* Pool Glass */
.glass-pool {
  background: rgba(6, 182, 212, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.1);
  box-shadow: 0 8px 32px rgba(6, 182, 212, 0.1);
}
```

### Glass Component Examples

#### Glass Card
```css
.glass-card {
  background: var(--glass-bg-medium);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--space-4);
  padding: var(--space-6);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease-in-out;
}

.glass-card:hover {
  background: var(--glass-bg-strong);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

#### Glass Navigation
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

---

## 🎬 Animations

### Animation System

#### Transition Variables
```css
:root {
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.2s ease-in-out;
  --transition-slow: 0.3s ease-in-out;
  --transition-bounce: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### Keyframe Animations
```css
/* Fade In Up */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In Right */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Bounce */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

#### Animation Classes
```css
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}
```

### Hover Effects

#### Interactive Hover States
```css
.hover-lift {
  transition: transform var(--transition-normal);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform var(--transition-normal);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--transition-normal);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### Micro-Interactions

#### Button Interactions
```css
.btn-interactive {
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.btn-interactive::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-interactive:hover::before {
  left: 100%;
}
```

---

## 🏢 Building Themes

### Theme Implementation

#### Theme Structure
```css
/* Base theme variables */
.building-theme {
  --theme-primary: var(--building-primary);
  --theme-secondary: var(--building-secondary);
  --theme-accent: var(--building-accent);
  --theme-background: var(--building-background);
  --theme-text: var(--building-text);
}
```

#### Individual Building Themes

##### Rathaus Theme
```css
.building-rathaus {
  --building-primary: var(--rathaus-primary);
  --building-secondary: var(--rathaus-secondary);
  --building-accent: var(--rathaus-accent);
  --building-background: var(--rathaus-background);
  --building-text: var(--rathaus-text);
}

.building-rathaus .metric-card {
  border-left: 4px solid var(--building-primary);
}

.building-rathaus .chart-accent {
  color: var(--building-accent);
}
```

##### Education Theme (Gymnasium, Realschule, Werkrealschule, Grundschule)
```css
.building-education {
  --building-primary: var(--gymnasium-primary);
  --building-secondary: var(--gymnasium-secondary);
  --building-accent: var(--gymnasium-accent);
  --building-background: var(--gymnasium-background);
  --building-text: var(--gymnasium-text);
}

.building-education .progress-bar {
  background: linear-gradient(90deg, var(--building-primary), var(--building-accent));
}
```

##### Sports Theme (Sporthallen)
```css
.building-sports {
  --building-primary: var(--sporthallen-primary);
  --building-secondary: var(--sporthallen-secondary);
  --building-accent: var(--sporthallen-accent);
  --building-background: var(--sporthallen-background);
  --building-text: var(--sporthallen-text);
}

.building-sports .alert-high {
  background: linear-gradient(135deg, var(--building-primary), var(--building-accent));
}
```

##### Pool Theme (Hallenbad)
```css
.building-pool {
  --building-primary: var(--hallenbad-primary);
  --building-secondary: var(--hallenbad-secondary);
  --building-accent: var(--hallenbad-accent);
  --building-background: var(--hallenbad-background);
  --building-text: var(--hallenbad-text);
}

.building-pool .water-effect {
  background: linear-gradient(45deg, 
    var(--building-primary) 0%, 
    var(--building-accent) 50%, 
    var(--building-primary) 100%);
  background-size: 200% 200%;
  animation: water-flow 3s ease-in-out infinite;
}

@keyframes water-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 🌙 Dark Mode

### Dark Mode Implementation

#### Dark Mode Variables
```css
:root {
  /* Light mode (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-primary: #e5e7eb;
}

.dark {
  /* Dark mode overrides */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-primary: #374151;
  
  /* Glass effects for dark mode */
  --glass-bg-light: rgba(0, 0, 0, 0.1);
  --glass-bg-medium: rgba(0, 0, 0, 0.2);
  --glass-bg-strong: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

#### Dark Mode Glass Components
```css
.dark .glassmorphism {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dark .glass-card:hover {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

#### Theme Toggle Component
```css
.theme-toggle {
  width: 48px;
  height: 24px;
  background: var(--gray-300);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-normal);
}

.dark .theme-toggle {
  background: var(--color-primary);
}

.dark .theme-toggle::before {
  transform: translateX(24px);
}
```

---

## ♿ Accessibility

### Accessibility Standards

#### WCAG 2.1 AA Compliance
- **Color Contrast:** Minimum 4.5:1 for normal text
- **Focus Indicators:** Visible focus states for all interactive elements
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** Proper ARIA labels and semantic HTML

#### Focus Management
```css
/* Focus ring for interactive elements */
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline var(--transition-fast);
}

.focus-ring:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.focus-ring:focus:not(:focus-visible) {
  outline: none;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 1000;
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: 6px;
}
```

#### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --color-primary: #0000ff;
    --color-secondary: #000000;
    --bg-primary: #ffffff;
    --text-primary: #000000;
    --border-primary: #000000;
  }
  
  .glassmorphism {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #000000;
    backdrop-filter: none;
  }
}
```

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .glassmorphism {
    backdrop-filter: none;
  }
}
```

---

## 🛠️ Implementation Guidelines

### CSS Custom Properties Usage

#### Theming with CSS Variables
```css
/* Component using theme variables */
.metric-card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-left: 4px solid var(--theme-primary, var(--color-primary));
}

/* Fallback values */
.chart-container {
  background: var(--chart-bg, var(--bg-secondary));
  border-radius: var(--chart-radius, var(--space-3));
}
```

### Responsive Design Patterns

#### Mobile-First Approach
```css
/* Base styles (mobile) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

### Performance Optimization

#### GPU Acceleration
```css
.accelerated {
  will-change: transform;
  transform: translateZ(0);
}

.gpu-optimized {
  transform: translate3d(0, 0, 0);
}
```

#### Critical CSS
```css
/* Critical path styles */
.critical {
  /* Above-the-fold content styles */
  font-family: var(--font-family-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

**Design System** - Complete visual and interaction guidelines for CityPulse

*Built for consistency, accessibility, and modern user experiences*