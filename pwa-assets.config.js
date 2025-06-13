import { defineConfig } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: "minimal", // Options: 'minimal', 'android', 'windows', 'ios', 'all'
  images: ["public/icon.svg"],
  headLinkOptions: {
    preset: "2023",
  },
});
