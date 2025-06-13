#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function switchEnvironment(env) {
  console.log(`🔄 Switching to ${env} environment...`);

  // Set environment variable
  setEnvironmentVariable(env);

  // Switch icons
  switchIcons(env);

  console.log(`✨ Successfully switched to ${env} environment!`);
  console.log("");
  console.log("🚀 Ready to run:");
  console.log("  pnpm dev    - Start development server");
  console.log("  pnpm build  - Build for production");
}

function setEnvironmentVariable(env) {
  const envFile = join(projectRoot, ".env");

  let envContent = "";

  // Read existing .env if it exists
  if (existsSync(envFile)) {
    try {
      envContent = readFileSync(envFile, "utf8");
    } catch (error) {
      console.warn("Could not read existing .env file:", error.message);
    }
  }

  // Remove existing NUXT_PUBLIC_APP_ENV line if present
  const lines = envContent
    .split("\n")
    .filter((line) => !line.startsWith("NUXT_PUBLIC_APP_ENV="));

  // Add the new environment variable
  lines.push(`NUXT_PUBLIC_APP_ENV=${env}`);

  // Write back to .env file
  writeFileSync(envFile, lines.join("\n"));

  console.log(`📝 Set NUXT_PUBLIC_APP_ENV=${env}`);
}

function switchIcons(env) {
  const iconFiles = [
    "favicon.ico",
    "icon.svg",
    "apple-touch-icon-180x180.png",
    "maskable-icon-512x512.png",
    "pwa-192x192.png",
    "pwa-512x512.png",
    "pwa-64x64.png",
  ];

  const sourceDir = join(projectRoot, "public", `icons-${env}`);
  const targetDir = join(projectRoot, "public");

  if (!existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  // Copy each icon file
  for (const iconFile of iconFiles) {
    const sourcePath = join(sourceDir, iconFile);
    const targetPath = join(targetDir, iconFile);

    if (existsSync(sourcePath)) {
      try {
        copyFileSync(sourcePath, targetPath);
        console.log(`🎨 Updated ${iconFile}`);
      } catch (error) {
        console.warn(`⚠️  Failed to copy ${iconFile}: ${error.message}`);
      }
    } else {
      console.warn(`⚠️  Icon not found: ${iconFile} in ${env} set`);
    }
  }
}

// Parse command line arguments
const environment = process.argv[2];

if (!environment) {
  // Interactive mode - ask user to choose
  console.log("🎯 Environment Switcher");
  console.log("");
  console.log("Choose environment:");
  console.log("  1. Production (main branch environment)");
  console.log("  2. Preview (test branch environment)");
  console.log("");
  console.log("Usage: node scripts/switch-environment.js <production|preview>");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/switch-environment.js production");
  console.log("  node scripts/switch-environment.js preview");
  console.log("  pnpm switch production");
  console.log("  pnpm switch preview");
  process.exit(0);
}

if (!["production", "preview"].includes(environment)) {
  console.error('❌ Invalid environment. Use "production" or "preview"');
  process.exit(1);
}

switchEnvironment(environment);
