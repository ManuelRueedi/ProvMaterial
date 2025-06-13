#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function setEnvironment(env) {
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

  console.log(`✅ Set environment to: ${env}`);
  console.log(`📝 Updated .env file`);

  if (env === "preview") {
    console.log('🔄 Run "pnpm dev" to see preview badges');
  } else {
    console.log('🔄 Run "pnpm dev" to see production mode');
  }
}

// Parse command line arguments
const environment = process.argv[2];

if (!environment || !["production", "preview"].includes(environment)) {
  console.log("Usage: node scripts/set-environment.js <production|preview>");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/set-environment.js production");
  console.log("  node scripts/set-environment.js preview");
  console.log("");
  console.log("This sets NUXT_PUBLIC_APP_ENV for local development testing.");
  process.exit(1);
}

setEnvironment(environment);
