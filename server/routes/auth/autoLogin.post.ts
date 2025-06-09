export default defineEventHandler(async (event) => {
  try {
    // Check if user has a remember-login cookie
    const rememberLogin = getCookie(event, "remember-login");

    if (!rememberLogin) {
      throw createError({
        statusCode: 401,
        statusMessage: "No auto-login cookie found",
      });
    }

    // Check if there's an existing valid session
    const session = await getUserSession(event);

    if (!session?.user) {
      // Clear the remember cookie if no valid session exists
      deleteCookie(event, "remember-login");
      throw createError({
        statusCode: 401,
        statusMessage: "No valid session found",
      });
    }

    // Session exists and is valid
    console.log(
      `Auto-login: Valid session found for user ${session.user.mail}`,
    );

    // Validate session freshness (check if it's not too old)
    const sessionAge = Date.now() - (session.user.loggedInAt || 0);
    const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    if (sessionAge > maxSessionAge) {
      // Clear expired session and cookie
      await clearUserSession(event);
      deleteCookie(event, "remember-login");
      throw createError({
        statusCode: 401,
        statusMessage: "Session expired",
      });
    } // Session is valid - return success
    return {
      success: true,
      message: "Auto-login successful",
      user: {
        userId: session.user.userId,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        mail: session.user.mail,
        jobtitle: session.user.jobtitle,
        hasWebauthn: session.user.hasWebauthn,
      },
      rights: session.rights,
    };
  } catch (error) {
    console.error("Auto-login error:", error);

    // Clean up any partial state
    await clearUserSession(event);
    deleteCookie(event, "remember-login");

    throw error;
  }
});
