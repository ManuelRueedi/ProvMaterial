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
});
