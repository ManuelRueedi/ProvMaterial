export default defineOAuthMicrosoftEventHandler({
  // scopes are optional – default is ['User.Read']
  config: { scope: ["User.Read", "offline_access"] },

  async onSuccess(event, { user, tokens }) {
    // Persist only what you need
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.userPrincipalName,
        name: user.displayName,
      },
      loggedInAt: Date.now(),
      // Optionally keep access/refresh tokens in the secure part:
      secure: {
        msAccess: tokens.access_token,
        msRefresh: tokens.refresh_token,
      },
    });
    return sendRedirect(event, "/");
  },
});
