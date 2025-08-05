# 🚀 GitHub Repository Setup & Railway Deployment

## ✅ Status: Repository bereit für GitHub Push!

Alle Dateien sind committet und das Repository ist bereit für GitHub.

## 📋 Schritt-für-Schritt Anleitung:

### **1. GitHub Repository erstellen**

**Option A: GitHub Website (Einfachster Weg)**
1. Gehe zu: https://github.com/new
2. Repository Name: `energy-management-mvp`
3. Description: `CityPulse Energy Management - Smart City MVP mit 745 Sensoren in Hechingen`
4. **Wichtig**: Repository als **Public** erstellen (für kostenlose Railway Integration)
5. **NICHT** README, .gitignore oder License hinzufügen (haben wir schon)
6. Klicke "Create repository"

**Option B: Mit GitHub CLI (falls installiert)**
```bash
gh repo create energy-management-mvp --public --description "CityPulse Energy Management MVP"
```

### **2. Repository mit lokalem Code verknüpfen**

Nach dem Erstellen des GitHub Repos, führe diese Befehle aus:

```bash
cd /Users/j_gassner/Desktop/Energy-Management-MVP

# GitHub Repository als Remote hinzufügen
git remote add origin https://github.com/DEIN_USERNAME/energy-management-mvp.git

# Code zu GitHub pushen
git branch -M main
git push -u origin main
```

**Ersetze `DEIN_USERNAME` mit deinem GitHub Benutzernamen!**

### **3. Railway mit GitHub verbinden**

1. **Railway Dashboard öffnen**: https://railway.app/dashboard
2. **Projekt erstellen**: "New Project" → "Deploy from GitHub repo"
3. **Repository auswählen**: `energy-management-mvp`
4. **Service konfigurieren**:
   - Service Name: `energy-management-backend`
   - Root Directory: `backend/`
   - Build Command: `npm install`
   - Start Command: `npm start`

### **4. Environment Variables in Railway setzen**

In Railway Dashboard → Service → Variables:

```bash
NODE_ENV=production
PORT=$PORT
HOST=0.0.0.0

# Frontend CORS (deine Vercel URLs)
ALLOWED_ORIGINS=https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app,https://flowmind-homepage.vercel.app,https://ai-platform-flow-jgs-projects-41371d9d.vercel.app

# Features aktivieren
CITYPULSE_ENABLED=true
AI_MODELS_ENABLED=true
QUANTUM_SWARM_ENABLED=true
VELOCITY_SWARM_ENABLED=true
WEBSOCKET_ENABLED=true
RATE_LIMITING_ENABLED=true

# Security
JWT_SECRET=energy-mgmt-jwt-secret-2025-hechingen-smart-city-mvp-secure-key

# Logging
LOG_LEVEL=info

# Optional: Database (Supabase empfohlen)
SUPABASE_URL=https://bgclskdbhzkmlteqcdtl.supabase.co
SUPABASE_ANON_KEY=dein-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key

# Optional: AI APIs
OPENAI_API_KEY=dein-openai-key
ANTHROPIC_API_KEY=dein-anthropic-key
GROQ_API_KEY=dein-groq-key
```

### **5. Deployment starten**

Nach dem Setup klicke in Railway auf **"Deploy"**. Das Deployment dauert ca. 2-3 Minuten.

### **6. Backend URL erhalten**

Railway zeigt dir die URL an: `https://energy-management-backend-production.up.railway.app`

### **7. Health Check testen**

```bash
curl https://energy-management-backend-production.up.railway.app/health
```

### **8. Frontend Environment Variables updaten**

In Vercel Dashboard für dein CityPulse Frontend:

```bash
VITE_API_URL=https://energy-management-backend-production.up.railway.app/api/v1/citypulse
VITE_WS_URL=wss://energy-management-backend-production.up.railway.app
```

## 🎉 Nach erfolgreichem Deployment

### **API Endpoints verfügbar:**
- Health: `GET /health`
- Info: `GET /api/v1/info` 
- Buildings: `GET /api/v1/citypulse/buildings`
- Energy Data: `GET /api/v1/citypulse/energy`

### **Frontend URLs:**
- CityPulse: https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app
- FlowMind: https://flowmind-homepage.vercel.app
- AI Platform: https://ai-platform-flow-jgs-projects-41371d9d.vercel.app

## 🔧 Troubleshooting

### **Deployment Logs anzeigen:**
```bash
# Lokale Railway CLI (falls installiert)
railway logs --follow

# Oder im Railway Dashboard → Service → Deployments → Logs
```

### **Common Issues:**
1. **Deployment Failed**: Überprüfe Environment Variables
2. **CORS Error**: Vercel URL in `ALLOWED_ORIGINS` hinzufügen
3. **502 Bad Gateway**: Backend startet noch (warte 1-2 Minuten)

## 📊 System Status

- ✅ **Repository**: Vollständig vorbereitet (272 Dateien)
- ✅ **Backend Code**: Production-ready
- ✅ **Environment Config**: Vollständig dokumentiert
- ✅ **Multi-Frontend Support**: CityPulse, FlowMind, AI Platform
- ✅ **Security**: CORS, Helmet, Rate Limiting
- ✅ **Monitoring**: Health Checks, Logs, Metrics

## 🎯 Nächste Schritte

1. **GitHub Repository erstellen** (siehe oben)
2. **Code pushen** (`git push -u origin main`)
3. **Railway Deployment** (GitHub Integration)
4. **Vercel Environment Variables** updaten
5. **System testen**

**Das komplette Smart City System ist bereit für Deployment! 🚀**