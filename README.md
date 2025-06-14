# ProvMaterial

<div align="center">

**🌐 Language / Sprache**

[![English](https://img.shields.io/badge/🇬🇧-English-blue?style=for-the-badge)](README.md) [![Deutsch](https://img.shields.io/badge/🇩🇪-Deutsch-red?style=for-the-badge)](README.de.md)

</div>

A comprehensive material management system for tracking electrical equipment, cables, and components across projects and locations. Built with modern web technologies for seamless mobile and desktop use.

## 🎯 Overview

ProvMaterial is a professional-grade inventory management system designed specifically for electrical contractors and project managers. It provides complete lifecycle tracking of materials from procurement to deployment, with integrated QR code scanning, location mapping, and project-based organization.

## ✨ Core Features

### � **Article Management**

- **Complete Inventory Tracking** - Track cables, extensions, distributors, boxes, and cable reels
- **QR Code Integration** - Scan QR codes for instant article lookup and management
- **Detailed Specifications** - Store ampacity, length, connector types, and custom outputs
- **Bundle Operations** - Handle multiple articles simultaneously
- **Storage Organization** - Manage storage locations with sections and address mapping

### 🚀 **Material Operations**

- **Take Out (Auslagern)** - Deploy materials to project locations with full audit trail
- **Bring Back (Einlagern)** - Return materials to storage with batch operations
- **History Tracking** - Complete location and project history for each article
- **Multi-Selection** - Bulk operations for efficient material handling

### � **Location & Project Management**

- **Interactive Maps** - Visual location management with MapLibre integration
- **Project Organization** - Group materials by projects with deployment tracking
- **Geocoding Support** - Automatic address resolution and coordinate mapping
- **Storage vs. Deployment Locations** - Separate tracking for storage and active deployment sites

### 👨‍💼 **Administration & Security**

- **Multi-Level Authentication** - Microsoft OAuth, WebAuthn (Passkey), and test login
- **Role-Based Access** - Granular permissions for different user types
- **Admin Dashboard** - System statistics, user management, and activity monitoring
- **Audit Logging** - Complete change tracking with user attribution

### 📱 **Mobile-First Experience**

- **Progressive Web App** - Install on mobile devices with offline capabilities
- **QR Code Scanner** - Built-in camera integration for material scanning
- **Responsive Design** - Optimized for tablets and smartphones
- **Touch-Friendly Interface** - Large buttons and swipe gestures

## 🛠️ Technology Stack

### **Frontend**

- **Nuxt 3** - Full-stack Vue.js framework with SSR/SPA capabilities
- **Nuxt UI** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Vue QR Code Reader** - QR code scanning functionality
- **MapLibre GL** - Interactive mapping and geocoding

### **Backend & Database**

- **NuxtHub** - Cloudflare-powered backend infrastructure
- **SQLite + Drizzle ORM** - Type-safe database operations
- **Server-side API** - RESTful endpoints with automatic validation
- **Real-time Updates** - Live data synchronization

### **Authentication & Security**

- **Microsoft OAuth** - Enterprise SSO integration
- **WebAuthn/Passkey** - Modern passwordless authentication
- **Session Management** - Secure user sessions with auto-refresh
- **Rate Limiting** - API protection and abuse prevention

### **DevOps & Deployment**

- **Cloudflare Workers** - Serverless deployment platform
- **Automatic Deployments** - CI/CD with environment-specific builds
- **Environment Management** - Production and preview environments
- **PWA Assets** - Automatic icon and manifest generation

## 📂 Project Structure

```
├── app/
│   ├── components/          # Reusable Vue components
│   │   ├── Article*.vue     # Article-related components
│   │   ├── Location*.vue    # Location management
│   │   ├── Project*.vue     # Project management
│   │   └── *.vue           # Other UI components
│   ├── composables/         # Vue composition functions
│   │   ├── articles/        # Article-specific logic
│   │   └── *.ts            # Utility composables
│   ├── pages/              # Application routes
│   │   ├── articles/        # Article operations (takeOut, bringBack)
│   │   ├── admin/          # Administration panel
│   │   └── *.vue           # Main pages
│   ├── middleware/         # Route protection and auth
│   └── layouts/            # Page layouts
├── server/
│   ├── api/                # Backend API endpoints
│   │   ├── articles/       # Article CRUD operations
│   │   ├── projects/       # Project management
│   │   ├── locations/      # Location management
│   │   └── admin/          # Admin functions
│   ├── database/           # Database schema and migrations
│   ├── routes/auth/        # Authentication handlers
│   └── utils/              # Server utilities
└── public/                 # Static assets and PWA icons
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager (recommended)
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ProvMaterial

# Install dependencies
pnpm install

# Set up environment variables (copy from .env.example)
cp .env.example .env

# Generate database schema
pnpm db:generate

# Start development server
pnpm dev
```

### Development Environment

```bash
# Available scripts
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript validation
pnpm db:generate  # Generate database migrations
```

## 🎯 Core Workflows

### Article Lifecycle

1. **Creation** - Add new articles with specifications
2. **Storage** - Assign to storage locations with sections
3. **Deployment** - Take out to project locations
4. **Tracking** - Monitor location and project history
5. **Return** - Bring back to storage when project complete

### Project Management

1. **Create Projects** - Set up new projects with descriptions
2. **Deploy Materials** - Assign articles to projects at locations
3. **Track Progress** - Monitor deployed vs. available materials
4. **Project Completion** - Bulk return materials to storage

### Location Operations

1. **Location Setup** - Create locations with GPS coordinates
2. **Storage vs. Deployment** - Separate storage and active locations
3. **Map Integration** - Visual location management
4. **Address Geocoding** - Automatic coordinate resolution

## 🔐 Authentication & Permissions

### User Roles

- **Admin** - Full system access and user management
- **Manager** - Article and project management
- **User** - Basic article operations
- **Viewer** - Read-only access

### Authentication Methods

- **Microsoft OAuth** - Primary SSO for organizations
- **WebAuthn/Passkey** - Passwordless authentication
- **Test Login** - Development and demo access

## 📊 API Endpoints

### Articles

- `GET /api/articles/getAll` - List all articles with filters
- `POST /api/articles/create` - Create new article
- `PUT /api/articles/takeOutMultiple` - Deploy articles
- `PUT /api/articles/bringBackMultiple` - Return articles
- `GET /api/articles/search` - Search articles

### Projects & Locations

- `GET /api/projects/getAll` - List projects
- `POST /api/projects/create` - Create project
- `GET /api/locations/getAll` - List locations
- `POST /api/locations/create` - Create location

### Admin

- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management

## 🌍 Deployment

### Production Environment

- **Domain** - Production URL
- **Database** - NuxtHub SQLite
- **Storage** - Cloudflare R2
- **CDN** - Cloudflare global network

### Environment Variables

```bash
# Authentication
NUXT_OAUTH_MICROSOFT_CLIENT_ID=your_client_id
NUXT_OAUTH_MICROSOFT_CLIENT_SECRET=your_secret

# Application
NUXT_PUBLIC_APP_ENV=production
NUXT_TEST_LOGIN_ENABLED=false

# Database (automatically configured by NuxtHub)
NUXT_HUB_DATABASE_URL=auto
```

## 🔧 Configuration

### Database Schema

The system uses a relational database with the following main entities:

- **Articles** - Material items with specifications
- **Projects** - Project organization
- **Locations** - Storage and deployment locations
- **Users** - System users and authentication
- **Article History** - Location and project tracking

### PWA Configuration

- **Offline Support** - Cache critical resources
- **Install Prompts** - Mobile app installation
- **Background Sync** - Sync when connection restored
- **Push Notifications** - System alerts (future)

## 📈 System Monitoring

### Admin Dashboard

- **Article Statistics** - Total, in storage, deployed
- **Project Metrics** - Active projects and deployment rates
- **User Activity** - Login tracking and permissions
- **System Health** - Performance and error monitoring

### Audit Trail

- **Change Logging** - All article modifications
- **User Attribution** - Who made what changes
- **Timeline Tracking** - Complete history view
- **Export Capabilities** - Data reporting and analysis

## 🤝 Contributing

### Development Workflow

1. **Fork Repository** - Create your own copy
2. **Feature Branch** - Work on feature branches
3. **Code Quality** - Follow ESLint and TypeScript rules
4. **Testing** - Test all functionality
5. **Pull Request** - Submit for review

### Code Standards

- **TypeScript** - Strict type checking enabled
- **Vue 3 Composition API** - Modern Vue.js patterns
- **ESLint + Prettier** - Automated code formatting
- **Conventional Commits** - Structured commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation** - Check the inline documentation
- **Issues** - Create GitHub issues for bugs
- **Discussions** - Use GitHub discussions for questions
- **Admin Panel** - Check system status and logs
