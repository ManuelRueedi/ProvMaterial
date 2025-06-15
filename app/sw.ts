// Custom service worker for ProvMaterial PWA
// This is a minimal service worker that enables PWA installation
// without adding caching or other functionality that might interfere

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Clean up old caches
cleanupOutdatedCaches();

// Precache and route files (empty array means no automatic precaching)
precacheAndRoute(self.__WB_MANIFEST || []);

// Basic installation event
self.addEventListener("install", (_event) => {
  console.log("ProvMaterial PWA Service Worker installed");
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activation event
self.addEventListener("activate", (event) => {
  console.log("ProvMaterial PWA Service Worker activated");
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Basic fetch handler that just passes through requests
self.addEventListener("fetch", (_event) => {
  // Don't handle requests - let them go through normally
  // This prevents any caching interference
  return;
});
