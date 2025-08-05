# 👥 CityPulse User Guide

**Version:** 1.0.0  
**Last Updated:** August 3, 2025

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [User Roles](#-user-roles)
3. [Getting Started](#-getting-started)
4. [Role-Specific Guides](#-role-specific-guides)
5. [Navigation Guide](#-navigation-guide)
6. [Features Overview](#-features-overview)
7. [Troubleshooting](#-troubleshooting)
8. [Support](#-support)

---

## 🌐 System Overview

CityPulse Hechingen ist ein intelligentes Energy Management System zur Überwachung und Verwaltung von 7 städtischen Gebäuden mit über 745 Sensoren. Das System bietet Echtzeitdaten, Analytics und Verwaltungstools für verschiedene Benutzergruppen.

### Überwachte Gebäude
- **Rathaus** - Verwaltungsgebäude (125 Sensoren)
- **Gymnasium** - Bildungseinrichtung (142 Sensoren)
- **Realschule** - Bildungseinrichtung (98 Sensoren)
- **Werkrealschule** - Bildungseinrichtung (87 Sensoren)
- **Grundschule** - Bildungseinrichtung (76 Sensoren)
- **Sporthallen** - Sporteinrichtungen (112 Sensoren)
- **Hallenbad** - Freizeiteinrichtung (105 Sensoren)

### System-Features
- **Echtzeit-Monitoring** von Energieverbrauch und -produktion
- **Intelligente Alerts** bei Anomalien oder kritischen Werten
- **Umfassende Analytics** mit AI-basierten Insights
- **Role-based Access** für verschiedene Benutzergruppen
- **Mobile-optimierte** Benutzeroberfläche
- **Dark/Light Mode** für optimale Benutzererfahrung

---

## 👥 User Roles

### Verfügbare Benutzerrollen

#### 🔧 Admin
- **Vollzugriff** auf alle Systemfunktionen
- **Benutzerverwaltung** und Systemkonfiguration
- **Sensor-Management** und System-Wartung
- **Alle Gebäude** und Daten zugänglich

#### 🛠️ Techniker
- **Wartung und Reparatur** fokussiert
- **Sensor-Management** und technische Diagnostik
- **Alerts und Störungen** bearbeiten
- **Technische Berichte** erstellen

#### 📊 Energiemanager
- **Energieoptimierung** und Effizienz-Analytics
- **Verbrauchsanalysen** und Reporting
- **Cost-Benefit-Analysen**
- **Nachhaltigkeits-Metriken**

#### 🏢 Gebäudeverwalter
- **Betriebsüberwachung** der zugewiesenen Gebäude
- **Routine-Monitoring** und Status-Updates
- **Betriebsberichte** und Dokumentation

#### 🌍 Bürger
- **Öffentliche Daten** einsehen
- **Nachhaltigkeits-Informationen** der Stadt
- **Transparenz** über öffentliche Energienutzung

#### 📈 Analyst
- **Datenanalyse** und Business Intelligence
- **AI-Analytics** und Predictive Modeling
- **Trend-Analysen** und Forecasting

---

## 🚀 Getting Started

### Erste Anmeldung

#### System-Zugang
**URL:** [https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app](https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app)

#### Demo-Accounts
| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | admin@hechingen.de | admin123 |
| Techniker | techniker@hechingen.de | tech123 |
| Energiemanager | energie@hechingen.de | energie123 |
| Gebäudeverwalter | verwalter@hechingen.de | verwalter123 |
| Bürger | buerger@hechingen.de | buerger123 |
| Analyst | analyst@hechingen.de | analyst123 |

#### Anmeldeprozess
1. **Browser öffnen** und URL aufrufen
2. **"Anmelden" klicken** auf der Startseite
3. **E-Mail und Passwort** eingeben
4. **"Anmelden" klicken**
5. **Dashboard wird geladen** entsprechend der Benutzerrolle

### Benutzeroberfläche

#### Header-Navigation
- **Logo/Home** - Zurück zur Startseite
- **Haupt-Navigation** - Rollenbezogene Menüpunkte
- **Theme-Toggle** - Dark/Light Mode umschalten
- **Connection Status** - WebSocket-Verbindungsstatus
- **User Menu** - Profil und Abmeldung

#### Seitenstruktur
- **Page Header** - Seitentitel und Beschreibung
- **Content Area** - Hauptinhalt mit Cards und Charts
- **Interactive Elements** - Buttons, Filters, Aktionen

---

## 🎯 Role-Specific Guides

### 🔧 Admin Guide

#### Dashboard-Übersicht
Der Admin-Dashboard bietet einen umfassenden Überblick über das gesamte System:

##### Haupt-Metriken
- **Gesamte Energieproduktion** - Alle Gebäude kombiniert
- **Gesamter Energieverbrauch** - Stadtweite Verbrauchsdaten
- **CO₂-Einsparungen** - Nachhaltigkeits-Impact
- **System-Effizienz** - Gesamtleistung des Systems
- **Aktive Alerts** - Anzahl ungelöster Probleme

##### System-Management
- **Benutzer verwalten** - Neue Benutzer anlegen, Rollen zuweisen
- **Gebäude-Konfiguration** - Einstellungen für alle Gebäude
- **Sensor-Verwaltung** - Status und Konfiguration aller Sensoren
- **System-Logs** - Detaillierte Aktivitätsprotokolle

##### Alert-Management
- **Critical Alerts** - Sofortige Aufmerksamkeit erforderlich
- **High Priority** - Wichtige, aber nicht kritische Probleme
- **Medium Priority** - Routine-Wartung und Optimierungen
- **Low Priority** - Informative Benachrichtigungen

#### Typische Admin-Aufgaben

##### 1. Neuen Benutzer anlegen
1. **Administration → Benutzerverwaltung**
2. **"Neuen Benutzer hinzufügen" klicken**
3. **Benutzerdaten eingeben** (Name, E-Mail, Rolle)
4. **Berechtigung festlegen** (Gebäudezugriff, Features)
5. **"Benutzer erstellen" klicken**

##### 2. System-Alerts bearbeiten
1. **Dashboard → Aktive Alerts**
2. **Alert auswählen** aus der Liste
3. **Details überprüfen** (Ursache, betroffene Systeme)
4. **Maßnahmen einleiten** (Techniker zuweisen, Status aktualisieren)
5. **Alert schließen** nach Lösung

##### 3. Gebäude-Performance überwachen
1. **Gebäude auswählen** aus der Übersicht
2. **Leistungsmetriken analysieren** (Effizienz, Verbrauch, Trends)
3. **Problembereiche identifizieren** (rote Kennzahlen, Warnings)
4. **Optimierungsmaßnahmen** planen und umsetzen

### 🛠️ Techniker Guide

#### Dashboard-Features
Der Techniker-Dashboard fokussiert auf operative und wartungsbezogene Aspekte:

##### Sensor-Übersicht
- **Online/Offline Status** aller Sensoren
- **Letzte Messwerte** und Zeitstempel
- **Kalibrierungsstatus** und Wartungsintervalle
- **Fehlerdiagnose** und Problembehandlung

##### Wartungs-Management
- **Geplante Wartungen** - Anstehende Termine
- **Notfall-Reparaturen** - Dringende Eingriffe erforderlich
- **Wartungsverlauf** - Abgeschlossene Arbeiten
- **Ersatzteil-Status** - Verfügbarkeit und Bestellungen

##### Building-Status
- **Systemzustand** aller technischen Anlagen
- **HVAC-Systeme** - Heizung, Lüftung, Klimatisierung
- **Elektrische Systeme** - Stromversorgung und Verteilung
- **Sicherheitssysteme** - Zugang und Überwachung

#### Typische Techniker-Aufgaben

##### 1. Sensor-Wartung durchführen
1. **Sensor-Management → Gebäude auswählen**
2. **Offline-Sensoren identifizieren** (rot markiert)
3. **Sensor-Details öffnen** (Klick auf Sensor-ID)
4. **Fehlerdiagnose durchführen** (Logs, Messwerte prüfen)
5. **Wartungsmaßnahmen dokumentieren**
6. **Status aktualisieren** nach Reparatur

##### 2. Alert-Response
1. **Alert-Benachrichtigung erhalten** (System/E-Mail)
2. **Alert-Details öffnen** (Dashboard → Alerts)
3. **Schweregrad bewerten** (Critical/High/Medium/Low)
4. **Vor-Ort-Inspektion** bei kritischen Alerts
5. **Problem lösen** und dokumentieren
6. **Alert als "Gelöst" markieren**

##### 3. Präventive Wartung
1. **Wartungskalender öffnen** (Maintenance → Schedule)
2. **Anstehende Wartungen anzeigen** (diese Woche/Monat)
3. **Wartungscheckliste abrufen** für spezifisches Gebäude
4. **Wartung durchführen** und Protokoll erstellen
5. **Nächste Wartung planen** (Intervall aktualisieren)

### 📊 Energiemanager Guide

#### Analytics-Dashboard
Der Energiemanager hat Zugriff auf erweiterte Analysetools:

##### Energieeffizienz-Metriken
- **Efficiency Ratio** - Produktion vs. Verbrauch
- **Peak Load Analysis** - Spitzenlasten identifizieren
- **Cost per kWh** - Kosteneffizienz bewerten
- **Carbon Footprint** - CO₂-Impact messen

##### Trend-Analysen
- **Monatliche Trends** - Verbrauchsentwicklung über Zeit
- **Saisonale Muster** - Jahreszeit-bedingte Schwankungen
- **Weather Correlation** - Wettereinfluss auf Verbrauch
- **Predictive Forecasting** - AI-basierte Vorhersagen

##### Optimierungs-Tools
- **Energy Savings Opportunities** - Einsparpotenziale
- **System Efficiency Recommendations** - Verbesserungsvorschläge
- **ROI Calculations** - Return on Investment für Maßnahmen
- **Benchmarking** - Vergleich mit anderen Gebäuden

#### Typische Energiemanager-Aufgaben

##### 1. Monatliche Effizienz-Analyse
1. **Analytics → Energy Efficiency**
2. **Zeitraum auswählen** (letzter Monat)
3. **Gebäude-Vergleich** durchführen
4. **Ineffizienzen identifizieren** (rote Kennzahlen)
5. **Optimierungsmaßnahmen** ableiten
6. **Report erstellen** für Management

##### 2. Cost-Benefit-Analyse
1. **Analytics → Cost Analysis**
2. **Investitionsvorschlag bewerten** (neue Sensoren, Systeme)
3. **ROI berechnen** (Payback-Zeit, Savings)
4. **Risiko-Assessment** durchführen
5. **Empfehlung formulieren** für Entscheidungsträger

##### 3. Nachhaltigkeits-Reporting
1. **Environmental → CO₂ Dashboard**
2. **Jahres-Bilanz erstellen** (Einsparungen, Emissionen)
3. **Ziele vs. Realität** vergleichen
4. **Verbesserungsmaßnahmen** vorschlagen
5. **Stakeholder-Report** für Stadtrat erstellen

### 🏢 Gebäudeverwalter Guide

#### Betriebsübersicht
Gebäudeverwalter haben fokussierten Zugriff auf ihre zugewiesenen Gebäude:

##### Tägliche Überwachung
- **Gebäudestatus** - Online/Offline/Wartung
- **Aktuelle Verbräuche** - Realzeit-Energiedaten
- **Komfort-Parameter** - Temperatur, Luftqualität
- **Occupancy Status** - Auslastung und Nutzung

##### Betriebsberichte
- **Tagesberichte** - Zusammenfassung der Aktivitäten
- **Wochen-Trends** - Entwicklung wichtiger Kennzahlen
- **Incident Reports** - Störungen und Probleme
- **Maintenance Logs** - Wartungsaktivitäten

#### Typische Gebäudeverwalter-Aufgaben

##### 1. Tägliche Statusprüfung
1. **Gebäude-Dashboard öffnen** (zugewiesenes Gebäude)
2. **Alle Systeme prüfen** (grün = OK, rot = Problem)
3. **Anomalien identifizieren** (ungewöhnliche Werte)
4. **Bei Problemen:** Techniker benachrichtigen
5. **Tageslogs aktualisieren**

##### 2. Besucherkomfort sicherstellen
1. **Comfort Metrics prüfen** (Temperatur, Luftqualität)
2. **Beschwerden bearbeiten** (zu kalt/warm, schlechte Luft)
3. **HVAC-Einstellungen anpassen** (falls berechtigt)
4. **Follow-up mit Nutzern** (Problem gelöst?)

### 🌍 Bürger Guide

#### Öffentliche Transparenz
Bürger haben Zugriff auf öffentliche Nachhaltigkeitsdaten:

##### Stadt-Dashboard
- **Gesamt-Energiebilanz** von Hechingen
- **CO₂-Einsparungen** durch öffentliche Gebäude
- **Nachhaltigkeits-Ziele** und Fortschritt
- **Umwelt-Impact** der Energiemaßnahmen

##### Bildungsinhalte
- **Energiespar-Tipps** für Haushalte
- **Nachhaltigkeits-Workshops** Termine
- **Best Practices** aus städtischen Gebäuden
- **Community Challenges** (Energiespar-Wettbewerbe)

#### Typische Bürger-Aktivitäten

##### 1. Nachhaltigkeits-Progress verfolgen
1. **Öffentliches Dashboard** aufrufen
2. **CO₂-Einsparungen** der Stadt anzeigen
3. **Vergleich zu Vorjahren** betrachten
4. **Erfolgsgeschichten** lesen

##### 2. Bildungsressourcen nutzen
1. **Energie-Tipps** für den Haushalt abrufen
2. **Workshop-Termine** finden und anmelden
3. **Community Forum** besuchen (falls verfügbar)

### 📈 Analyst Guide

#### Advanced Analytics
Analysten haben Zugriff auf erweiterte Datenanalyse-Tools:

##### Machine Learning Insights
- **Predictive Models** - Verbrauchsvorhersagen
- **Anomaly Detection** - Automatische Problemerkennung
- **Pattern Recognition** - Versteckte Trends finden
- **Optimization Algorithms** - Effizienz-Verbesserungen

##### Data Mining Tools
- **Custom Queries** - Spezifische Datenabfragen
- **Statistical Analysis** - Korrelationen und Trends
- **Regression Models** - Cause-Effect-Analysen
- **Forecasting** - Langzeit-Prognosen

#### Typische Analyst-Aufgaben

##### 1. Predictive Maintenance Model
1. **AI Analytics → Predictive Models**
2. **Historische Daten laden** (12+ Monate)
3. **Model Training** für Sensor-Ausfälle
4. **Prediction Accuracy** bewerten
5. **Maintenance Schedule** optimieren

##### 2. Energieeffizienz-Forecasting
1. **Advanced Analytics → Forecasting**
2. **Externe Faktoren einbeziehen** (Wetter, Occupancy)
3. **Scenario Modeling** (verschiedene Annahmen)
4. **Confidence Intervals** bestimmen
5. **Strategic Recommendations** ableiten

---

## 🧭 Navigation Guide

### Hauptnavigation

#### Menü-Struktur (rollenabhängig)

##### Admin-Navigation
- **Dashboard** - System-Übersicht
- **Gebäude** - Alle 7 Gebäude verwalten
- **Sensoren** - Sensor-Management
- **Benutzer** - User Administration
- **Analytics** - Umfassende Datenanalyse
- **Alerts** - System-Benachrichtigungen
- **Einstellungen** - System-Konfiguration

##### Techniker-Navigation
- **Dashboard** - Technischer Überblick
- **Gebäude** - Technische Gebäude-Details
- **Wartung** - Maintenance Management
- **Sensoren** - Sensor-Diagnostik
- **Alerts** - Technische Probleme
- **Berichte** - Wartungsdokumentation

##### Energiemanager-Navigation
- **Dashboard** - Energie-Übersicht
- **Analytics** - Erweiterte Analysen
- **Effizienz** - Optimierungs-Tools
- **Kosten** - Cost-Benefit-Analysen
- **Reports** - Management-Berichte
- **Trends** - Langzeit-Entwicklungen

### Quick Actions

#### Häufige Aktionen
- **Gebäude wechseln** - Dropdown im Header
- **Theme umschalten** - Dark/Light Mode Toggle
- **Alert-Details** - Klick auf Alert-Badge
- **Daten exportieren** - Export-Button in Charts
- **Hilfe aufrufen** - Fragezeichen-Icon

#### Keyboard Shortcuts
- **Ctrl + D** - Dashboard aufrufen
- **Ctrl + B** - Gebäude-Übersicht
- **Ctrl + A** - Alert-Center
- **Ctrl + S** - Settings/Einstellungen
- **Ctrl + /** - Hilfe anzeigen

---

## 🚀 Features Overview

### Real-time Monitoring

#### Live-Daten
- **WebSocket-Connection** für Echtzeit-Updates
- **Auto-refresh** alle 30 Sekunden
- **Live-Charts** mit dynamischen Updates
- **Status-Indicators** (Online/Offline/Warning)

#### Benachrichtigungen
- **Browser-Notifications** bei kritischen Alerts
- **E-Mail-Alerts** für wichtige Ereignisse
- **Dashboard-Badges** für neue Informationen
- **Sound-Alerts** bei kritischen Problemen (optional)

### Data Visualization

#### Chart-Typen
- **Line Charts** - Trends über Zeit
- **Bar Charts** - Vergleiche zwischen Gebäuden
- **Pie Charts** - Verteilungen und Anteile
- **Gauge Charts** - Aktuelle Werte vs. Ziele
- **Heatmaps** - Sensor-Verteilung in Gebäuden

#### Interaktive Features
- **Zoom & Pan** in Charts
- **Date Range Picker** für historische Daten
- **Filter Options** nach Gebäude, Sensor-Typ
- **Export Functions** (PNG, PDF, CSV)
- **Annotations** für wichtige Ereignisse

### Mobile Experience

#### Responsive Design
- **Mobile-First** Approach
- **Touch-optimierte** Bedienung
- **Swipe-Gesten** für Navigation
- **Optimierte Charts** für kleine Bildschirme

#### PWA-Features
- **Offline-Modus** für kritische Daten
- **Home Screen Installation** möglich
- **Push-Notifications** auf Mobile
- **Fast Loading** durch Caching

---

## 🔧 Troubleshooting

### Häufige Probleme

#### Login-Probleme

##### Symptom: "Ungültige Anmeldedaten"
**Lösung:**
1. **E-Mail-Adresse prüfen** (Tippfehler?)
2. **Passwort korrekt eingeben** (Groß-/Kleinschreibung)
3. **Demo-Accounts verwenden** (siehe Tabelle oben)
4. **Browser-Cache leeren** (Strg+F5)
5. **Bei anhaltenden Problemen:** Admin kontaktieren

##### Symptom: Anmeldung lädt endlos
**Lösung:**
1. **Internetverbindung prüfen**
2. **Browser aktualisieren** (F5)
3. **Anderer Browser versuchen** (Chrome, Firefox, Safari)
4. **JavaScript aktiviert?** (in Browser-Einstellungen)

#### Dashboard-Probleme

##### Symptom: Daten werden nicht angezeigt
**Lösung:**
1. **WebSocket-Status prüfen** (Header-Icon)
2. **Browser-Console öffnen** (F12 → Console)
3. **Fehlermeldungen notieren**
4. **Seite neu laden** (Strg+F5)
5. **Mock-Modus prüfen** (entwicklungsumgebung)

##### Symptom: Charts laden nicht
**Lösung:**
1. **JavaScript-Blocker deaktivieren**
2. **Browser-Kompatibilität prüfen** (moderne Browser erforderlich)
3. **Langsame Verbindung?** (Charts laden verzögert)
4. **Daten-Filter zurücksetzen**

#### Performance-Probleme

##### Symptom: Langsame Ladezeiten
**Lösung:**
1. **Internetverbindung testen**
2. **Browser-Cache leeren**
3. **Andere Tabs schließen** (Speicher freigeben)
4. **Hardware-Beschleunigung aktivieren** (Browser-Einstellungen)

##### Symptom: Hoher Speicherverbrauch
**Lösung:**
1. **Browser neu starten**
2. **Andere Anwendungen schließen**
3. **Dashboard regelmäßig neu laden**
4. **Ältere Browser-Versionen aktualisieren**

### Mobile-spezifische Probleme

#### Touch-Bedienung
- **Charts zoomen:** Pinch-Geste verwenden
- **Navigation:** Swipe oder Menu-Button
- **Zurück:** Browser-Back oder App-Navigation
- **Aktualisieren:** Pull-to-Refresh (nach unten ziehen)

#### Darstellungsprobleme
- **Text zu klein:** Browser-Zoom verwenden (Browser-Einstellungen)
- **Charts abgeschnitten:** Gerät drehen (Landscape-Modus)
- **Buttons nicht erreichbar:** Seite scrollen oder zoomen

---

## 🆘 Support

### Selbsthilfe-Ressourcen

#### Dokumentation
- **[Technische Dokumentation](./README.md)** - Umfassende System-Info
- **[API-Dokumentation](./API_DOCUMENTATION.md)** - Für Entwickler
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Häufige Probleme

#### Video-Tutorials (geplant)
- **Erste Schritte** - System-Einführung
- **Role-specific Workflows** - Rollen-spezifische Anleitungen
- **Advanced Features** - Erweiterte Funktionen
- **Mobile Usage** - Mobile Bedienung

### Kontakt-Optionen

#### Technischer Support
- **E-Mail:** support@citypulse-hechingen.de
- **Telefon:** +49 (0) 7471 / 930-xxx (Geschäftszeiten)
- **Ticket-System:** [support.citypulse-hechingen.de] (geplant)

#### Benutzer-Community
- **Forum:** [community.citypulse-hechingen.de] (geplant)
- **FAQ:** [faq.citypulse-hechingen.de] (geplant)
- **Feedback:** feedback@citypulse-hechingen.de

#### Notfall-Kontakt
- **Critical Alerts:** +49 (0) 7471 / 930-NOTFALL
- **24/7 Hotline:** Nur für Infrastruktur-kritische Probleme
- **Stadtwerke:** Bei Versorgungsproblemen

### Feedback & Verbesserungsvorschläge

#### Feature Requests
- **E-Mail:** features@citypulse-hechingen.de
- **Beschreibung:** Was soll die neue Funktion können?
- **Use Case:** Wann würden Sie sie verwenden?
- **Priorität:** Wie wichtig ist die Funktion für Sie?

#### Bug Reports
**Informationen für effektiven Bug Report:**
1. **Browser & Version** (Chrome 91, Firefox 89, etc.)
2. **Betriebssystem** (Windows 10, macOS 11, etc.)
3. **Benutzerrolle** (Admin, Techniker, etc.)
4. **Schritt-für-Schritt Reproduktion** des Problems
5. **Screenshots** oder Fehlermeldungen
6. **Erwartetes vs. tatsächliches Verhalten**

---

## 📚 Weitere Ressourcen

### Training & Schulung

#### Neue Benutzer
- **System-Einführung** (2 Stunden)
- **Role-specific Training** (1 Tag)
- **Hands-on Workshop** (halber Tag)
- **Zertifizierung** für Admin und Techniker

#### Fortgeschrittene
- **Advanced Analytics** (für Energiemanager/Analysten)
- **System Administration** (für Admins)
- **API Integration** (für Entwickler)

### Best Practices

#### Tägliche Routine
1. **Morning Checklist** - System-Status prüfen
2. **Alert Review** - Neue Benachrichtigungen bearbeiten
3. **Data Quality Check** - Sensor-Daten validieren
4. **Evening Report** - Tagesaktivitäten dokumentieren

#### Wöchentliche Aufgaben
1. **Performance Review** - KPIs analysieren
2. **Maintenance Planning** - Nächste Woche vorbereiten
3. **User Feedback** - Verbesserungen sammeln
4. **System Backup** - Daten-Integrität sicherstellen

---

**User Guide** - Ihr Leitfaden für effektive CityPulse-Nutzung

*Für nachhaltige Stadtentwicklung durch intelligente Energieverwaltung*