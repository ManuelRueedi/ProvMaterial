export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (to.path !== "/login" && !loggedIn.value) {
    return navigateTo("/login");
  }
  return;
});
