# ProvMaterial

<div align="center">

**🌐 Language / Sprache**

[![English](https://img.shields.io/badge/🇬🇧-English-blue?style=for-the-badge)](README.md) [![Deutsch](https://img.shields.io/badge/🇩🇪-Deutsch-red?style=for-the-badge)](README.de.md)

</div>

Ein umfassendes Materialverwaltungssystem zur Verfolgung von Elektrogeräten, Kabeln und Komponenten über Projekte und Standorte hinweg. Entwickelt mit modernen Webtechnologien für nahtlose mobile und Desktop-Nutzung.

## 🎯 Überblick

ProvMaterial ist ein professionelles Lagerverwaltungssystem, das speziell für Elektroinstallateure und Projektmanager entwickelt wurde. Es bietet eine vollständige Lebenszyklusverfolgung von Materialien von der Beschaffung bis zum Einsatz, mit integrierter QR-Code-Scannung, Standortkartierung und projektbasierter Organisation.

## ✨ Kernfunktionen

### 📦 **Artikelverwaltung**

- **Vollständige Bestandsverfolgung** - Verfolgen Sie Kabel, Verlängerungen, Verteiler, Boxen und Kabeltrommeln
- **QR-Code-Integration** - Scannen Sie QR-Codes für sofortige Artikelsuche und -verwaltung
- **Detaillierte Spezifikationen** - Speichern Sie Stromstärke, Länge, Steckertypen und benutzerdefinierte Ausgänge
- **Bundle-Operationen** - Bearbeiten Sie mehrere Artikel gleichzeitig
- **Lagerorganisation** - Verwalten Sie Lagerstandorte mit Bereichen und Adresszuordnung

### 🚀 **Materialoperationen**

- **Auslagern** - Verteilen Sie Materialien an Projektstandorte mit vollständiger Prüfspur
- **Einlagern** - Bringen Sie Materialien in Batch-Operationen zurück ins Lager
- **Verlaufsverfolgung** - Vollständige Standort- und Projekthistorie für jeden Artikel
- **Mehrfachauswahl** - Bulk-Operationen für effiziente Materialbearbeitung

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

### Benutzerrollen

- **Admin** - Vollständiger Systemzugriff und Benutzerverwaltung
- **Manager** - Artikel- und Projektverwaltung
- **Benutzer** - Grundlegende Artikeloperationen
- **Betrachter** - Nur-Lese-Zugriff

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

### PWA-Konfiguration

- **Offline-Unterstützung** - Kritische Ressourcen zwischenspeichern
- **Installationsaufforderungen** - Mobile App-Installation
- **Hintergrundsynchronisation** - Synchronisation bei wiederhergestellter Verbindung
- **Push-Benachrichtigungen** - Systembenachrichtigungen (zukünftig)

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

## 🤝 Mitwirken

### Entwicklungsworkflow

1. **Repository forken** - Eigene Kopie erstellen
2. **Feature-Branch** - An Feature-Branches arbeiten
3. **Code-Qualität** - ESLint- und TypeScript-Regeln befolgen
4. **Testen** - Alle Funktionen testen
5. **Pull Request** - Zur Überprüfung einreichen

### Code-Standards

- **TypeScript** - Strikte Typprüfung aktiviert
- **Vue 3 Composition API** - Moderne Vue.js-Patterns
- **ESLint + Prettier** - Automatisierte Code-Formatierung
- **Conventional Commits** - Strukturierte Commit-Nachrichten

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

Für Support und Fragen:

- **Dokumentation** - Prüfen Sie die Inline-Dokumentation
- **Issues** - Erstellen Sie GitHub Issues für Bugs
- **Diskussionen** - Nutzen Sie GitHub Diskussionen für Fragen
- **Admin-Panel** - Prüfen Sie Systemstatus und Logs
