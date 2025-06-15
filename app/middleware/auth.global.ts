export default defineNuxtRouteMiddleware((to) => {
  const userSession = useUserSession();

  if (
    to.path == "/articles/takeOut" ||
    to.path == "/" ||
    to.path == "/articles/bringBack"
  ) {
    if (!userSession.loggedIn.value) {
      if (to.path == "/") {
        return navigateTo("/login");
      }
      return navigateTo("/login?error=noLogin");
    } else if (!userSession.session.value?.rights?.includes("useArticles")) {
      return navigateTo("/login?error=noRight-useArticles");
    }
  }

  if (to.path == "/admin" && !userSession.loggedIn.value) {
    return navigateTo("/login?error=noLogin");
  }

  return;
});
