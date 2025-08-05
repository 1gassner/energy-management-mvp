# CityPulse Hechingen - Deployment Guide

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-green.svg)
![Deployment](https://img.shields.io/badge/deployment-vercel-black.svg)

Ein umfassender Leitfaden für das Deployment des CityPulse Hechingen Energy Management Systems.

## 📋 Inhaltsverzeichnis

1. [Deployment-Übersicht](#-deployment-übersicht)
2. [Environment-Konfiguration](#-environment-konfiguration)
3. [Vercel Deployment](#-vercel-deployment)
4. [Alternative Deployment-Optionen](#-alternative-deployment-optionen)
5. [CI/CD Pipeline](#-cicd-pipeline)
6. [Environment Management](#-environment-management)
7. [Performance-Optimierung](#-performance-optimierung)
8. [Monitoring & Logging](#-monitoring--logging)
9. [Sicherheitskonfiguration](#-sicherheitskonfiguration)
10. [Troubleshooting](#-troubleshooting)

---

## 🚀 Deployment-Übersicht

CityPulse Hechingen ist als moderne Single Page Application (SPA) konzipiert und optimiert für verschiedene Deployment-Strategien. Das System unterstützt sowohl Mock- als auch Production-Modi für verschiedene Entwicklungsphasen.

### Deployment-Ziele

| Umgebung | URL | Zweck | Build-Konfiguration |
|----------|-----|-------|-------------------|
| **Development** | `http://localhost:5173` | Lokale Entwicklung | Mock-Daten, Hot Reload |
| **Staging** | `https://staging.citypulse-hechingen.de` | Testing & QA | Real APIs, Debug-Modus |
| **Production** | `https://citypulse-hechingen.de` | Live-System | Optimierter Build, Real APIs |

### Technische Anforderungen

- **Node.js**: Version 18.0 oder höher
- **npm**: Version 9.0 oder höher
- **Build Tool**: Vite 5.0+
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+
- **PWA Support**: Service Worker, Web App Manifest

---

## ⚙️ Environment-Konfiguration

### Environment-Dateien

Das System verwendet verschiedene Environment-Dateien für unterschiedliche Deployment-Szenarien:

```bash
├── .env.example          # Template für lokale Entwicklung
├── .env.local            # Lokale Entwicklung (nicht in Git)
├── .env.development      # Development-spezifische Einstellungen
├── .env.staging          # Staging-Environment
└── .env.production       # Production-Environment
```

### .env.example

```env
# ===========================================
# CityPulse Hechingen - Environment Template  
# ===========================================

# API Configuration
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws

# Service Configuration
VITE_USE_MOCK_DATA=false
VITE_MOCK_DELAY=500
VITE_MOCK_FAILURE_RATE=0
VITE_MOCK_SENSOR_COUNT=745

# Authentication
VITE_JWT_SECRET=your-jwt-secret-key
VITE_SESSION_TIMEOUT=3600000
VITE_REFRESH_TOKEN_INTERVAL=300000

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_OFFLINE_MODE=true

# Performance
VITE_CACHE_TTL=300000
VITE_REQUEST_TIMEOUT=10000
VITE_RETRY_ATTEMPTS=3

# Security
VITE_CSRF_TOKEN_HEADER=X-CSRF-Token
VITE_SECURE_COOKIES=true
VITE_SAME_SITE_COOKIES=strict

# Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
VITE_LOG_LEVEL=info

# PWA
VITE_PWA_NAME=CityPulse Hechingen
VITE_PWA_SHORT_NAME=CityPulse
VITE_PWA_DESCRIPTION=Smart City Energy Management
VITE_PWA_THEME_COLOR=#2563eb
VITE_PWA_BACKGROUND_COLOR=#0f172a

# Development
VITE_DEVTOOLS=false
VITE_SOURCE_MAPS=false
VITE_BUNDLE_ANALYZER=false
```

### Development Environment (.env.development)

```env
# Development-spezifische Konfiguration
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=300
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
VITE_DEVTOOLS=true
VITE_SOURCE_MAPS=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_HOT_RELOAD=true
```

### Production Environment (.env.production)

```env
# Production-optimierte Konfiguration
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws
VITE_DEVTOOLS=false
VITE_SOURCE_MAPS=false
VITE_LOG_LEVEL=error
VITE_SECURE_COOKIES=true
VITE_BUNDLE_ANALYZER=false
VITE_ENABLE_PWA=true
```

---

## ▲ Vercel Deployment

Vercel ist die empfohlene Deployment-Plattform für CityPulse Hechingen aufgrund der optimalen Integration mit Vite und den erweiterten Performance-Features.

### Automatisches Deployment

#### 1. Repository verbinden

```bash
# GitHub Repository mit Vercel verbinden
npx vercel --prod

# Oder über Vercel Dashboard:
# 1. Import Git Repository
# 2. citypulse-hechingen Repository auswählen
# 3. Framework Preset: Vite
# 4. Build Command: npm run build
# 5. Output Directory: dist
```

#### 2. Build-Konfiguration

**vercel.json**
```json
{
  "version": 2,
  "name": "citypulse-hechingen",
  "builds": [
    {
      "src": "package.json",  
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_BUILD_TARGET": "production"
  },
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "regions": ["fra1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, immutable, max-age=31536000"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.citypulse-hechingen.de/api/$1"
    }
  ]
}
```

#### 3. Environment Variables Setup

```bash
# Environment Variables über Vercel CLI setzen
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
vercel env add VITE_USE_MOCK_DATA production

# Oder über Vercel Dashboard:
# Project Settings > Environment Variables
```

#### 4. Deployment Commands

```bash
# Development Preview
vercel

# Production Deployment
vercel --prod

# Mit spezifischen Environment
vercel --prod --env VITE_API_URL=https://api.citypulse-hechingen.de/api
```

### Vercel-spezifische Optimierungen

#### Edge Functions

```typescript
// vercel/edge-functions/analytics.ts
export default async function handler(request: Request) {
  const url = new URL(request.url);
  
  // Custom Analytics für CityPulse
  if (url.pathname.startsWith('/track')) {
    const data = await request.json();
    
    // Process analytics data
    await processAnalytics(data);
    
    return new Response('OK', { status: 200 });
  }
  
  return new Response('Not Found', { status: 404 });
}

export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt für deutsche Nutzer
};
```

#### Build Optimierungen

```json
{
  "scripts": {
    "build:vercel": "npm run build && npm run generate:sitemap",
    "generate:sitemap": "node scripts/generate-sitemap.js",
    "analyze:bundle": "npm run build -- --analyze"
  }
}
```

---

## 🔄 Alternative Deployment-Optionen

### Netlify Deployment

#### 1. Netlify Konfiguration

**netlify.toml**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, immutable, max-age=31536000"
```

#### 2. Deployment Commands

```bash
# Installation der Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deployment
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

#### 1. S3 Bucket Setup

```bash
# AWS CLI Installation und Konfiguration
aws configure

# S3 Bucket erstellen
aws s3 mb s3://citypulse-hechingen --region eu-central-1

# Static Website Hosting aktivieren
aws s3 website s3://citypulse-hechingen --index-document index.html --error-document index.html
```

#### 2. CloudFront Distribution

```json
{
  "DistributionConfig": {
    "CallerReference": "citypulse-hechingen-2025",
    "Comment": "CityPulse Hechingen CDN",
    "DefaultRootObject": "index.html",
    "Origins": [
      {
        "Id": "S3-citypulse-hechingen",
        "DomainName": "citypulse-hechingen.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-citypulse-hechingen",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
  }
}
```

### Docker Deployment

#### 1. Dockerfile

```dockerfile
# Multi-stage build für optimale Performance
FROM node:18-alpine as builder

# Working directory
WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Source code kopieren
COPY . .

# Build ausführen
RUN npm run build

# Production image
FROM nginx:alpine

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Built assets kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Port exposieren
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy
        location /api/ {
            proxy_pass https://api.citypulse-hechingen.de/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### 3. Docker Commands

```bash
# Image bauen
docker build -t citypulse-hechingen .

# Container starten
docker run -d -p 80:80 --name citypulse citypulse-hechingen

# Docker Compose
docker-compose up -d
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Optional: Monitoring
  monitoring:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy CityPulse Hechingen

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  NPM_VERSION: '9'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run type checking
      run: npm run typecheck
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        environment: [staging, production]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js  
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets[format('VITE_API_URL_{0}', matrix.environment)] }}
        VITE_WS_URL: ${{ secrets[format('VITE_WS_URL_{0}', matrix.environment)] }}
        VITE_USE_MOCK_DATA: false
        
    - name: Run bundle analysis
      run: npm run build:analyze
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist-${{ matrix.environment }}
        path: dist/
        retention-days: 7

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist-staging
        
    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--env VITE_API_URL=${{ secrets.VITE_API_URL_STAGING }}'

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist-production
        
    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        uploadArtifacts: true
        temporaryPublicStorage: true
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run security audit
      run: npm audit --audit-level moderate
      
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Deployment Scripts

**scripts/deploy.sh**
```bash
#!/bin/bash

# CityPulse Hechingen Deployment Script
set -e

ENVIRONMENT=${1:-staging}
BUILD_MODE=${2:-production}

echo "🚀 Deploying CityPulse Hechingen to $ENVIRONMENT..."

# Environment validation
case $ENVIRONMENT in
  staging|production)
    echo "✅ Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
    ;;
esac

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test

# Type checking
echo "🔎 Running type checking..."
npm run typecheck

# Linting
echo "🧹 Running linter..."
npm run lint

# Build application
echo "🏗️ Building application..."
if [ "$ENVIRONMENT" = "production" ]; then
  npm run build
else
  npm run build:staging
fi

# Bundle analysis
echo "📊 Analyzing bundle size..."
npm run build:analyze

# Deploy based on environment
case $ENVIRONMENT in
  staging)
    echo "🚀 Deploying to staging..."
    vercel --env VITE_API_URL=$STAGING_API_URL
    ;;
  production)
    echo "🚀 Deploying to production..."
    vercel --prod
    ;;
esac

# Post-deployment checks
echo "✅ Running post-deployment checks..."

# Health check
HEALTH_URL=""
if [ "$ENVIRONMENT" = "production" ]; then
  HEALTH_URL="https://citypulse-hechingen.de"
else  
  HEALTH_URL="https://staging.citypulse-hechingen.de"
fi

echo "🏥 Health check: $HEALTH_URL"
curl -f "$HEALTH_URL" > /dev/null && echo "✅ Site is healthy" || echo "❌ Site health check failed"

# Lighthouse performance check
echo "⚡ Running Lighthouse performance check..."
npx lighthouse "$HEALTH_URL" --output=json --output-path=./lighthouse-report.json

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
```

---

## 🌍 Environment Management

### Multi-Environment Setup

```bash
# Development
npm run dev                 # Startet mit .env.development

# Staging Build
npm run build:staging       # Nutzt .env.staging

# Production Build  
npm run build:production    # Nutzt .env.production

# Custom Environment
NODE_ENV=custom npm run build  # Nutzt .env.custom
```

### Environment-spezifische Builds

**package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "build:staging": "vite build --mode staging",
    "build:development": "vite build --mode development",
    "build:analyze": "vite build --mode production && npx vite-bundle-analyzer dist",
    "preview": "vite preview",
    "preview:staging": "vite preview --mode staging"
  }
}
```

### Feature Flags

```typescript
// utils/featureFlags.ts
export const featureFlags = {
  enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableWebSockets: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  showDebugInfo: import.meta.env.MODE === 'development',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true'
};

// Verwendung in Komponenten
if (featureFlags.enablePWA) {
  // PWA-spezifische Features
}
```

---

## ⚡ Performance-Optimierung

### Build-Optimierungen

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Build-Optimierungen
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Chunk-Splitting für besseres Caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  },
  
  // Development-Optimierungen
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true
    }
  },
  
  // Pfad-Aliase
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  }
});
```

### PWA-Konfiguration

**vite-pwa.config.ts**
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.citypulse-hechingen\.de\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          cacheableResponse: {
            statuses: [200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets'
        }
      }
    ]
  },
  manifest: {
    name: 'CityPulse Hechingen',
    short_name: 'CityPulse',
    description: 'Smart City Energy Management System',
    theme_color: '#2563eb',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png', 
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
});
```

### Bundle-Analyse

```bash
# Bundle-Größe analysieren
npm run build:analyze

# Lighthouse CI für Performance-Monitoring
npm install -g @lhci/cli
lhci autorun --upload.target=filesystem --upload.outputDir=./lighthouse-reports
```

---

## 📊 Monitoring & Logging

### Performance Monitoring

**utils/performanceMonitor.ts**
```typescript
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  trackPageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      this.sendMetric('page_load_time', {
        page: pageName,
        duration: loadTime,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    this.sendMetric('api_call', {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    });
  }
  
  private sendMetric(type: string, data: any): void {
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      // Send to analytics service
      console.log(`[Performance] ${type}:`, data);
    }
  }
}
```

### Error Tracking

**utils/errorTracker.ts**
```typescript
export class ErrorTracker {
  static captureException(error: Error, context?: any): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context
    };
    
    // In production, send to error tracking service
    if (import.meta.env.NODE_ENV === 'production') {
      this.sendErrorToService(errorInfo);
    } else {
      console.error('[Error Tracker]', errorInfo);
    }
  }
  
  private static sendErrorToService(errorInfo: any): void {
    // Integration mit Sentry, LogRocket, etc.
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    }).catch(err => {
      console.error('Failed to send error to tracking service:', err);
    });
  }
}
```

### Health Checks

**public/health.json**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-08-05T14:30:00Z",
  "services": {
    "frontend": "healthy",
    "api_connectivity": "healthy",
    "websocket_connectivity": "healthy"
  }
}
```

**scripts/health-check.js**
```javascript
#!/usr/bin/env node

const https = require('https');

const HEALTH_URL = process.env.HEALTH_URL || 'https://citypulse-hechingen.de/health.json';

https.get(HEALTH_URL, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      
      if (health.status === 'healthy') {
        console.log('✅ Health check passed');
        process.exit(0);
      } else {
        console.error('❌ Health check failed:', health);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Invalid health response:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Health check request failed:', error);
  process.exit(1);
});
```

---

## 🔒 Sicherheitskonfiguration

### Content Security Policy

```typescript
// utils/security.ts
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Für Vite HMR in Development
    'https://vercel.live'
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'",
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:'
  ],
  'connect-src': [
    "'self'",
    'https://api.citypulse-hechingen.de',
    'wss://api.citypulse-hechingen.de'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};
```

### Security Headers

```typescript
// Security headers für verschiedene Deployment-Ziele
export const securityHeaders = {
  // Vercel
  vercel: [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains'
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(self), payment=()'
    }
  ]
};
```

### API Security

```typescript
// utils/apiSecurity.ts
export class APISecurityManager {
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000;
  
  static async secureApiCall<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };
    
    return this.retryWithBackoff(url, secureOptions);
  }
  
  private static async retryWithBackoff<T>(
    url: string, 
    options: RequestInit,
    attempt = 1
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401) {
          await this.handleUnauthorized();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => 
          setTimeout(resolve, this.RETRY_DELAY * attempt)
        );
        return this.retryWithBackoff(url, options, attempt + 1);
      }
      throw error;
    }
  }
  
  private static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  private static async handleUnauthorized(): Promise<void> {
    // Token refresh oder Redirect zu Login
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
}
```

---

## 🛠️ Troubleshooting

### Häufige Deployment-Probleme

#### Build Fehler

```bash
# Problem: Out of Memory während Build
ERROR: JavaScript heap out of memory

# Lösung: Node.js Memory Limit erhöhen
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

```bash
# Problem: TypeScript Fehler während Build
ERROR: Type checking failed

# Lösung: Type Check Skip (nur für Notfälle)
npm run build -- --no-typecheck

# Bessere Lösung: Fehler beheben
npm run typecheck
```

#### Environment Variables

```bash
# Problem: Environment Variables nicht verfügbar
console.log(process.env.VITE_API_URL); // undefined

# Lösung: Korrekter Prefix verwenden
console.log(import.meta.env.VITE_API_URL); // ✅

# Problem: Variables nicht gesetzt in Production
# Lösung: Vercel Environment Variables prüfen
vercel env ls
```

#### Performance-Probleme

```bash
# Problem: Große Bundle-Größe
Bundle size: 2.5MB (too large)

# Lösung: Bundle analysieren
npm run build:analyze

# Code-Splitting implementieren
const LazyComponent = React.lazy(() => import('./Component'));
```

### Debug-Tools

**Debug Helper**
```typescript
// utils/debug.ts
export const debugHelpers = {
  logBuildInfo(): void {
    if (import.meta.env.MODE === 'development') {
      console.group('🏗️ Build Information');
      console.log('Mode:', import.meta.env.MODE);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('WebSocket URL:', import.meta.env.VITE_WS_URL);
      console.log('Mock Data:', import.meta.env.VITE_USE_MOCK_DATA);
      console.log('PWA Enabled:', import.meta.env.VITE_ENABLE_PWA);
      console.groupEnd();
    }
  },
  
  logPerformanceMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const timing = window.performance.timing;
      const metrics = {
        'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
        'TCP Connection': timing.connectEnd - timing.connectStart,
        'Request Time': timing.responseEnd - timing.requestStart,
        'DOM Processing': timing.domComplete - timing.domLoading,
        'Total Load Time': timing.loadEventEnd - timing.navigationStart
      };
      
      console.table(metrics);
    }
  }
};

// Automatisch in Development aufrufen
if (import.meta.env.MODE === 'development') {
  debugHelpers.logBuildInfo();
  
  window.addEventListener('load', () => {
    setTimeout(() => debugHelpers.logPerformanceMetrics(), 1000);
  });
}
```

### Deployment-Checkliste

#### Pre-Deployment

- [ ] **Tests erfolgreich**: `npm run test`
- [ ] **Type-Check erfolgreich**: `npm run typecheck`  
- [ ] **Linting erfolgreich**: `npm run lint`
- [ ] **Build erfolgreich**: `npm run build`
- [ ] **Bundle-Größe akzeptabel**: < 1MB total
- [ ] **Environment Variables gesetzt**
- [ ] **Security Headers konfiguriert**
- [ ] **API Endpoints erreichbar**

#### Post-Deployment

- [ ] **Health Check erfolgreich**
- [ ] **Lighthouse Score > 90**
- [ ] **Funktionstest durchgeführt**
- [ ] **Mobile Ansicht getestet**
- [ ] **PWA Installation funktioniert**
- [ ] **WebSocket Verbindung aktiv**
- [ ] **Error Tracking aktiv**
- [ ] **Performance Monitoring aktiv**

#### Rollback-Plan

```bash
# Schneller Rollback bei Problemen
vercel rollback [deployment-url]

# Oder zu spezifischer Version
vercel --prod --alias production-backup
```

---

## 📚 Weiterführende Ressourcen

### Dokumentation

- **Vite Build Configuration**: https://vitejs.dev/config/
- **Vercel Deployment Guide**: https://vercel.com/docs
- **React Production Optimization**: https://react.dev/learn/deploying
- **PWA Best Practices**: https://web.dev/progressive-web-apps/

### Tools und Services

- **Bundle Analyzer**: https://www.npmjs.com/package/vite-bundle-analyzer
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Web Vitals**: https://web.dev/vitals/
- **Performance Monitoring**: https://vercel.com/analytics

### Support

- **Build Issues**: build-support@citypulse-hechingen.de
- **Deployment Issues**: deploy-support@citypulse-hechingen.de
- **Security Issues**: security@citypulse-hechingen.de

---

**CityPulse Hechingen Deployment Guide** - Vollständige Anleitung für professionelle Deployments

*Version 1.0.0 - Optimiert für moderne Web-Deployment-Strategien*