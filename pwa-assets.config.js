import { defineConfig } from "@vite-pwa/assets-generator/config";

// Environment detection function matching Nuxt Hub strategy
function getEnvironment() {
  // Priority: NUXT_HUB_ENV > NUXT_PUBLIC_APP_ENV > NODE_ENV
  const hubEnv = process.env.NUXT_HUB_ENV;
  const customEnv = process.env.NUXT_PUBLIC_APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

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

export default defineConfig({
  preset: "minimal", // Options: 'minimal', 'android', 'windows', 'ios', 'all'
  images: [`public/icons-${getIconFolder()}/icon.svg`],
  headLinkOptions: {
    preset: "2023",
  },
});
