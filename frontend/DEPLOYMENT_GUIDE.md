# Deployment Guide
## Energy Management MVP Frontend

**Version:** 1.0.0  
**Last Updated:** August 2, 2025

---

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ 
- npm 9+
- Web server (nginx/Apache) or static hosting service
- SSL certificate for production

### Quick Start
```bash
# 1. Clone and setup
git clone <repository-url>
cd frontend
npm ci

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# 3. Build and deploy
npm run build
# Deploy dist/ folder to your web server
```

---

## 🔧 Environment Configuration

### Development Environment
```bash
# .env.local
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_ENABLE_CONSOLE_LOGS=true
VITE_DEBUG_MODE=true
```

### Staging Environment
```bash
# .env.staging
VITE_APP_ENV=staging
VITE_API_URL=https://staging-api.your-domain.com/api
VITE_WS_URL=wss://staging-api.your-domain.com
VITE_ENABLE_CONSOLE_LOGS=false
VITE_SENTRY_DSN=your-staging-sentry-dsn
VITE_SENTRY_ENVIRONMENT=staging
```

### Production Environment
```bash
# .env.production
VITE_APP_ENV=production
VITE_API_URL=https://api.your-domain.com/api
VITE_WS_URL=wss://api.your-domain.com
VITE_ENABLE_CONSOLE_LOGS=false
VITE_BUILD_SOURCEMAP=false
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXX-X
VITE_ENABLE_ANALYTICS=true
VITE_FORCE_HTTPS=true
```

---

## 🏗️ Build Process

### Local Build
```bash
# Development build with dev features
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build:analyze
```

### CI/CD Pipeline Build
```yaml
# Example GitHub Actions workflow
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
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
        
      - name: Run tests
        run: npm run test
        
      - name: Run linting
        run: npm run lint
        
      - name: Type check
        run: npm run typecheck
        
      - name: Build production
        run: npm run build
        env:
          VITE_APP_ENV: production
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_WS_URL: ${{ secrets.WS_URL }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          
      - name: Deploy to S3/CloudFront
        # Your deployment step
```

---

## 🌐 Web Server Configuration

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Root directory
    root /var/www/energy-management/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Cache index.html for short time
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Health check endpoint
    location /health {
        try_files $uri /index.html;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend-servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://backend-servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/energy-management/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security Headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Cache static assets
    <LocationMatch "^/assets/">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # SPA fallback
    <Directory "/var/www/energy-management/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

---

## ☁️ Cloud Deployment Options

### Vercel (Recommended for quick deployment)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables via Vercel dashboard
# or vercel env add VITE_API_URL production
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Or connect GitHub repo for auto-deployment
```

### AWS S3 + CloudFront
```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t energy-management-frontend .
docker run -p 80:80 energy-management-frontend
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `/health` - Basic health status
- `/health/detailed` - Detailed system status

### Application Monitoring
```typescript
// Configure monitoring in production
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  // Google Analytics
  gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
  
  // Performance monitoring
  if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
    // Monitor Core Web Vitals
    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
  }
}
```

### Error Tracking (Sentry)
```typescript
// Automatically configured based on environment variables
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    tracesSampleRate: 0.1,
  });
}
```

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check Node.js version
node --version  # Should be 18+
npm --version   # Should be 9+
```

#### Environment Variable Issues
```bash
# Debug environment variables
echo $VITE_API_URL
printenv | grep VITE_

# Check if variables are included in build
grep -r "VITE_API_URL" dist/
```

#### WebSocket Connection Issues
```javascript
// Check WebSocket connection in browser console
const ws = new WebSocket('wss://your-domain.com');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

#### Bundle Size Issues
```bash
# Analyze bundle
npm run build:analyze

# Check for large dependencies
npx bundlephobia-cli

# Optimize imports
# Use named imports instead of default imports
# Enable tree shaking for unused code
```

### Performance Issues

#### Slow Loading
1. Enable gzip compression
2. Check CDN configuration
3. Optimize images
4. Review bundle splitting strategy

#### High Memory Usage
1. Check for memory leaks in components
2. Review WebSocket connection management
3. Monitor component unmounting

---

## 🔄 Rollback Strategy

### Quick Rollback
```bash
# Option 1: Git-based rollback
git checkout previous-stable-tag
npm run build
# Deploy dist/ folder

# Option 2: Keep previous build
cp -r dist/ dist-backup/  # Before new deployment
cp -r dist-backup/ dist/  # Rollback command
```

### Blue-Green Deployment
```bash
# Deploy to green environment
# Test green environment
# Switch traffic to green
# Keep blue as rollback option
```

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Bundle size acceptable (`npm run build:analyze`)

### Configuration
- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] SSL certificates valid
- [ ] Domain/DNS configured

### Security
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Dependencies updated (`npm audit`)
- [ ] Secrets not in code

### Performance
- [ ] Bundle size optimized
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)
- [ ] Compression enabled

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Health checks working
- [ ] Logging configured

### Testing
- [ ] Staging environment tested
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Performance metrics baseline established

---

**Support:** For deployment issues, check the troubleshooting section or contact the development team.  
**Documentation:** Keep this guide updated with your specific deployment requirements.