# 🚀 CityPulse Hechingen - Quick Start Guide

## 📋 Überblick

Dieses Dokument enthält die aktuellsten Anweisungen zum Starten von CityPulse Hechingen Frontend und Backend.

**Letzte Aktualisierung:** August 2025  
**Status:** ✅ Getestet und funktionsfähig

## 🔧 Systemanforderungen

- **Node.js**: Version 18.0.0 oder höher
- **npm**: Version 8.0.0 oder höher
- **Git**: Für Repository-Management
- **Browser**: Chrome, Firefox, Safari oder Edge (moderne Version)

## 📁 Projektstruktur

```
Energy-Management-MVP/
├── backend/          # Express.js Universal Backend
├── frontend/         # React Frontend
├── README.md
└── QUICK_START_GUIDE.md
```

## 🚀 Installation & Start

### Schritt 1: Repository klonen (falls noch nicht geschehen)

```bash
git clone <repository-url>
cd Energy-Management-MVP
```

### Schritt 2: Backend starten

**Terminal 1 - Backend:**
```bash
# Aus dem Hauptverzeichnis (Energy-Management-MVP)
cd backend

# Dependencies installieren (nur beim ersten Mal)
npm install

# Backend starten (Port 8001)
npm run dev
```

**✅ Erfolgsmeldung Backend:**
```
✨ FlowMind Universal Backend started successfully! ✨
🚀 Server running on: http://localhost:8001
🌍 Environment: development
📊 Health Check: http://localhost:8001/health
```

### Schritt 3: Frontend starten

**Terminal 2 - Frontend:**
```bash
# Neues Terminal öffnen
cd Energy-Management-MVP/frontend

# Dependencies installieren (nur beim ersten Mal)
npm install

# Frontend starten (Port 5173)
npm run dev
```

**✅ Erfolgsmeldung Frontend:**
```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## 🔗 URLs & Zugriff

| Service | URL | Status Check |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173 | Öffnet CityPulse App |
| **Backend** | http://localhost:8001 | API Basis-URL |
| **Health Check** | http://localhost:8001/health | JSON Status-Response |
| **API Info** | http://localhost:8001/api/v1/info | Backend-Informationen |

## 🔑 Login-Daten (Demo-Modus)

| Rolle | E-Mail | Passwort | Beschreibung |
|-------|--------|----------|--------------|
| **Admin** | admin@citypulse.com | admin123 | Vollzugriff auf alle Funktionen |
| **Bürgermeister** | buergermeister@citypulse.com | citypulse123 | Wie Admin |
| **Manager** | manager@citypulse.com | manager123 | Erweiterte Analyse-Funktionen |
| **Gebäudemanager** | gebaeude.manager@citypulse.com | citypulse123 | Gebäude-fokussierte Verwaltung |
| **User** | user@citypulse.com | user123 | Standard-Benutzer |
| **Bürger** | buerger@citypulse.com | citypulse123 | Öffentliche Daten |

## 🌐 Öffentlicher Zugang (ohne Anmeldung)

- **URL:** http://localhost:5173/public
- **Demo:** http://localhost:5173/demo
- **Inhalt:** Grundlegende Stadtstatistiken und Energiedaten

## 🐛 Troubleshooting

### Problem: "cd: no such file or directory"

**Ursache:** Falsche Pfadangaben  
**Lösung:** Immer aus dem Hauptverzeichnis navigieren

```bash
# ❌ Falsch
cd ../backend
cd ../frontend

# ✅ Richtig
cd Energy-Management-MVP/backend
cd Energy-Management-MVP/frontend
```

### Problem: "Port already in use"

**Backend (Port 8001):**
```bash
# Prozess finden und beenden
lsof -ti :8001 | xargs kill -9
# Oder anderen Port verwenden
PORT=8002 npm run dev
```

**Frontend (Port 5173):**
```bash
# Prozess finden und beenden
lsof -ti :5173 | xargs kill -9
# Oder anderen Port verwenden
npm run dev -- --port 5174
```

### Problem: "Module not found"

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

### Problem: "CORS Errors"

**Lösung:** Backend muss vor Frontend gestartet werden
1. Backend starten und warten bis "Server running" erscheint
2. Dann Frontend starten

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=8001
NODE_ENV=development
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8001/api/v1
VITE_WS_URL=ws://localhost:8001
VITE_USE_MOCK_DATA=true
VITE_FRONTEND_SOURCE=citypulse
```

## 🧪 Funktionstest

Nach dem Start beider Services:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8001/health
   ```
   Erwartete Antwort: JSON mit `"status": "healthy"`

2. **Frontend Test:**
   - Browser öffnen: http://localhost:5173
   - Login mit admin@citypulse.com / admin123
   - Dashboard sollte erscheinen

3. **API Test:**
   ```bash
   curl http://localhost:8001/api/v1/citypulse/buildings
   ```

## 📱 Mobile App (Zukünftig)

- **Status:** In Planung
- **Plattformen:** iOS & Android (React Native)
- **Features:** Push Notifications, Offline-Modus, AR-Visualisierung

## 🔄 Development Workflow

### Code Changes - Hot Reload
- **Frontend:** Automatisches Reload bei Änderungen
- **Backend:** Automatisches Restart bei Änderungen (nodemon)

### Build für Production
```bash
# Frontend Build
cd frontend
npm run build

# Backend (No build needed - Node.js)
cd backend
npm start
```

## 📞 Support & Hilfe

### Logs anzeigen
```bash
# Backend Logs (falls im Hintergrund)
tail -f backend/logs/app.log

# Browser Console für Frontend-Errors
F12 → Console Tab
```

### Status prüfen
```bash
# Laufende Node Prozesse
ps aux | grep node

# Port-Belegung prüfen
netstat -tulpn | grep :8001
netstat -tulpn | grep :5173
```

## 🚀 Performance Tipps

1. **Development:**
   - Schließe nicht benötigte Browser-Tabs
   - Nutze Chrome DevTools für Debugging
   - Mock-Modus reduziert Server-Last

2. **Production:**
   - Environment auf `production` setzen
   - Mock-Daten deaktivieren (`VITE_USE_MOCK_DATA=false`)
   - Reverse Proxy (nginx) für Static Files

## 📊 Features & Funktionen

### ✅ Implementiert
- 7 Gebäude-Dashboards
- Echtzeit-Energiemonitoring (simuliert)
- Rollenbasierte Zugriffskontrolle
- Responsive Design
- Mock-Daten-System
- WebSocket-Simulation

### 🔄 In Entwicklung
- KI-basierte Anomalieerkennung
- 3D-Gebäudevisualisierung
- Mobile App
- IoT-Sensor Integration

---

**Hinweis:** Bei Problemen bitte die Logs der entsprechenden Services prüfen und sicherstellen, dass alle Abhängigkeiten korrekt installiert sind.