/**
 * Composable for automatic session refresh
 * Automatically refreshes user sessions when they're close to expiring
 */
export const useSessionRefresh = () => {
  const { loggedIn, session } = useUserSession();

  // Track if we're currently refreshing to avoid multiple concurrent requests
  const isRefreshing = ref(false);
  let refreshTimer: NodeJS.Timeout | null = null;

  const checkAndRefreshSession = async () => {
    if (!loggedIn.value || !session.value?.user || isRefreshing.value) {
      return;
    }

    try {
      isRefreshing.value = true;

      // Use the session refresh endpoint instead of auto-login
      const result = await $fetch("/auth/refreshSession", {
        method: "POST",
      });

      if (result.refreshed) {
        console.log("Session automatically refreshed");
      }
    } catch (error) {
      console.log("Session refresh failed:", error);
      // Don't show user errors for automatic refresh failures
    } finally {
      isRefreshing.value = false;
    }
  };

  const startAutoRefresh = () => {
    // Only start timers on client side
    if (!import.meta.client) return;

    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    // Check for session refresh every 4 hours (less frequent than auto-login attempts)
    refreshTimer = setInterval(checkAndRefreshSession, 4 * 60 * 60 * 1000);

    // Also check once after 5 minutes of being logged in
    setTimeout(checkAndRefreshSession, 5 * 60 * 1000);
  };

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  // Only start auto-refresh on client side and when mounted
  if (import.meta.client) {
    watch(
      loggedIn,
      (isLoggedIn) => {
        if (isLoggedIn) {
          startAutoRefresh();
        } else {
          stopAutoRefresh();
        }
      },
      { immediate: true },
    );
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    isRefreshing: readonly(isRefreshing),
    checkAndRefreshSession,
    startAutoRefresh,
    stopAutoRefresh,
  };
};
