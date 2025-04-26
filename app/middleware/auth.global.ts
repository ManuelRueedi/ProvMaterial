export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (to.path !== "/login" && !loggedIn) {
    navigateTo({ path: "/login" });
  }
});
