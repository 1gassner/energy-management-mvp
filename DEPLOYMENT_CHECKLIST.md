# Deployment Checklist - Energy Management MVP

Umfassende Checkliste für Production Deployments mit Security, Performance und Monitoring Guidelines.

## 🚀 Pre-Deployment Checklist

### ✅ Code Quality & Testing

#### Build & Compilation
- [ ] `npm run build` läuft fehlerfrei durch
- [ ] TypeScript Compilation ohne Errors: `npm run typecheck`
- [ ] ESLint Validation bestanden: `npm run lint`
- [ ] Bundle Size unter 500KB: `npm run build:analyze`
- [ ] Keine console.log Statements in Production Code
- [ ] Keine TODO/FIXME Kommentare in kritischen Bereichen

#### Testing
- [ ] Alle Unit Tests bestanden: `npm run test`
- [ ] Test Coverage über 85%: `npm run test:coverage`
- [ ] Integration Tests erfolgreich
- [ ] E2E Tests für kritische User Flows
- [ ] Manual Testing aller Features abgeschlossen
- [ ] Cross-Browser Testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile Responsiveness getestet

#### Performance Validation
- [ ] Lighthouse Score > 90 für alle Kategorien
- [ ] First Contentful Paint < 2.0s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s
- [ ] Bundle Analysis für Optimization-Potentiale

### 🔐 Security Checklist

#### Environment & Configuration
- [ ] Alle API Keys aus Source Code entfernt
- [ ] Environment Variables korrekt konfiguriert
- [ ] `.env` Files nicht in Git committed
- [ ] `VITE_USE_MOCK_DATA=false` für Production
- [ ] Sichere API URLs (HTTPS) konfiguriert
- [ ] WebSocket URLs mit WSS (Secure WebSocket)

#### Authentication & Authorization
- [ ] JWT Token Handling implementiert
- [ ] Token Refresh Mechanismus funktional
- [ ] Role-based Access Control (RBAC) getestet
- [ ] Session Timeout konfiguriert
- [ ] Logout Functionality vollständig
- [ ] Password Requirements enforced

#### Input Validation & XSS Protection
- [ ] Alle User Inputs validiert
- [ ] XSS Protection durch React's built-in Escaping
- [ ] Content Security Policy (CSP) Headers konfiguriert
- [ ] No dangerous `dangerouslySetInnerHTML` ohne Sanitization
- [ ] API Input Validation auf Frontend und Backend

### 🌐 Environment Setup

#### Production Environment Variables
```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws

# App Configuration
VITE_APP_ENV=production
VITE_USE_MOCK_DATA=false

# Monitoring & Analytics
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA-MEASUREMENT-ID

# Feature Flags
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_NOTIFICATIONS=true
```

#### Staging Environment Variables
```env
# API Configuration
VITE_API_URL=https://staging-api.yourdomain.com
VITE_WS_URL=wss://staging-api.yourdomain.com/ws

# App Configuration
VITE_APP_ENV=staging
VITE_USE_MOCK_DATA=false

# Testing & Debugging
VITE_DEBUG_MODE=true
VITE_SENTRY_DSN=https://staging-sentry-dsn@sentry.io/project-id
```

## 🏗️ Platform-Specific Deployment

### Vercel Deployment

#### Setup Steps
1. **Repository Connection**
   - [ ] GitHub Repository mit Vercel verbunden
   - [ ] Automatic Deployments für main branch aktiviert
   - [ ] Preview Deployments für Pull Requests aktiviert

2. **Environment Configuration**
   ```bash
   # Vercel CLI Commands
   vercel env add VITE_API_URL production
   vercel env add VITE_WS_URL production
   vercel env add VITE_SENTRY_DSN production
   ```

3. **Build Settings**
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm ci`
   - [ ] Node.js Version: 18.x

4. **Domain Configuration**
   - [ ] Custom Domain konfiguriert
   - [ ] SSL Certificate aktiv
   - [ ] CDN Distribution aktiv
   - [ ] Redirect Rules konfiguriert

#### Vercel Configuration File
```json
// vercel.json
{
  "version": 2,
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
        }
      ]
    }
  ]
}
```

### Netlify Deployment

#### Setup Steps
1. **Site Configuration**
   - [ ] Repository mit Netlify verbunden
   - [ ] Build Command: `npm run build`
   - [ ] Publish Directory: `dist`
   - [ ] Node Version: 18

2. **Redirects Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Security Headers**
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

### AWS S3 + CloudFront Deployment

#### S3 Bucket Setup
- [ ] S3 Bucket für Static Website Hosting konfiguriert
- [ ] Bucket Policy für Public Read Access
- [ ] CORS Configuration für API Calls
- [ ] Bucket Versioning aktiviert für Rollbacks

#### CloudFront Distribution
- [ ] CloudFront Distribution erstellt
- [ ] SSL Certificate von ACM konfiguriert
- [ ] Custom Domain mit Route 53 verbunden
- [ ] Cache Behaviors für verschiedene Asset Types
- [ ] Error Pages für SPA Routing konfiguriert

#### Deployment Script
```bash
#!/bin/bash
# deploy-aws.sh

set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://your-bucket-name --delete

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment completed!"
```

### Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build für optimale Image Size
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;
    }
}
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
```

## 📊 Monitoring & Analytics Setup

### Error Tracking (Sentry)

#### Installation & Configuration
```typescript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
      ],
      tracesSampleRate: 0.1,
      environment: import.meta.env.VITE_APP_ENV,
      beforeSend(event) {
        // Filter out development errors
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      }
    });
  }
};

export default initSentry;
```

#### Sentry Checklist
- [ ] Sentry Project erstellt
- [ ] DSN in Environment Variables konfiguriert
- [ ] Error Boundaries mit Sentry Integration
- [ ] Performance Monitoring aktiviert
- [ ] Release Tracking konfiguriert
- [ ] User Context für bessere Error Attribution

### Google Analytics 4

#### Setup
```typescript
// src/analytics/ga4.ts
import { gtag } from 'ga-gtag';

const initGA4 = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_title: document.title,
      page_location: window.location.href
    });
  }
};

const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    gtag('event', eventName, parameters);
  }
};

export { initGA4, trackEvent };
```

#### Analytics Events
- [ ] Page Views tracking
- [ ] User Interactions (Button Clicks, Form Submissions)
- [ ] Custom Events (Energy Data Views, Alert Actions)
- [ ] Conversion Goals (User Registration, Feature Usage)
- [ ] Error Tracking Events

### Performance Monitoring

#### Core Web Vitals
```typescript
// src/performance/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Usage in main.tsx
reportWebVitals((metric) => {
  console.log(metric);
  // Send to analytics service
  trackEvent('web_vital', {
    metric_name: metric.name,
    value: metric.value,
    metric_id: metric.id
  });
});
```

#### Performance Targets
- [ ] First Contentful Paint < 2.0s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] Time to Interactive < 3.5s

### Health Checks & Uptime Monitoring

#### Health Check Endpoint
```typescript
// src/api/health.ts
export const createHealthCheck = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV,
    checks: {
      api: 'connected',
      websocket: 'connected',
      localStorage: 'available'
    }
  };
};
```

#### Uptime Monitoring Services
- [ ] UptimeRobot oder Pingdom konfiguriert
- [ ] Health Check Endpoint überwacht
- [ ] SSL Certificate Monitoring
- [ ] DNS Resolution Monitoring
- [ ] Alert Notifications konfiguriert

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_WS_URL: ${{ secrets.VITE_WS_URL }}
        VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: './lighthouse.config.js'
        uploadArtifacts: true
    
    - name: Deploy to Vercel
      if: github.ref == 'refs/heads/main'
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Pipeline Requirements
- [ ] GitHub Actions Workflow konfiguriert
- [ ] Secrets für alle Environment Variables gesetzt
- [ ] Branch Protection Rules aktiviert
- [ ] Automatic Deployments für main branch
- [ ] Preview Deployments für Pull Requests
- [ ] Lighthouse CI Integration
- [ ] Test Coverage Reports

## 🚨 Rollback Procedures

### Immediate Rollback (Emergency)

#### Vercel Rollback
```bash
# Vercel CLI Rollback
vercel rollback [deployment-url]

# Or via Dashboard
# 1. Go to Vercel Dashboard
# 2. Select Project
# 3. Go to Deployments
# 4. Click "Promote to Production" on previous stable deployment
```

#### AWS CloudFront Rollback
```bash
# Quick rollback to previous S3 version
aws s3api list-object-versions --bucket your-bucket-name --prefix index.html
aws s3api get-object --bucket your-bucket-name --key index.html --version-id PREVIOUS_VERSION_ID index.html

# CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Rollback Checklist
- [ ] Identify the last known good deployment
- [ ] Create rollback issue/ticket
- [ ] Execute rollback procedure
- [ ] Verify application functionality
- [ ] Monitor error rates and performance
- [ ] Communicate rollback to stakeholders
- [ ] Investigate and document root cause
- [ ] Plan fix for forward deployment

## 📋 Post-Deployment Verification

### Functional Testing
- [ ] Homepage loads correctly
- [ ] User authentication works
- [ ] Dashboard displays data
- [ ] Navigation functions properly
- [ ] API endpoints responding
- [ ] WebSocket connections established
- [ ] Mobile responsiveness verified

### Performance Verification
- [ ] Page load times within targets
- [ ] Bundle sizes optimized
- [ ] Core Web Vitals meeting thresholds
- [ ] CDN distribution working
- [ ] Caching strategies effective

### Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CSP policies active
- [ ] No sensitive data in client code
- [ ] Authentication flows secure

### Monitoring Verification
- [ ] Error tracking receiving data
- [ ] Analytics tracking page views
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Alert notifications working

## 🚀 Go-Live Announcement

### Internal Communication
```markdown
## Energy Management MVP - Production Release

**Release Date**: [Date]
**Version**: 1.0.0
**Deployment URL**: https://energy.yourdomain.com

### What's New
- Complete Energy Management Dashboard
- Real-time energy flow visualization
- Building-specific monitoring
- Alert system with notifications
- AI-powered analytics

### Technical Details
- **Performance**: Lighthouse Score 95+
- **Uptime**: 99.9% SLA
- **Security**: Full HTTPS, CSP headers
- **Monitoring**: Sentry error tracking, GA4 analytics

### Support
- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues URL]
- **Emergency Contact**: [Contact details]
```

### External Communication
- [ ] Stakeholder notification sent
- [ ] User documentation published
- [ ] Training materials available
- [ ] Support procedures documented
- [ ] Feedback collection method established

## 🔧 Maintenance & Updates

### Regular Maintenance Tasks
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly performance reviews
- [ ] SSL certificate renewal monitoring
- [ ] Domain registration monitoring

### Update Procedures
1. **Dependency Updates**
   ```bash
   npm audit                    # Security audit
   npm update                   # Update dependencies
   npm run test                 # Verify tests pass
   npm run build               # Verify build works
   ```

2. **Security Updates**
   - [ ] Monitor security advisories
   - [ ] Apply critical patches immediately
   - [ ] Test security updates in staging
   - [ ] Document security changes

3. **Feature Updates**
   - [ ] Follow standard development workflow
   - [ ] Comprehensive testing in staging
   - [ ] Gradual rollout for major changes
   - [ ] Monitor for issues post-deployment

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Review Schedule**: Before each deployment  
**Status**: Production Deployment Ready ✅