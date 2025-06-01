export default defineNuxtRouteMiddleware((to, from) => {
  const userSession = useUserSession();

  const toast = useToast();

  if (to.path !== "/login" && !userSession.loggedIn.value) {
    toast.add({
      title: "Bitte Anmelden!",
      icon: "ic:baseline-close",
      color: "info",
    });
    return navigateTo("/login");
  }
  if (
    to.path == "/articles/takeOut" &&
    !userSession.session.value?.rights.useArticles
  ) {
    toast.add({
      title: "Keine Berechtigung!",
      icon: "ic:baseline-close",
      color: "error",
    });
    return navigateTo("/");
  }
  return;
});
