export default defineNuxtRouteMiddleware(async (to) => {
  const userSession = useUserSession();
  const toast = useToast();

  // Skip auth check for login page
  if (to.path === "/login") {
    return;
  }

  // If not logged in, try auto-login first (but only if remember-login cookie exists)
  if (!userSession.loggedIn.value) {
    // Check if remember-login cookie exists before attempting auto-login
    const hasRememberCookie = useCookie("remember-login").value;

    if (hasRememberCookie) {
      try {
        // Try auto-login since remember-login cookie exists
        const autoLoginResult = await $fetch("/auth/autoLogin", {
          method: "POST",
        });

        if (autoLoginResult.success) {
          // Fetch the updated session
          await userSession.fetch();

          // If successful, continue with normal flow
          if (userSession.loggedIn.value) {
            // Show welcome back message
            toast.add({
              title: "Willkommen zurück!",
              description: "Sie wurden automatisch angemeldet.",
              color: "success",
              icon: "i-heroicons-check-circle",
            });
            return;
          }
        }
      } catch (error) {
        // Auto-login failed, remove the invalid cookie
        const rememberCookie = useCookie("remember-login");
        rememberCookie.value = null;
        console.log("Auto-login failed, removed invalid cookie:", error);
      }
    }

    // Redirect to login with appropriate message
    toast.add({
      title: "Bitte Anmelden!",
      description: "Sie müssen sich anmelden, um diese Seite zu besuchen.",
      icon: "i-heroicons-exclamation-circle",
      color: "info",
    });
    return navigateTo("/login");
  }

  // Check session freshness
  const user = userSession.session.value?.user;
  if (user?.loggedInAt) {
    const sessionAge = Date.now() - user.loggedInAt;
    const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (sessionAge > maxSessionAge) {
      // Session is too old, clear it and redirect to login
      await userSession.clear();
      toast.add({
        title: "Sitzung abgelaufen",
        description:
          "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        icon: "i-heroicons-clock",
        color: "warning",
      });
      return navigateTo("/login?error=session_expired");
    }
  }

  // Check specific route permissions
  const userRights = userSession.session.value?.rights || [];

  if (to.path === "/articles/takeOut" && !userRights.includes("useArticles")) {
    toast.add({
      title: "Keine Berechtigung!",
      description: "Sie haben keine Berechtigung, Artikel zu verwenden.",
      icon: "i-heroicons-shield-exclamation",
      color: "error",
    });
    return navigateTo("/");
  }

  if (to.path?.startsWith("/admin") && !userRights.includes("admin")) {
    toast.add({
      title: "Admin-Berechtigung erforderlich!",
      description: "Sie haben keine Berechtigung für den Admin-Bereich.",
      icon: "i-heroicons-shield-exclamation",
      color: "error",
    });
    return navigateTo("/");
  }

  return;
});
