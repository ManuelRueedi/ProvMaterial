/**
 * Authentication retry mechanism and utility functions
 */
import type { H3Event } from "h3";

// Track failed authentication attempts per IP
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const getClientIP = (event: H3Event): string => {
  return (
    getHeader(event, "x-forwarded-for") ||
    getHeader(event, "x-real-ip") ||
    "unknown"
  );
};

export const isRateLimited = (ip: string): boolean => {
  const attempts = authAttempts.get(ip);
  if (!attempts) return false;

  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;
  const rateLimitWindow = 15 * 60 * 1000; // 15 minutes

  // Reset attempts if enough time has passed
  if (timeSinceLastAttempt > rateLimitWindow) {
    authAttempts.delete(ip);
    return false;
  }

  // Rate limit after 5 failed attempts
  return attempts.count >= 5;
};

export const recordFailedAttempt = (ip: string): void => {
  const attempts = authAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  authAttempts.set(ip, attempts);

  // Start cleanup process lazily when first attempt is recorded
  startCleanupIfNeeded();
};

export const clearFailedAttempts = (ip: string): void => {
  authAttempts.delete(ip);
};

export const getRetryDelay = (attemptCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
  return Math.min(1000 * Math.pow(2, attemptCount - 1), 16000);
};

// Track cleanup interval to avoid multiple instances
let cleanupIntervalId: NodeJS.Timeout | null = null;

// Start cleanup process lazily (only when first authentication attempt happens)
const startCleanupIfNeeded = () => {
  if (cleanupIntervalId !== null) return; // Already started

  cleanupIntervalId = setInterval(
    () => {
      const now = Date.now();
      const cleanupThreshold = 60 * 60 * 1000; // 1 hour

      for (const [ip, attempts] of authAttempts.entries()) {
        if (now - attempts.lastAttempt > cleanupThreshold) {
          authAttempts.delete(ip);
        }
      }
    },
    10 * 60 * 1000,
  ); // Clean up every 10 minutes
};

// Export cleanup starter for use in middleware or when needed
export const ensureCleanupStarted = startCleanupIfNeeded;
