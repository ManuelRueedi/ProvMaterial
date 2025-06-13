#!/usr/bin/env node

import { copyFileSync, existsSync, readdirSync } from "fs";
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

function switchIcons(environment) {
  const sourceDir = join(projectRoot, "public", `icons-${environment}`);
  const targetDir = join(projectRoot, "public");

  if (!existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`🔄 Switching to ${environment} icons...`);

  // Copy each icon file
  for (const iconFile of iconFiles) {
    const sourcePath = join(sourceDir, iconFile);
    const targetPath = join(targetDir, iconFile);

    if (existsSync(sourcePath)) {
      try {
        copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${iconFile}`);
      } catch (error) {
        console.warn(`⚠️  Failed to copy ${iconFile}: ${error.message}`);
      }
    } else {
      console.warn(`⚠️  Icon not found: ${iconFile} in ${environment} set`);
    }
  }

  console.log(`✨ Successfully switched to ${environment} icons!`);
}

// Parse command line arguments
const environment = process.argv[2];

if (!environment || !["production", "preview"].includes(environment)) {
  console.log("Usage: node scripts/switch-icons.js <production|preview>");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/switch-icons.js production");
  console.log("  node scripts/switch-icons.js preview");
  process.exit(1);
}

switchIcons(environment);
