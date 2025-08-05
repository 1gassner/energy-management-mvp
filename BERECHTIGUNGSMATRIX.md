# CityPulse Hechingen - Berechtigungsmatrix

## 🔐 Nutzerrollen und Berechtigungen

### **Admin (Vollzugriff)**
**Benutzer:** Administrator, Bürgermeister Dr. Philipp Hahn

#### Navigation & Zugriff:
- ✅ **Dashboard** - Vollständige Systemübersicht
- ✅ **Stadt-Daten** - Energiefluss und Stadtweite Analysen
- ✅ **Gebäude** - Zugriff auf alle 7 Gebäude-Dashboards
  - Rathaus Hechingen
  - Realschule Hechingen (KfW-55)
  - Grundschule Hechingen
  - Sporthallen Hechingen
  - Hallenbad Hechingen (Höchster Verbrauch)
  - Werkrealschule Hechingen (Geringe Auslastung)
  - Gymnasium Hechingen (Denkmalschutz)
- ✅ **Alerts** - Alle Systemalarme und Warnungen
- ✅ **Analytics** - KI-basierte Vorhersagen und Trends
- ✅ **Admin** - Vollständige Administrationsbereiche
  - **Dashboard** - System-KPIs und Schnellaktionen
  - **Sensorverwaltung** - CRUD für alle 745+ Sensoren
  - **Gebäudeverwaltung** - Gebäudekonfiguration
  - **Benutzerverwaltung** - Nutzerverwaltung

#### Funktionen:
- ✅ Sensor erstellen, bearbeiten, löschen
- ✅ Gebäudedaten modifizieren
- ✅ Systemkonfiguration
- ✅ Alle Berichte exportieren
- ✅ Alarme konfigurieren und verwalten
- ✅ Benutzer anlegen und Rollen zuweisen

---

### **Manager (Erweiterte Berechtigung)**
**Benutzer:** Stadt Manager, Klaus Fischer (Gebäudemanager)

#### Navigation & Zugriff:
- ✅ **Dashboard** - Operatives Dashboard
- ✅ **Stadt-Daten** - Energiefluss und Stadtdaten
- ✅ **Gebäude** - Zugriff auf alle 7 Gebäude-Dashboards
- ✅ **Alerts** - Einsehen und als gelesen markieren
- ✅ **Analytics** - Reporting und Trendanalysen
- ✅ **Admin** - Eingeschränkter Admin-Zugriff
  - **Dashboard** - Nur Einsicht in System-Status
  - ❌ **Sensorverwaltung** - Nur lesend
  - ❌ **Gebäudeverwaltung** - Nur lesend
  - ❌ **Benutzerverwaltung** - Kein Zugriff

#### Funktionen:
- ✅ Sensordaten einsehen (read-only)
- ✅ Gebäudedaten einsehen
- ✅ Berichte generieren und exportieren
- ✅ Alarme einsehen und als gelesen markieren
- ❌ Systemkonfiguration ändern
- ❌ Benutzer verwalten
- ❌ Sensoren erstellen/löschen

---

### **User (Standard-Berechtigung)**
**Benutzer:** Bürger, Max Mustermann

#### Navigation & Zugriff:
- ✅ **Dashboard** - Basisdashboard mit öffentlichen Daten
- ✅ **Stadt-Daten** - Öffentliche Energiedaten
- ✅ **Gebäude** - Zugriff auf alle Gebäude-Dashboards (read-only)
- ✅ **Alerts** - Nur öffentliche Informationen
- ❌ **Analytics** - Kein Zugriff
- ❌ **Admin** - Kein Zugriff

#### Funktionen:
- ✅ Öffentliche Energiedaten einsehen
- ✅ Gebäudeeffizienz und Einsparungen anzeigen
- ✅ Öffentliche Berichte herunterladen
- ❌ Sensordaten im Detail
- ❌ Systemkonfiguration
- ❌ Administrative Funktionen

---

### **Public (Öffentlicher Zugang)**
**Zugriff:** Ohne Anmeldung über `/public`

#### Navigation & Zugriff:
- ✅ **Öffentliches Dashboard** - Grundlegende Stadtdaten
- ✅ **Energieübersicht** - Stadtweite Verbrauchsdaten
- ✅ **Gebäude-Basisinfos** - Öffentliche Gebäudedaten
- ❌ **Detaillierte Sensordaten** - Nicht verfügbar
- ❌ **Administrative Bereiche** - Kein Zugriff

#### Funktionen:
- ✅ Grundlegende Energiestatistiken
- ✅ CO2-Einsparungen der Stadt
- ✅ Gebäudeeffizienz-Übersicht
- ❌ Echzeit-Sensordaten
- ❌ Detaillierte Analysen

---

## 🏢 Gebäude-spezifische Berechtigungen

### **Rathaus Hechingen**
- **Admin/Manager:** Vollzugriff auf alle Sensoren und Steuerung
- **User:** Öffentliche Bürgerdienste-Statistiken
- **Public:** Grundlegende Gebäudeinformationen

### **Realschule Hechingen (KfW-55)**
- **Admin/Manager:** Vollzugriff, Effizienz-Monitoring
- **User:** Bildungsstatistiken, Energieeffizienz
- **Public:** Schüleranzahl, Energieklasse

### **Grundschule Hechingen**
- **Admin/Manager:** Vollzugriff auf alle Schul-Sensoren
- **User:** Bildungsstatistiken
- **Public:** Grundlegende Schulinformationen

### **Sporthallen Hechingen**
- **Admin/Manager:** Vollzugriff, Auslastungssteuerung
- **User:** Vereinssport-Zeiten, Auslastung
- **Public:** Öffnungszeiten, Sportangebote

### **Hallenbad Hechingen (Energieintensiv)**
- **Admin/Manager:** Vollzugriff, Temperatursteuerung, Pumpenmanagement
- **User:** Wassertemperatur, Öffnungszeiten
- **Public:** Besucherinformationen

### **Werkrealschule Hechingen (Niedrige Auslastung)**
- **Admin/Manager:** Vollzugriff, Renovierungsplanung
- **User:** Bildungsstatistiken
- **Public:** Schüleranzahl, Renovierungsstatus

### **Gymnasium Hechingen (Denkmalschutz)**
- **Admin/Manager:** Vollzugriff mit Denkmalschutz-Beschränkungen
- **User:** Bildungsstatistiken, Denkmalschutz-Info
- **Public:** Historische Informationen

---

## 📊 Sensor-Berechtigungen (745+ Sensoren)

### **Kritische Sensoren** (Überwachung erforderlich)
- **Admin:** Vollzugriff, Konfiguration, Alerting
- **Manager:** Monitoring, Alert-Bestätigung
- **User/Public:** Keine kritischen Sensordaten

### **Standard-Sensoren**
- **Admin:** CRUD-Operationen
- **Manager:** Read-Only
- **User:** Aggregierte Daten
- **Public:** Keine individuellen Sensordaten

### **Öffentliche Sensoren** (Umwelt, Effizienz)
- **Alle Rollen:** Einsichtnahme in öffentliche Umweltdaten

---

## 🚨 Alert-Berechtigungen

### **Kritische Alerts**
- **Admin:** Vollzugriff, Konfiguration, Lösung
- **Manager:** Einsicht, Weiterleitung
- **User/Public:** Nur bei öffentlicher Relevanz

### **Wartungsalarme**
- **Admin:** Vollzugriff
- **Manager:** Einsicht und Planung
- **User/Public:** Kein Zugriff

### **Informations-Alerts**
- **Admin/Manager:** Vollzugriff
- **User:** Öffentliche Informationen
- **Public:** Bürgerrelevante Informationen

---

## 🔧 API-Berechtigungen

### **CRUD-Operationen**
- **Create:** Nur Admin
- **Read:** Admin (alle), Manager (meiste), User (öffentliche), Public (begrenzt)
- **Update:** Admin (alle), Manager (begrenzt)
- **Delete:** Nur Admin

### **Datenexport**
- **Admin:** Alle Daten, alle Formate
- **Manager:** Betriebsdaten, Standard-Formate
- **User:** Öffentliche Berichte
- **Public:** Grundlegende Statistiken

---

## 📱 Mobile/Responsive Berechtigungen

Alle Berechtigungen gelten **geräteunabhängig** für:
- Desktop-Browser
- Tablet-Anwendungen
- Mobile Browser
- Progressive Web App (PWA)

---

## 🔐 Sicherheitsrichtlinien

### **Authentifizierung**
- Admin/Manager: Starke Passwort-Anforderungen
- User: Standard-Authentifizierung
- Public: Keine Anmeldung erforderlich

### **Session-Management**
- Admin: 4 Stunden Session-Timeout
- Manager: 8 Stunden Session-Timeout  
- User: 24 Stunden Session-Timeout
- Public: Keine Session

### **Audit-Logging**
- Admin-Aktionen: Vollständig geloggt
- Manager-Aktionen: Wichtige Änderungen geloggt
- User-Zugriffe: Basis-Logging
- Public-Zugriffe: Minimal-Logging

---

## ✅ Implementierungsstatus

### **Vollständig implementiert:**
- ✅ 7 Gebäude-Dashboards mit vollständiger Navigation
- ✅ Admin-Sensorverwaltung für 745+ Sensoren
- ✅ Rollenbasierte Navigation und Berechtigungen
- ✅ Building-Dropdown mit allen Gebäuden
- ✅ Responsive Design für alle Geräte

### **Funktionsübersicht:**
- ✅ **Navigation:** Vollständig für alle Rollen
- ✅ **Sensoren:** CRUD-Interface für Admins
- ✅ **Gebäude:** Alle 7 Gebäude zugänglich
- ✅ **Alerts:** Rollenbasiertes Alert-System
- ✅ **Analytics:** KI-basierte Vorhersagen

**Stand:** Januar 2025 - Vollständig funktionsfähig
**Server:** http://localhost:3000 (Entwicklung läuft)