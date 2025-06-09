// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    keepalive: true,
  },
  compatibilityDate: "2025-04-15",
  // Nuxt 4 directory structure and features
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },
  // Nuxt Modules
  // https://nuxt.com/modules
  modules: [
    "@nuxthub/core",
    "@nuxt/eslint",
    "nuxt-auth-utils",
    "@nuxt/ui",
    "@compodium/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/device",
    "nuxt-maplibre",
    "@vite-pwa/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Roboto", provider: "google", weights: [300, 400, 500, 700] },
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: "./app/components/ui",
  },
  hub: {
    database: true,
    kv: true,
    blob: true,
    cache: true,
    remote: process.env.CI ? false : true,
  },
  vite: {
    optimizeDeps: {
      include: ["maplibre-gl"],
    },
  },
  // Development
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  // Auth
  auth: {
    webAuthn: true,
  },
  runtimeConfig: {
    oauth: {
      // provider in lowercase (github, google, etc.)
      microsoft: {},
    },
    public: {
      testLoginEnabled: process.env.NUXT_TEST_LOGIN_ENABLED === "true",
    },
  },
  pwa: {
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200],
            },
            backgroundSync: {
              name: "api-background-sync",
              options: {
                maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
              },
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    manifest: {
      name: "ProvMaterial - Material Management",
      short_name: "ProvMaterial",
      description:
        "Professional material and inventory management application with QR code scanning and location tracking",
      theme_color: "#10b981",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait-primary",
      scope: "/",
      start_url: "/",
      categories: ["business", "productivity", "utilities"],
      lang: "en",
      dir: "ltr",
      icons: [
        {
          src: "/pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
      shortcuts: [
        {
          name: "Scan QR Code",
          short_name: "Scan",
          description: "Quickly scan QR codes for material lookup",
          url: "/articles/takeOut",
          icons: [{ src: "/icon.svg", sizes: "96x96" }],
        },
        {
          name: "Take Out Material",
          short_name: "Take Out",
          description: "Take out materials from inventory",
          url: "/articles/takeOut",
          icons: [{ src: "/icon.svg", sizes: "96x96" }],
        },
        {
          name: "Bring Back Material",
          short_name: "Bring Back",
          description: "Return materials to inventory",
          url: "/articles/bringBack",
          icons: [{ src: "/icon.svg", sizes: "96x96" }],
        },
      ],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },
});
