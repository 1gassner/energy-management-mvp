# CityPulse Hechingen - Benutzerhandbuch

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)
![User Guide](https://img.shields.io/badge/guide-complete-blue.svg)

Ein umfassendes Benutzerhandbuch für das CityPulse Hechingen Energy Management System - von der ersten Anmeldung bis zur fortgeschrittenen Nutzung.

## 📋 Inhaltsverzeichnis

1. [Erste Schritte](#-erste-schritte)
2. [Navigation und Interface](#-navigation-und-interface)
3. [Dashboard-Übersicht](#-dashboard-übersicht)
4. [Gebäude-Management](#-gebäude-management)
5. [Sensor-Überwachung](#-sensor-überwachung)
6. [Alert-System](#-alert-system)
7. [Analytics und Berichte](#-analytics-und-berichte)
8. [Mobile App Nutzung](#-mobile-app-nutzung)
9. [Benutzerrollen und Berechtigungen](#-benutzerrollen-und-berechtigungen)
10. [Häufige Fragen (FAQ)](#-häufige-fragen-faq)
11. [Support und Hilfe](#-support-und-hilfe)

---

## 🚀 Erste Schritte

### System-Zugang

**Live-System:** [https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app](https://frontend-maftl3sho-jgs-projects-41371d9d.vercel.app)

### Anmeldung

1. **Browser öffnen** und zur CityPulse URL navigieren
2. **Anmelde-Seite** wird automatisch angezeigt
3. **Zugangsdaten eingeben**:
   - E-Mail-Adresse
   - Passwort
4. **"Anmelden" Button** klicken

#### Demo-Zugangsdaten

Für Testzwecke stehen verschiedene Demo-Accounts zur Verfügung:

| Benutzerrolle | E-Mail | Passwort | Zugriff |
|---------------|--------|----------|---------|
| **Administrator** | admin@hechingen.de | admin123 | Vollzugriff auf alle Funktionen |
| **Techniker** | techniker@hechingen.de | tech123 | Wartung und Sensor-Management |
| **Energiemanager** | energie@hechingen.de | energie123 | Analytics und Optimierung |
| **Gebäudeverwalter** | verwalter@hechingen.de | verwalter123 | Betriebsüberwachung |
| **Bürger** | buerger@hechingen.de | buerger123 | Öffentliche Dashboards |
| **Analyst** | analyst@hechingen.de | analyst123 | Datenanalyse und KI-Insights |

### Erste Orientierung

Nach der erfolgreichen Anmeldung sehen Sie:

1. **Hauptdashboard** - Übersicht aller Gebäude
2. **Navigation links** (Desktop) oder **unten** (Mobile)
3. **Benutzer-Menü** oben rechts
4. **Benachrichtigungen** und Alerts
5. **Live-Daten** der 7 kommunalen Gebäude

### Account-Einstellungen

1. **Benutzer-Avatar** oben rechts klicken
2. **"Einstellungen"** auswählen
3. **Persönliche Daten** bearbeiten:
   - Name
   - E-Mail-Adresse
   - Telefonnummer
   - Abteilung

4. **Präferenzen** anpassen:
   - Sprache (Deutsch/Englisch)
   - Theme (Hell/Dunkel/Auto)
   - Standard-Gebäude
   - Benachrichtigungseinstellungen

---

## 🧭 Navigation und Interface

### Desktop-Navigation

Das CityPulse Interface nutzt ein **glassmorphism-basiertes Design** mit transparenten Elementen und einer klaren Struktur.

#### Hauptnavigation (Sidebar)

**Gebäude-Dashboards:**
- 🏛️ **Rathaus** - Verwaltungsgebäude
- 🎓 **Gymnasium** - Bildungseinrichtung
- 🎓 **Realschule** - Weiterführende Schule  
- 🎓 **Werkrealschule** - Berufsschule
- 🎓 **Grundschule** - Grundschule
- 🏃 **Sporthallen** - Sportanlagen
- 🏊 **Hallenbad** - Freizeiteinrichtung

**Verwaltung:**
- 📊 **Analytics** - Detaillierte Datenanalyse
- 🚨 **Alerts** - Benachrichtigungen und Warnungen
- ⚙️ **Admin** - Systemverwaltung (nur für Admins)

#### Header-Bereich

- **CityPulse Logo** - Zurück zur Startseite
- **Breadcrumb-Navigation** - Aktueller Pfad
- **Suchfunktion** - Gebäude und Sensoren suchen
- **Benachrichtigungen** - Live-Alerts
- **Benutzer-Menü** - Profil und Einstellungen

### Mobile Navigation

Auf mobilen Geräten wechselt das Interface zu einer **Bottom Navigation**:

#### Bottom Navigation Bar

- 🏠 **Home** - Hauptdashboard
- 🏢 **Gebäude** - Gebäude-Auswahl
- 📊 **Charts** - Analytics-Schnellzugriff
- 🚨 **Alerts** - Benachrichtigungen
- 👤 **Profil** - Benutzer-Einstellungen

#### Mobile Besonderheiten

- **Hamburger-Menü** für erweiterte Navigation
- **Touch-optimierte** Buttons (mindestens 44px)
- **Swipe-Gesten** für Navigationsoptionen
- **Pull-to-Refresh** für Datenaktualisierung

### Interface-Elemente

#### EcoCard-System

Alle Inhalte werden in **glassmorphism-basierten Karten** dargestellt:

- **Transparenter Hintergrund** mit Backdrop-Blur
- **Hover-Effekte** bei Interaktion
- **Animierte Übergänge** für bessere UX
- **Responsive Design** für alle Bildschirmgrößen

#### Farbsystem nach Gebäuden

Jedes Gebäude hat eine **spezifische Farbkodierung**:

- **Rathaus**: Blau (#2563eb) - Verwaltung und Stabilität
- **Gymnasium**: Grün (#16a34a) - Nachhaltigkeit und Wachstum
- **Realschule**: Lila (#8b5cf6) - Wissen und Kreativität
- **Werkrealschule**: Orange (#f59e0b) - Praxis und Handwerk
- **Grundschule**: Pink (#ec4899) - Jugend und Lebendigkeit
- **Sporthallen**: Rot (#ef4444) - Energie und Bewegung
- **Hallenbad**: Cyan (#06b6d4) - Wasser und Frische

---

## 📊 Dashboard-Übersicht

### Hauptdashboard

Das **Hauptdashboard** bietet eine zentrale Übersicht aller städtischen Gebäude und deren Energiestatus.

#### KPI-Karten (oben)

Vier zentrale Kennzahlen werden prominent angezeigt:

1. **Gesamtenergieverbrauch**
   - Aktueller Verbrauch in kWh
   - Trend gegenüber Vorwoche
   - Farbkodierung: Grün (gut), Orange (hoch), Rot (kritisch)

2. **CO₂-Einsparungen**
   - Eingesparte CO₂-Emissionen in Tonnen
   - Vergleich zum Vorjahr
   - Nachhaltigkeitsziele-Fortschritt

3. **Energieeffizienz**
   - Gesamteffizienz aller Gebäude in %
   - Ranking der besten Gebäude
   - Optimierungspotential

4. **Aktive Alerts**
   - Anzahl unbearbeiteter Warnungen
   - Severity-Level (Low, Medium, High, Critical)
   - Direktlink zur Alert-Verwaltung

#### Gebäude-Übersicht (Mitte)

**Interactive Building Cards** zeigen für jedes Gebäude:

- **Live-Status** (Online, Offline, Wartung)
- **Aktueller Energieverbrauch**
- **Anzahl aktiver Sensoren**
- **Letzte Aktualisierung**
- **Klick für Detailview**

#### Live-Charts (unten)

**Real-time Visualisierungen:**

1. **Stadtweiter Energieverbrauch** (Liniendiagram)
   - 24-Stunden-Verlauf
   - Verbrauch vs. Produktion
   - Interaktive Zeitraumauswahl

2. **Effizienz-Ranking** (Balkendiagram)
   - Alle Gebäude im Vergleich
   - Sortierung nach Effizienz
   - Zielwerte vs. Ist-Werte

### Gebäude-spezifische Dashboards

Jedes Gebäude hat ein **individuell gestaltetes Dashboard** entsprechend seiner Funktion:

#### Beispiel: Grundschule Dashboard

**Header-Bereich:**
- **Gebäude-Titel** mit Icon
- **Grunddaten**: Baujahr, Fläche, Schüleranzahl
- **Status-Badges**: Nachhaltige Bildung, Lehrkräfte-Anzahl
- **Live-System-Status**

**KPI-Karten (speziell für Schulen):**
- **Energieintensität** (kWh/m²)
- **CO₂-Emissionen** (t/Jahr)
- **PV-Eigenverbrauch** (%)
- **Energiekosten** (€/Monat)

**Schulbetrieb-spezifische Bereiche:**
- **Tagesablauf & Energie** - Verbrauch nach Unterrichtszeiten
- **Raumnutzung** - Energieeffizienz nach Räumen
- **Nachhaltigkeitsbildung** - Umwelt-Projekte und Programme

**Success Story Bereich:**
- Hervorhebung besonderer Erfolge
- Zertifizierungen und Auszeichnungen
- Umweltprojekte der Schule

---

## 🏢 Gebäude-Management

### Gebäude-Auswahl

**Navigation zu Gebäuden:**

1. **Hauptdashboard**: Klick auf Gebäude-Karte
2. **Sidebar**: Direktauswahl über Navigation
3. **Dropdown-Menü**: "Alle Gebäude" für Schnellzugriff
4. **Suchfunktion**: Gebäudename eingeben

### Gebäude-Detailansicht

#### Header-Informationen

**Grunddaten:**
- **Name und Typ** des Gebäudes
- **Adresse** mit Kartenlink
- **Baujahr** und Renovierungsjahr
- **Gesamtfläche** in m²
- **Kapazität** (Personen/Schüler/Mitarbeiter)

**Energiesysteme:**
- **Solaranlage**: Kapazität und Effizienz
- **Heizung**: Typ und Leistung
- **Beleuchtung**: LED-Anteil
- **Lüftung**: Zonen und Steuerung

#### Live-Metriken

**Aktuelle Werte:**
- **Stromverbrauch** (kW)
- **Solarproduktion** (kW)
- **Netzeinspeisung/-bezug** (kW)
- **Temperatur** (°C)
- **Luftfeuchtigkeit** (%)
- **CO₂-Gehalt** (ppm)

#### Sensor-Übersicht

**Sensor-Grid** zeigt alle Sensoren des Gebäudes:
- **Sensor-Name** und Standort
- **Typ** (Energie, Temperatur, etc.)
- **Aktueller Wert** mit Einheit
- **Status** (Online/Offline/Wartung)
- **Letzte Messung**
- **Trend-Indikator**

#### Charts und Analysen

**Energieverbrauch-Chart:**
- **Zeitraumauswahl**: 24h, 7 Tage, 30 Tage, Jahr
- **Verbrauch vs. Produktion**
- **Effizienz-Kurve**
- **Wetterdaten-Overlay**

**Kostenanalyse:**
- **Monatliche Energiekosten**
- **Einsparungen durch Solar**
- **ROI-Entwicklung**
- **Budget-Tracking**

### Gebäude-Konfiguration (Admin)

Nur für **Administratoren** und **Gebäudeverwalter**:

#### Grundeinstellungen

```
Gebäude bearbeiten → Einstellungen → Grunddaten
```

**Editierbare Felder:**
- **Name** des Gebäudes
- **Adresse** und Koordinaten
- **Beschreibung**
- **Öffnungszeiten**
- **Ansprechpartner**
- **Notfallkontakte**

#### Energiesystem-Konfiguration

```
Gebäude bearbeiten → Energiesysteme → Konfiguration
```

**Systemparameter:**
- **Installierte Kapazität** (kW)
- **Maximaler Verbrauch** (kW)
- **Solar-Kapazität** (kWp)
- **Batteriespeicher** (kWh)
- **Tarifinformationen**

#### Alert-Schwellwerte

```
Gebäude bearbeiten → Alerts → Schwellwerte
```

**Einstellbare Grenzwerte:**
- **Energieverbrauch**: Normal, Hoch, Kritisch
- **Temperatur**: Min/Max-Werte
- **CO₂-Gehalt**: Luftqualitäts-Limits
- **Systemausfall**: Timeout-Werte

---

**CityPulse Hechingen Benutzerhandbuch** - Vollständige Anleitung für alle Benutzerrollen

*Version 1.0.0 - Optimiert für moderne Smart City Energy Management*