# 🚀 Energy Management MVP - Production Deployment & SSL Guide

## 📋 Übersicht

Dieses Dokument beschreibt die vollständige Deployment-Konfiguration mit SSL/HTTPS für das Energy Management MVP. Alle notwendigen Konfigurationen sind bereits erstellt und produktionsbereit.

## ✅ Was wurde konfiguriert

### 1. Production Environment Variables
- **Datei**: `frontend/.env.production`
- **Status**: ✅ Erstellt
- **Wichtig**: Ersetze alle Platzhalter mit echten Werten:
  - `your-domain.com` → Deine Domain
  - API Keys für Sentry, Google Analytics, Weather API, Maps API
  - Sentry DSN für Error Tracking

### 2. SSL/HTTPS Konfigurationen

#### Vercel (Empfohlen für schnelles Deployment)
- **Datei**: `vercel.json`
- **Status**: ✅ Konfiguriert
- **Features**:
  - Automatisches SSL via Let's Encrypt
  - Security Headers (HSTS, CSP, etc.)
  - Optimierte Build-Einstellungen
  - Frankfurt Region (fra1) für niedrige Latenz

#### Netlify (Alternative)
- **Dateien**: `netlify.toml`, `_headers`
- **Status**: ✅ Konfiguriert
- **Features**:
  - Automatisches SSL via Let's Encrypt
  - Security Headers
  - Cache-Optimierung
  - Environment Variables Support

#### Docker/Self-Hosting
- **Dateien**: `nginx/nginx.conf`, `Dockerfile.nginx`, `docker-compose.production.yml`
- **Status**: ✅ Konfiguriert
- **Features**:
  - Nginx mit SSL/TLS 1.2+1.3
  - Security Headers
  - Gzip Compression
  - WebSocket Support

### 3. Security Features
- **Content Security Policy (CSP)**: ✅ Konfiguriert
- **CORS Settings**: ✅ Backend-Config erstellt
- **HSTS mit Preload**: ✅ Aktiviert
- **XSS/Clickjacking Protection**: ✅ Aktiviert

## 🚀 Deployment Instructions

### Option 1: Vercel (Empfohlen)

1. **GitHub Repository erstellen**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/energy-management-mvp.git
   git push -u origin main
   ```

2. **Vercel Deployment**:
   - Gehe zu [vercel.com](https://vercel.com)
   - Klicke "Import Project"
   - Wähle dein GitHub Repository
   - Vercel erkennt automatisch die Konfiguration

3. **Environment Variables in Vercel setzen**:
   ```
   VITE_API_URL=https://api.your-domain.com/api
   VITE_WS_URL=wss://api.your-domain.com
   VITE_USE_MOCK_DATA=false
   VITE_SENTRY_DSN=your-sentry-dsn
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Custom Domain**:
   - In Vercel Dashboard → Settings → Domains
   - Domain hinzufügen: `energy-management.your-domain.com`
   - DNS Records bei deinem Provider konfigurieren

### Option 2: Netlify

1. **Netlify CLI Installation**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Environment Variables in Netlify setzen**:
   - Dashboard → Site Settings → Environment Variables
   - Alle Variables aus `.env.production` hinzufügen

4. **Custom Domain & SSL**:
   - Dashboard → Domain Settings
   - SSL Certificate wird automatisch erstellt

### Option 3: Docker Self-Hosting

1. **SSL Zertifikate vorbereiten**:
   
   **Option A: Let's Encrypt (Empfohlen)**:
   ```bash
   # Certbot installieren
   sudo apt-get update
   sudo apt-get install certbot
   
   # Zertifikat erstellen
   sudo certbot certonly --standalone -d energy-management.your-domain.com
   
   # Zertifikate kopieren
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/chain.pem ./ssl/chain.pem
   ```
   
   **Option B: Gekaufte Zertifikate**:
   ```bash
   mkdir ssl
   # Kopiere deine Zertifikate in den ssl/ Ordner
   cp /path/to/your/certificate.pem ./ssl/cert.pem
   cp /path/to/your/private-key.pem ./ssl/key.pem
   cp /path/to/your/ca-bundle.pem ./ssl/chain.pem
   ```

2. **Docker Build & Run**:
   ```bash
   # Build
   docker-compose -f docker-compose.production.yml build
   
   # Start
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Automatische Zertifikat-Erneuerung**:
   ```bash
   # Cron Job für Let's Encrypt Renewal
   sudo crontab -e
   # Füge hinzu:
   0 2 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.production.yml restart frontend
   ```

## 🔒 SSL/Security Checklist

### Vor dem Go-Live prüfen:

- [ ] Domain DNS Records konfiguriert
- [ ] SSL Zertifikat aktiv (https:// funktioniert)
- [ ] Environment Variables gesetzt
- [ ] API URL auf HTTPS umgestellt
- [ ] WebSocket URL auf WSS umgestellt
- [ ] Mock Data deaktiviert (`VITE_USE_MOCK_DATA=false`)
- [ ] Sentry DSN konfiguriert
- [ ] Google Analytics aktiviert

### Security Tests:

1. **SSL Labs Test**:
   ```
   https://www.ssllabs.com/ssltest/analyze.html?d=energy-management.your-domain.com
   ```
   Ziel: A+ Rating

2. **Security Headers Test**:
   ```
   https://securityheaders.com/?q=energy-management.your-domain.com
   ```
   Ziel: A Rating

3. **CSP Evaluator**:
   ```
   https://csp-evaluator.withgoogle.com/
   ```
   
## 🔧 Troubleshooting

### Problem: Mixed Content Warnings
**Lösung**: Stelle sicher, dass ALLE URLs (API, WebSocket, Assets) HTTPS verwenden.

### Problem: CORS Errors
**Lösung**: 
1. Prüfe `backend-cors-config.js`
2. Füge deine Domain zu `allowedOrigins` hinzu
3. Stelle sicher, dass Backend CORS Middleware nutzt

### Problem: WebSocket Connection Failed
**Lösung**:
1. Verwende `wss://` statt `ws://`
2. Prüfe Nginx WebSocket Proxy Config
3. Teste mit: `wscat -c wss://api.your-domain.com/ws`

### Problem: SSL Certificate Errors
**Lösung**:
1. Prüfe Zertifikat-Gültigkeit: `openssl x509 -in cert.pem -text -noout`
2. Stelle sicher, dass Zertifikat zur Domain passt
3. Prüfe Zertifikatskette (chain.pem)

## 📞 Support

Bei Fragen oder Problemen:
- Email: support@your-domain.com (aus `.env.production`)
- Documentation: [GitHub Wiki](https://github.com/your-repo/wiki)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Next Steps

1. **Monitoring einrichten**:
   - Sentry für Error Tracking
   - Google Analytics für User Analytics
   - Uptime Monitoring (z.B. UptimeRobot)

2. **Backup Strategy**:
   - Regelmäßige Datenbank-Backups
   - Code Repository Backups
   - SSL Zertifikat Backups

3. **Performance Optimization**:
   - CDN einrichten (CloudFlare, AWS CloudFront)
   - Image Optimization
   - Database Indexing

---

**Deployment Status**: ✅ Production Ready
**SSL Configuration**: ✅ Vollständig konfiguriert
**Security Headers**: ✅ Implementiert
**CORS Settings**: ✅ Vorbereitet