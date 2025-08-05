# 🔧 Frontend CSP Fix - Charts & React Probleme

## ❌ **Probleme identifiziert:**

1. **Content-Security-Policy** zu restriktiv für React Charts
2. **API URL** zeigt noch auf alte Backend URL
3. **React PureComponent** Fehler durch CSP-Blockierung

## ✅ **Fixes implementiert:**

### **1. CSP Policy erweitert:**
- ✅ **unpkg.com** & **cdn.jsdelivr.net** für Charts
- ✅ **blob:** URLs für Web Workers
- ✅ **Neue Backend URL**: `energy-management-mvp.vercel.app`

### **2. Neue CSP Policy:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net
connect-src 'self' https://energy-management-mvp.vercel.app
worker-src 'self' blob:
child-src 'self' blob:
```

## 🎯 **Frontend Environment Variables Update:**

**In Vercel Dashboard → Frontend Project → Settings → Environment Variables:**

### **Update diese Variables:**
```bash
# Neue Backend API URL
VITE_API_URL=https://energy-management-mvp.vercel.app/api/citypulse

# Health Check
VITE_HEALTH_URL=https://energy-management-mvp.vercel.app/api/health

# WebSocket (falls verwendet)
VITE_WS_URL=wss://energy-management-mvp.vercel.app

# System Info
VITE_INFO_URL=https://energy-management-mvp.vercel.app/api/info
```

### **Fallback für Development:**
```bash
VITE_API_URL_DEV=http://localhost:8001/api/citypulse
```

## 🚀 **Nach Environment Update:**

1. **Vercel Dashboard** → **Deployments**
2. **"Redeploy"** klicken → Neue Environment Variables laden
3. **Charts funktionieren** → CSP erlaubt React Components
4. **API Calls funktionieren** → Neue Backend URL

## 🧪 **Test Commands:**

Nach Re-Deploy teste:

```bash
# Frontend Health Check
curl https://energy-management-mvp.vercel.app/api/health

# Buildings Data für Frontend
curl https://energy-management-mvp.vercel.app/api/citypulse/buildings
```

## 📊 **Expected Result:**

- ✅ **Keine CSP Errors** in Console
- ✅ **Charts laden korrekt** → React Components funktionieren
- ✅ **API Calls erfolgreich** → Echte Daten aus Backend
- ✅ **7 Gebäude & 745 Sensoren** angezeigt

## 🔧 **Falls immer noch Probleme:**

### **Option 1: CSP komplett deaktivieren** (nur für Testing):
```json
{
  "key": "Content-Security-Policy",
  "value": "upgrade-insecure-requests;"
}
```

### **Option 2: Inline Scripts erlauben**:
```json
{
  "key": "Content-Security-Policy", 
  "value": "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *;"
}
```

## 📱 **Frontend-Backend Connection:**

Nach dem Fix:
- **Frontend**: `https://energy-management-mvp.vercel.app` (Static Files)
- **Backend**: `https://energy-management-mvp.vercel.app/api/*` (Serverless Functions)
- **Full Stack**: Läuft auf einem Vercel Project!

---

**STATUS**: 🔧 **CSP Fix committed - Frontend Re-Deploy erforderlich!**