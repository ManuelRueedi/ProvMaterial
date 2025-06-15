/**
 * Session invalidation utilities for handling user permission changes
 */

/**
 * Check if a user's session should be invalidated
 * @param userId - The user ID to check
 * @param loggedInAt - When the user's current session was created
 * @returns Promise<boolean> - True if session should be invalidated
 */
export async function shouldInvalidateSession(
  userId: number,
  loggedInAt: number,
): Promise<boolean> {
  try {
    const invalidationKey = `session:invalidate:${userId}`;
    const invalidationTimestamp = await hubKV().get<number>(invalidationKey);

    // If no invalidation timestamp exists, session is valid
    if (!invalidationTimestamp) {
      return false;
    }

    // If session was created before the invalidation timestamp, invalidate it
    return loggedInAt < invalidationTimestamp;
  } catch (error) {
    console.warn(
      `Failed to check session invalidation for user ${userId}:`,
      error,
    );
    // In case of error, don't invalidate to avoid disrupting user experience
    return false;
  }
}

/**
 * Clear the session invalidation flag for a user (called after successful re-authentication)
 * @param userId - The user ID to clear invalidation for
 */
export async function clearSessionInvalidation(userId: number): Promise<void> {
  try {
    const invalidationKey = `session:invalidate:${userId}`;
    await hubKV().del(invalidationKey);
    console.log(`Cleared session invalidation flag for user ${userId}`);
  } catch (error) {
    console.warn(
      `Failed to clear session invalidation for user ${userId}:`,
      error,
    );
  }
}

/**
 * Mark all sessions for a user as invalid
 * @param userId - The user ID to invalidate sessions for
 * @param reason - Optional reason for invalidation (for logging)
 */
export async function invalidateUserSessions(
  userId: number,
  reason?: string,
): Promise<void> {
  try {
    const invalidationKey = `session:invalidate:${userId}`;
    const timestamp = Date.now();
    await hubKV().set(invalidationKey, timestamp, { ttl: 60 * 60 * 24 * 30 }); // 30 days TTL

    console.log(
      `Invalidated all sessions for user ${userId}${reason ? ` (reason: ${reason})` : ""}`,
    );
  } catch (error) {
    console.warn(`Failed to invalidate sessions for user ${userId}:`, error);
    throw error;
  }
}
