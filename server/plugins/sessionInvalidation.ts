/**
 * Session invalidation check plugin
 * This plugin runs on every request to check if the user's session should be invalidated
 * due to admin changes to their permissions
 */

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    // Skip session check for certain paths
    const url = getRequestURL(event);
    const skipPaths = [
      "/auth/",
      "/api/auth/",
      "/login",
      "/_nuxt/",
      "/favicon.ico",
      "/__nuxt_error",
    ];

    if (skipPaths.some((path) => url.pathname.startsWith(path))) {
      return;
    }

    try {
      // Get current user session
      const userSession = await getUserSession(event);

      // Only check for session invalidation if there's actually a session
      // Let the normal auth middleware handle cases where there's no session
      if (!userSession?.user?.userId || !userSession?.user?.loggedInAt) {
        return; // No session - let normal auth flow handle this
      }

      // Check if this user's sessions should be invalidated
      const invalidationKey = `session:invalidate:${userSession.user.userId}`;
      const invalidationTimestamp = await hubKV().get<number>(invalidationKey);

      if (
        invalidationTimestamp &&
        userSession.user.loggedInAt < invalidationTimestamp
      ) {
        // Clear the user session completely
        await clearUserSession(event);

        // Also clear the session cookie explicitly
        deleteCookie(event, "nuxt-user-session");

        // If this is an API request, throw an error
        if (url.pathname.startsWith("/api/")) {
          throw createError({
            statusCode: 401,
            statusMessage:
              "Session invalidated due to permission changes. Please re-authenticate.",
          });
        }

        // For regular page requests, redirect to login
        if (!url.pathname.startsWith("/login")) {
          await sendRedirect(event, "/login?error=session_expired");
        }
      }
    } catch (error) {
      // Don't fail the request if session check fails, just log it
      if (error && typeof error === "object" && "statusCode" in error) {
        // Re-throw HTTP errors (like 401)
        throw error;
      }

      console.warn("❌ Session invalidation check failed:", error);
    }
  });
});
