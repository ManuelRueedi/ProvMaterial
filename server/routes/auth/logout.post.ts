export default defineEventHandler(async (event) => {
  try {
    // Clear the user session
    await clearUserSession(event);

    // Clear the remember-login cookie
    deleteCookie(event, "remember-login");

    console.log("User logged out successfully");

    return {
      success: true,
      message: "Erfolgreich abgemeldet",
    };
  } catch (error) {
    console.error("Logout error:", error);

    // Still try to clear cookies even if session clearing fails
    deleteCookie(event, "remember-login");

    throw createError({
      statusCode: 500,
      statusMessage: "Logout failed",
    });
  }
});
