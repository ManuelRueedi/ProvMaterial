export default defineEventHandler(async (event) => {
  try {
    // Check if the user has a valid session
    const userSession = await getUserSession(event);

    if (!userSession?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "No valid session to refresh",
      });
    }

    // Check session age - only refresh if it's at least 1 day old
    const sessionAge = Date.now() - userSession.user.loggedInAt;
    const minRefreshAge = 24 * 60 * 60 * 1000; // 1 day

    if (sessionAge < minRefreshAge) {
      return {
        success: true,
        message: "Session is still fresh",
        refreshed: false,
      };
    }

    // Check if session is close to expiring (within 7 days)
    const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const timeUntilExpiry = maxSessionAge - sessionAge;
    const refreshThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (timeUntilExpiry > refreshThreshold) {
      return {
        success: true,
        message: "Session does not need refresh yet",
        refreshed: false,
      };
    }

    // Refresh the session by updating the loggedInAt timestamp
    await setUserSession(
      event,
      {
        user: {
          ...userSession.user,
          loggedInAt: Date.now(),
        },
        rights: userSession.rights,
        secure: userSession.secure,
      },
      {
        // Extend session for another 30 days
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    );

    // Refresh the remember-login cookie
    setCookie(event, "remember-login", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log(
      `Session refreshed for user ${userSession.user.mail} (ID: ${userSession.user.userId})`,
    );

    return {
      success: true,
      message: "Session refreshed successfully",
      refreshed: true,
    };
  } catch (error: unknown) {
    console.error("Session refresh error:", error);

    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to refresh session",
    });
  }
});
