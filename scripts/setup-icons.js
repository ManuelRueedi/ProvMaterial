#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const iconFiles = [
  "favicon.ico",
  "icon.svg",
  "apple-touch-icon-180x180.png",
  "maskable-icon-512x512.png",
  "pwa-192x192.png",
  "pwa-512x512.png",
  "pwa-64x64.png",
];

function setupIconDirectories() {
  const publicDir = join(projectRoot, "public");
  const productionDir = join(publicDir, "icons-production");
  const previewDir = join(publicDir, "icons-preview");

  // Create directories if they don't exist
  if (!existsSync(productionDir)) {
    mkdirSync(productionDir, { recursive: true });
    console.log("✅ Created icons-production directory");
  }

  if (!existsSync(previewDir)) {
    mkdirSync(previewDir, { recursive: true });
    console.log("✅ Created icons-preview directory");
  }

  // Copy current icons to production directory if it's empty
  let productionDirEmpty = true;
  let previewDirEmpty = true;

  try {
    productionDirEmpty = !iconFiles.some((file) =>
      existsSync(join(productionDir, file)),
    );
    previewDirEmpty = !iconFiles.some((file) =>
      existsSync(join(previewDir, file)),
    );
  } catch (error) {
    // Directories might not exist or be readable
  }

  if (productionDirEmpty) {
    console.log("📁 Setting up production icons...");
    for (const iconFile of iconFiles) {
      const sourcePath = join(publicDir, iconFile);
      const targetPath = join(productionDir, iconFile);

      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${iconFile} to production`);
      }
    }
  }

  if (previewDirEmpty) {
    console.log("📁 Setting up preview icons (copying from production)...");
    for (const iconFile of iconFiles) {
      const sourcePath = join(productionDir, iconFile);
      const targetPath = join(previewDir, iconFile);

      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${iconFile} to preview`);
      }
    }
  }

  console.log("");
  console.log("🎨 Icon directories are set up!");
  console.log("");
  console.log("Next steps:");
  console.log(
    "1. Replace icons in public/icons-preview/ with your preview versions",
  );
  console.log(
    '2. Use "pnpm icons:production" or "pnpm icons:preview" to switch locally',
  );
  console.log("3. Push to main branch for production deployment");
  console.log("4. Push to test branch for preview deployment");
}

setupIconDirectories();
