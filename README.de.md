# ProvMaterial

<div align="center">

**🌐 Language / Sprache**

[![English](https://img.shields.io/badge/🇬🇧-English-blue?style=for-the-badge)](README.md) [![Deutsch](https://img.shields.io/badge/🇩🇪-Deutsch-red?style=for-the-badge)](README.de.md)

</div>

Ein benutzerfreundliches Verwaltungssystem für provisorisch genutztes Elektromaterial. Speziell entwickelt für die schnelle und einfache Verwaltung von Verlängerungskabeln, Verteilern, Kabelrollen, Steckerleisten und Adapterkabeln. Entwickelt mit modernen Webtechnologien für nahtlose mobile und Desktop-Nutzung.

## 🎯 Überblick

ProvMaterial ist darauf ausgerichtet, den Inventar an provisorisch genutztem Elektromaterial zu verwalten. Das Hauptziel ist es, eine benutzerfreundliche Oberfläche zu bieten, um Material schnell und einfach zu managen. Mit integrierter QR-Code-Scannung, Standortkartierung und projektbasierter Organisation vereinfacht es die Verwaltung von temporär eingesetzten Elektrokomponenten.

**Projekt-Hintergrund:** Dieses Projekt wurde für die Firma Shpower als Abschlussarbeit der Schule zum Techniker HF erstellt.

**🌐 Live-Instanzen:**

- **Hauptwebseite:** https://provmaterial.com/
- **Test-Webseite:** https://test.provmaterial.com/ (für Test-Login bitte Kontakt aufnehmen)

**ℹ️ Hinweise:**

- Microsoft Login funktioniert nur mit shpower.ch Domänen
- Zugriff auf die Webseite nur innerhalb der EU möglich

## ✨ Kernfunktionen

### 📦 **Artikelverwaltung**

- **Provisorisches Elektromaterial** - Verwalten Sie Verlängerungskabel, Verteiler, Kabelrollen, Steckerleisten und Adapterkabel
- **QR-Code-Integration** - Scannen Sie QR-Codes für sofortige Artikelsuche und -verwaltung
- **Detaillierte Spezifikationen** - Speichern Sie Stromstärke, Länge, Steckertypen und benutzerdefinierte Ausgänge
- **Benutzerfreundliche Oberfläche** - Schnelle und einfache Materialverwaltung
- **Bundle-Operationen** - Bearbeiten Sie mehrere Artikel gleichzeitig
- **Lagerorganisation** - Verwalten Sie Lagerstandorte mit Bereichen und Adresszuordnung

### 🚀 **Materialoperationen**

- **Auslagern** - Verteilen Sie provisorisches Material an Projektstandorte mit vollständiger Prüfspur
- **Einlagern** - Bringen Sie Materialien in Batch-Operationen zurück ins Lager
- **Verlaufsverfolgung** - Vollständige Standort- und Projekthistorie für jeden Artikel
- **Mehrfachauswahl** - Bulk-Operationen für effiziente Materialbearbeitung
- **Schnelle Navigation** - Benutzerfreundliche Oberfläche für schnelles Material-Management

### 🗺️ **Standort- und Projektverwaltung**

- **Interaktive Karten** - Visuelle Standortverwaltung mit MapLibre-Integration
- **Projektorganisation** - Gruppieren Sie Materialien nach Projekten mit Einsatzverfolgung
- **Geocoding-Unterstützung** - Automatische Adressauflösung und Koordinatenzuordnung
- **Lager- vs. Einsatzstandorte** - Separate Verfolgung für Lager- und aktive Einsatzorte

### 👨‍💼 **Administration und Sicherheit**

- **Mehrstufige Authentifizierung** - Microsoft OAuth, WebAuthn (Passkey) und Test-Login
- **Rollenbasierter Zugriff** - Granulare Berechtigungen für verschiedene Benutzertypen
- **Admin-Dashboard** - Systemstatistiken, Benutzerverwaltung und Aktivitätsüberwachung
- **Audit-Protokollierung** - Vollständige Änderungsverfolgung mit Benutzerzuordnung

### 📱 **Mobile-First-Erfahrung**

- **Progressive Web App** - Installation auf mobilen Geräten mit Offline-Funktionen
- **QR-Code-Scanner** - Integrierte Kameraintegration für Materialscannung
- **Responsive Design** - Optimiert für Tablets und Smartphones
- **Touch-freundliche Oberfläche** - Große Schaltflächen und Wischgesten

## 🛠️ Technologie-Stack

### **Frontend**

- **Nuxt 3** - Full-Stack Vue.js Framework mit SSR/SPA-Funktionen
- **Nuxt UI** - Schöne, zugängliche UI-Komponenten
- **Tailwind CSS** - Utility-First CSS-Framework
- **Vue QR Code Reader** - QR-Code-Scanfunktionalität
- **MapLibre GL** - Interaktive Kartierung und Geocoding

### **Backend und Datenbank**

- **NuxtHub** - Cloudflare-betriebene Backend-Infrastruktur
- **SQLite + Drizzle ORM** - Typsichere Datenbankoperationen
- **Serverseitige API** - RESTful Endpunkte mit automatischer Validierung
- **Echtzeit-Updates** - Live-Datensynchronisation

### **Authentifizierung und Sicherheit**

- **Microsoft OAuth** - Enterprise SSO-Integration
- **WebAuthn/Passkey** - Moderne passwortlose Authentifizierung
- **Sitzungsverwaltung** - Sichere Benutzersitzungen mit automatischer Aktualisierung
- **Rate Limiting** - API-Schutz und Missbrauchsprävention

### **DevOps und Deployment**

- **Cloudflare Workers** - Serverlose Deployment-Plattform
- **Automatische Deployments** - CI/CD mit umgebungsspezifischen Builds
- **Umgebungsverwaltung** - Produktions- und Vorschau-Umgebungen
- **PWA-Assets** - Automatische Icon- und Manifest-Generierung

## 📂 Projektstruktur

```
├── app/
│   ├── components/          # Wiederverwendbare Vue-Komponenten
│   │   ├── Article*.vue     # Artikel-bezogene Komponenten
│   │   ├── Location*.vue    # Standortverwaltung
│   │   ├── Project*.vue     # Projektverwaltung
│   │   └── *.vue           # Andere UI-Komponenten
│   ├── composables/         # Vue Composition-Funktionen
│   │   ├── articles/        # Artikel-spezifische Logik
│   │   └── *.ts            # Utility Composables
│   ├── pages/              # Anwendungsrouten
│   │   ├── articles/        # Artikeloperationen (takeOut, bringBack)
│   │   ├── admin/          # Administrationsbereich
│   │   └── *.vue           # Hauptseiten
│   ├── middleware/         # Routenschutz und Authentifizierung
│   └── layouts/            # Seitenlayouts
├── server/
│   ├── api/                # Backend-API-Endpunkte
│   │   ├── articles/       # Artikel-CRUD-Operationen
│   │   ├── projects/       # Projektverwaltung
│   │   ├── locations/      # Standortverwaltung
│   │   └── admin/          # Admin-Funktionen
│   ├── database/           # Datenbankschema und Migrationen
│   ├── routes/auth/        # Authentifizierungs-Handler
│   └── utils/              # Server-Utilities
└── public/                 # Statische Assets und PWA-Icons
```

## 🚀 Erste Schritte

### Voraussetzungen

- **Node.js 18+** - JavaScript-Laufzeit
- **pnpm** - Paketmanager (empfohlen)
- **Moderner Browser** - Chrome, Firefox, Safari oder Edge

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd ProvMaterial

# Abhängigkeiten installieren
pnpm install

# Umgebungsvariablen einrichten (von .env.example kopieren)
cp .env.example .env

# Datenbankschema generieren
pnpm db:generate

# Entwicklungsserver starten
pnpm dev
```

### Entwicklungsumgebung

```bash
# Verfügbare Skripte
pnpm dev          # Entwicklungsserver starten
pnpm build        # Für Produktion bauen
pnpm preview      # Produktions-Build-Vorschau
pnpm lint         # ESLint ausführen
pnpm typecheck    # TypeScript-Validierung
pnpm db:generate  # Datenbankmigrationen generieren
```

## 🎯 Kernarbeitsabläufe

### Artikel-Lebenszyklus

1. **Erstellung** - Neue Artikel mit Spezifikationen hinzufügen
2. **Lagerung** - Zu Lagerstandorten mit Bereichen zuweisen
3. **Einsatz** - Zu Projektstandorten auslagern
4. **Verfolgung** - Standort- und Projekthistorie überwachen
5. **Rückgabe** - Zurück ins Lager bringen, wenn Projekt abgeschlossen

### Projektverwaltung

1. **Projekte erstellen** - Neue Projekte mit Beschreibungen einrichten
2. **Materialien einsetzen** - Artikel zu Projekten an Standorten zuweisen
3. **Fortschritt verfolgen** - Eingesetzte vs. verfügbare Materialien überwachen
4. **Projektabschluss** - Materialien in Bulk-Operationen zurück ins Lager

### Standortoperationen

1. **Standort-Setup** - Standorte mit GPS-Koordinaten erstellen
2. **Lager vs. Einsatz** - Separate Lager- und aktive Standorte
3. **Kartenintegration** - Visuelle Standortverwaltung
4. **Adress-Geocoding** - Automatische Koordinatenauflösung

## 🔐 Authentifizierung und Berechtigungen

### Benutzerrechte

Das System verwendet ein granulares rechtebasiertes Berechtigungssystem mit folgenden Rechten:

- **useArticles** - Artikel anzeigen und suchen
- **editArticles** - Bestehende Artikel bearbeiten
- **addArticles** - Neue Artikel erstellen
- **removeArticles** - Artikel aus dem System löschen
- **admin** - Vollständiger administrativer Zugriff und Benutzerverwaltung

### Authentifizierungsmethoden

- **Microsoft OAuth** - Primäres SSO für Organisationen
- **WebAuthn/Passkey** - Passwortlose Authentifizierung
- **Test-Login** - Entwicklungs- und Demo-Zugriff

## 📊 API-Endpunkte

### Artikel

- `GET /api/articles/getAll` - Alle Artikel mit Filtern auflisten
- `POST /api/articles/create` - Neuen Artikel erstellen
- `PUT /api/articles/takeOutMultiple` - Artikel auslagern
- `PUT /api/articles/bringBackMultiple` - Artikel zurückbringen
- `GET /api/articles/search` - Artikel suchen

### Projekte und Standorte

- `GET /api/projects/getAll` - Projekte auflisten
- `POST /api/projects/create` - Projekt erstellen
- `GET /api/locations/getAll` - Standorte auflisten
- `POST /api/locations/create` - Standort erstellen

### Admin

- `GET /api/admin/stats` - Systemstatistiken
- `GET /api/admin/users` - Benutzerverwaltung

## 🌍 Deployment

### Produktionsumgebung

- **Domain** - Produktions-URL
- **Datenbank** - NuxtHub SQLite
- **Speicher** - Cloudflare R2
- **CDN** - Cloudflare globales Netzwerk

### Umgebungsvariablen

```bash
# Authentifizierung
NUXT_OAUTH_MICROSOFT_CLIENT_ID=your_client_id
NUXT_OAUTH_MICROSOFT_CLIENT_SECRET=your_secret

# Anwendung
NUXT_PUBLIC_APP_ENV=production
NUXT_TEST_LOGIN_ENABLED=false

# Datenbank (automatisch von NuxtHub konfiguriert)
NUXT_HUB_DATABASE_URL=auto
```

## 🔧 Konfiguration

### Datenbankschema

Das System verwendet eine relationale Datenbank mit folgenden Hauptentitäten:

- **Artikel** - Materialelemente mit Spezifikationen
- **Projekte** - Projektorganisation
- **Standorte** - Lager- und Einsatzstandorte
- **Benutzer** - Systembenutzer und Authentifizierung
- **Artikelhistorie** - Standort- und Projektverfolgung

## 📈 Systemüberwachung

### Admin-Dashboard

- **Artikelstatistiken** - Gesamt, im Lager, eingesetzt
- **Projektmetriken** - Aktive Projekte und Einsatzraten
- **Benutzeraktivität** - Login-Verfolgung und Berechtigungen
- **Systemgesundheit** - Leistungs- und Fehlerüberwachung

### Prüfspur

- **Änderungsprotokollierung** - Alle Artikeländerungen
- **Benutzerzuordnung** - Wer welche Änderungen vorgenommen hat
- **Zeitlinien-Verfolgung** - Vollständige Historienansicht
- **Exportfunktionen** - Datenberichterstattung und -analyse

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.
