# 🚀 CityPulse Deployment Guide - Updated

## 📋 Übersicht

**Stand:** August 2025  
**Status:** ✅ Production Ready  
**Getestet:** ✅ Lokal & Cloud

## 🌐 Deployment-Strategien

### 1️⃣ **Lokale Entwicklung** (Aktuell)

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:8001  
**Datenbank:** Mock-Daten (In-Memory)

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 2️⃣ **Cloud Deployment** (Empfohlen)

#### **Frontend → Vercel**
```bash
# Vercel CLI Installation
npm i -g vercel

# Deployment
cd frontend
vercel --prod

# Environment Variables in Vercel Dashboard setzen:
# VITE_API_URL=https://your-backend.railway.app/api/v1
# VITE_USE_MOCK_DATA=false
```

#### **Backend → Railway**
```bash
# Railway CLI Installation  
npm i -g @railway/cli

# Deployment
cd backend
railway login
railway init
railway up

# Environment Variables:
# NODE_ENV=production
# PORT=8001
# ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### **Datenbank → Supabase**
```bash
# Supabase Setup
npx supabase init
npx supabase start
npx supabase db push

# Connection String in Railway:
# DATABASE_URL=postgresql://user:pass@host:port/db
```

### 3️⃣ **Self-Hosted** (On-Premise)

#### **Docker Deployment**
```dockerfile
# Dockerfile.production
FROM node:18-alpine

# Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src
EXPOSE 8001
CMD ["npm", "start"]

# Frontend (Static Build)
WORKDIR /app/frontend  
COPY frontend/dist ./dist
# Served by nginx or similar
```

#### **Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: 
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8001:8001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    
  frontend:
    build:
      context: .  
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=citypulse
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔧 Environment Konfiguration

### **Development (.env.local)**
```env
# Frontend
VITE_API_URL=http://localhost:8001/api/v1/citypulse
VITE_WS_URL=ws://localhost:8001/citypulse  
VITE_USE_MOCK_DATA=true
VITE_LOG_LEVEL=debug
VITE_FRONTEND_SOURCE=citypulse

# Backend  
PORT=8001
NODE_ENV=development
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### **Production (.env.production)**
```env
# Frontend
VITE_API_URL=https://citypulse-api.railway.app/api/v1/citypulse
VITE_WS_URL=wss://citypulse-api.railway.app/citypulse
VITE_USE_MOCK_DATA=false
VITE_LOG_LEVEL=warn
VITE_FRONTEND_SOURCE=citypulse

# Backend
PORT=8001
NODE_ENV=production  
LOG_LEVEL=warn
ALLOWED_ORIGINS=https://citypulse.vercel.app,https://citypulse-hechingen.de
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your-super-secret-jwt-key
```

## 📊 Performance Optimierung

### **Frontend Build Optimierung**
```json
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['lucide-react', 'tailwindcss']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### **Backend Performance**
```javascript
// Caching Strategy
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache sensor data for 5 minutes
app.get('/api/sensors/:id', async (req, res) => {
  const cacheKey = `sensor:${req.params.id}`;
  const cached = await client.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const data = await getSensorData(req.params.id);
  await client.setex(cacheKey, 300, JSON.stringify(data));
  res.json(data);
});
```

## 🔐 Sicherheit

### **HTTPS/SSL Setup**
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name citypulse-hechingen.de;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Security Headers**
```javascript
// backend/src/middleware/security.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📈 Monitoring & Logging

### **Health Checks**
```javascript
// backend/src/routes/health.js
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseConnection(),
    redis: await checkRedisConnection()
  };
  
  res.status(health.database && health.redis ? 200 : 503).json(health);
});
```

### **Structured Logging**
```javascript
// winston logger setup
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy CityPulse

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
        
      - name: Install Backend Dependencies  
        run: cd backend && npm ci
        
      - name: Run Tests
        run: |
          cd frontend && npm test
          cd ../backend && npm test
          
      - name: Build Frontend
        run: cd frontend && npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    needs: test  
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: citypulse-backend
```

## 🌍 Multi-Environment Setup

### **Staging Environment**
```bash
# Vercel Preview Deployments
vercel --target preview

# Railway Preview Environment
railway environment create staging
railway deploy --environment staging
```

### **Load Balancing**
```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: citypulse-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: citypulse-backend
  template:
    spec:
      containers:
      - name: backend
        image: citypulse/backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: NODE_ENV
          value: "production"
```

## 📊 Deployment Checklist

### **Pre-Deployment**
- [ ] Alle Tests erfolgreich
- [ ] Environment Variables gesetzt
- [ ] SSL-Zertifikate bereit
- [ ] Backup-Strategie definiert
- [ ] Monitoring konfiguriert

### **Deployment**
- [ ] Database Migration durchgeführt
- [ ] Backend deployed und Health Check OK
- [ ] Frontend deployed und erreichbar
- [ ] DNS-Einträge aktualisiert
- [ ] CDN Cache geleert

### **Post-Deployment**
- [ ] Funktionaler Test durchgeführt
- [ ] Performance Test OK
- [ ] Error Monitoring aktiv  
- [ ] Backup verifiziert
- [ ] Team benachrichtigt

## 🚨 Rollback Strategie

### **Quick Rollback**
```bash
# Vercel Rollback
vercel rollback [deployment-url]

# Railway Rollback  
railway rollback [deployment-id]

# Database Rollback
pg_restore --clean --dbname citypulse backup_before_deploy.sql
```

## 📞 Support & Wartung

### **Monitoring URLs**
- **Uptime:** https://status.citypulse-hechingen.de
- **Metrics:** https://grafana.citypulse-hechingen.de  
- **Logs:** https://logs.citypulse-hechingen.de
- **Documentation:** https://docs.citypulse-hechingen.de

### **Emergency Contacts**
- **System Admin:** admin@citypulse.com
- **DevOps:** devops@citypulse.com
- **Support:** support@citypulse.com

---

**Letzte Aktualisierung:** August 2025  
**Nächste Review:** September 2025