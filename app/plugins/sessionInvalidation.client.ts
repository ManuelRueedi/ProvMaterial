export default defineNuxtPlugin((nuxtApp) => {
  const { clear: logout } = useUserSession();

  // Handle global $fetch errors by intercepting the default instance
  const originalFetch = globalThis.$fetch;
  globalThis.$fetch = originalFetch.create({
    onResponseError({ response }) {
      //  handle session invalidation errors
      if (response.status === 401) {
        const message = response._data?.message || response.statusText || "";
        const isSessionInvalidation = message.includes(
          "Session invalidated due to permission changes",
        );

        // Only handle if it's specifically a session invalidation error
        if (isSessionInvalidation) {
          logout();
          // Prevent further error handling by other systems
          return;
        }
      }
    },
  });

  // Also handle errors from useFetch/useLazyFetch and other app errors
  nuxtApp.hook("app:error", (error: unknown) => {
    // handle session invalidation errors
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 401 &&
      "statusMessage" in error &&
      typeof error.statusMessage === "string"
    ) {
      const isSessionInvalidation = error.statusMessage.includes(
        "Session invalidated due to permission changes",
      );

      // Only handle if it's specifically a session invalidation error
      if (isSessionInvalidation) {
        // Mark the error as handled to prevent further processing
        if ("handled" in error) {
          (error as { handled: boolean }).handled = true;
        }
      }
    }
  });
});
