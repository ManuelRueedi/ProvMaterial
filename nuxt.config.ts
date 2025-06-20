// https://nuxt.com/docs/api/configuration/nuxt-config

// Environment detection function that follows Nuxt Hub patterns
export function getEnvironment() {
  // Nuxt Hub environments: 'production', 'preview', 'development'
  const hubEnv = process.env.NUXT_HUB_ENV;
  const customEnv = process.env.NUXT_PUBLIC_APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

  // Priority: NUXT_HUB_ENV > NUXT_PUBLIC_APP_ENV > NODE_ENV
  if (hubEnv) return hubEnv;
  if (customEnv) return customEnv;
  if (nodeEnv === "development") return "development";

  return "production";
}

// Determine icon folder based on environment
function getIconFolder() {
  const env = getEnvironment();
  return env === "preview" ? "preview" : "production";
}

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: `/icons-${getIconFolder()}/favicon.ico`,
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: `/icons-${getIconFolder()}/apple-touch-icon-180x180.png`,
        },
      ],
    },
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
    "@nuxtjs/device",
    "nuxt-maplibre",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    manifest: {
      name:
        getEnvironment() === "preview"
          ? "Provmaterial (Preview)"
          : "Provmaterial",
      short_name:
        getEnvironment() === "preview"
          ? "Provmaterial Preview"
          : "Provmaterial",
      description: "Provmaterial - Material Management",
      theme_color: "#10b981",
      background_color: "#222",
      display: "standalone",
      orientation: "portrait",
      lang: "de",
      start_url: "/",
      scope: "/",
      categories: ["productivity", "business", "utilities"],
      icons: [
        {
          src: `icons-${getIconFolder()}/pwa-64x64.png`,
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: `icons-${getIconFolder()}/pwa-192x192.png`,
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: `icons-${getIconFolder()}/pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: `icons-${getIconFolder()}/maskable-icon-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    client: {
      installPrompt: true,
      registerPlugin: false,
    },
    registerType: "autoUpdate",
    devOptions: {
      enabled: true,
    },
  },
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Roboto", provider: "google", weights: [300, 400, 500, 700] },
    ],
  },
  hub: {
    database: true,
    kv: true,
    blob: true,
    cache: false,
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
      appEnv: getEnvironment(),
    },
  },
});
