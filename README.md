# ProvMaterial

### Material Management System 👍

A modern, web-based material management system built with Nuxt 3 and NuxtHub, featuring automatic deployment to production and preview environments.

## Features

- 📱 **Mobile-First Design** - Optimized for mobile devices with address bar hiding
- 🔐 **Multi-Authentication** - Microsoft OAuth, WebAuthn (Passkey), and test login
- 📊 **Material Management** - Track, check in/out, and manage materials
- 🗺️ **Location Mapping** - Visual location management with maps
- 📱 **PWA Support** - Progressive Web App with offline capabilities
- 🌓 **Dark/Light Mode** - User preference theme switching
- 📋 **QR Code Scanning** - Mobile QR code scanning for quick material lookup
- 👥 **Admin Panel** - Administrative interface for user management
- 🚀 **Auto-Deployment** - Automatic deployment to production and preview environments
- 🏷️ **Environment Badges** - Visual indicators for preview vs production environments

## Environments

### Production

- **Branch**: `main`
- **Icons**: Production branding
- **App Name**: "Provmaterial"
- **Deployment**: Automatic on push to main

### Preview

- **Branch**: `test` (auto-synced from main)
- **Icons**: Preview branding
- **App Name**: "Provmaterial (Preview)"
- **Badges**: Orange warning badges on layout and auth card
- **Deployment**: Automatic after main sync

## UI Differences

### Preview Environment Indicators

When `NUXT_PUBLIC_APP_ENV=preview`:

- **Top Banner**: Orange "🚧 Preview Environment - Testversion" banner
- **Auth Card**: Warning alert "Sie verwenden die Testversion von Provmaterial"
- **PWA Manifest**: App name includes "(Preview)"
- **Layout Adjustments**: Account button positioned lower to accommodate banner

### Production Environment

When `NUXT_PUBLIC_APP_ENV=production` (or not set):

- **Clean Layout**: No preview banners or badges
- **Standard Branding**: Production app name and icons
- **Normal Positioning**: Standard layout without preview accommodations

## Development

### Prerequisites

- Node.js 22+
- pnpm package manager

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd ProvMaterial

# Install dependencies
pnpm install

# Set up icon directories (if needed)
pnpm icons:setup

# Start development server
pnpm dev
```

### Environment Management

#### Icon Management

```bash
# Switch to production icons locally
pnpm icons:production

# Switch to preview icons locally
pnpm icons:preview

# Check current icon status
pnpm icons:status

# Check branch status
pnpm branches:status
```

#### Local Environment Testing

```bash
# Switch to preview environment (icons + environment variables)
pnpm switch preview

# Switch to production environment (icons + environment variables)
pnpm switch production

# Check current status (environment, icons, branch)
pnpm status

# Start development server with current environment
pnpm dev
```

#### Quick Development Workflow

```bash
# Test preview environment locally
pnpm switch preview
pnpm dev

# Test production environment locally
pnpm switch production
pnpm dev
```

#### Deployment Workflow

```bash
# Work on main branch only
git checkout main
git add .
git commit -m "Your changes"
git push origin main

# ✨ This automatically:
# 1. Syncs changes to test branch
# 2. Deploys main → production (with production icons)
# 3. Deploys test → preview (with preview icons)
```

## Technology Stack

- **Framework**: Nuxt 3 with Nuxt 4 compatibility
- **UI**: Nuxt UI + Tailwind CSS
- **Database**: NuxtHub Database (SQLite with Drizzle ORM)
- **Authentication**:
  - Microsoft OAuth (nuxt-auth-utils)
  - WebAuthn/Passkey support
  - Test login for development
- **Storage**: NuxtHub Blob storage
- **Maps**: MapLibre GL with nuxt-maplibre
- **PWA**: @vite-pwa/nuxt for Progressive Web App features
- **Deployment**: NuxtHub with Cloudflare Workers
- **Device Detection**: @nuxtjs/device

## Project Structure

```
app/
├── components/          # Vue components
├── composables/         # Vue composables and utilities
├── layouts/            # Layout components
├── pages/              # Route pages
├── middleware/         # Route middleware
└── assets/             # Static assets

server/
├── api/                # API endpoints
├── database/           # Database schema and migrations
├── routes/             # Server routes (auth, etc.)
└── utils/              # Server utilities

public/
├── icons-production/   # Production icons
├── icons-preview/      # Preview icons
└── [generated icons]   # Auto-generated during deployment

scripts/
├── switch-icons.js     # Local icon switching utility
└── setup-icons.js      # Icon directory setup utility
```

## Configuration

### Environment Variables

- `NUXT_TEST_LOGIN_ENABLED` - Enable test login functionality
- `NUXT_PUBLIC_APP_ENV` - App environment (production/preview)

### Authentication

The app supports multiple authentication methods:

- **Microsoft OAuth** - Primary authentication method
- **WebAuthn/Passkey** - Secure passwordless authentication
- **Test Login** - Development/testing authentication

## Documentation

- [`ICONS-WORKFLOW.md`](./ICONS-WORKFLOW.md) - Complete icon management workflow
- [`BRANCH-SYNC.md`](./BRANCH-SYNC.md) - Automatic branch synchronization guide
- [`ENVIRONMENT-EXAMPLE.vue`](./ENVIRONMENT-EXAMPLE.vue) - Environment-specific component example

## Scripts

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `pnpm dev`                 | Start development server                       |
| `pnpm build`               | Build for production                           |
| `pnpm preview`             | Preview production build                       |
| `pnpm deploy`              | Deploy to NuxtHub                              |
| `pnpm lint`                | Run ESLint                                     |
| `pnpm typecheck`           | Run TypeScript checks                          |
| **Environment Management** |
| `pnpm switch <env>`        | Switch between production/preview environments |
| `pnpm switch`              | Interactive environment selector               |
| `pnpm status`              | Check current environment, icons, and branch   |

## Deployment

The project uses GitHub Actions for automatic deployment:

1. **Push to `main`** triggers:

   - Sync to `test` branch
   - Production deployment (main branch)
   - Preview deployment (test branch)

2. **Different environments automatically get**:
   - Different icons (production vs preview)
   - Different app names
   - Same codebase with environment-specific branding

## Contributing

1. Work on the `main` branch
2. Use the icon switching commands for local testing
3. Push to `main` - both environments deploy automatically
4. Check both deployments before merging large changes

## License

[Add your license here]
