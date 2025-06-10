import { z } from "zod";

const testLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default defineEventHandler(async (event) => {
  // Only allow test login in development or when explicitly enabled
  const allowTestLogin =
    process.env.NUXT_TEST_LOGIN_ENABLED === "true" || import.meta.dev;

  if (!allowTestLogin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Test login is not enabled",
    });
  }

  const body = await readBody(event);

  try {
    const { password } = testLoginSchema.parse(body);

    // Simple password check
    const testPassword = process.env.NUXT_TEST_LOGIN_PASSWORD || "test123";

    if (password !== testPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid test password",
      });
    }

    // Create a test user session
    await setUserSession(
      event,
      {
        user: {
          userId: "test-user-id",
          firstName: "Test",
          lastName: "Benutzer",
          mail: "test@example.com",
          jobtitle: "Test-Konto",
          hasWebauthn: false,
          loggedInAt: Date.now(),
        },
        rights: ["useArticles", "editArticles", "addArticles", "admin"],
        secure: {
          isTestAccount: true,
        },
      },
      {
        // Set session to expire in 30 days for auto-login
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    );

    // Set a remember me cookie for auto-login
    setCookie(event, "remember-login", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("Test login: Session created for test user");

    return {
      success: true,
      message: "Test-Anmeldung erfolgreich",
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0]?.message || "Validation error",
      });
    }
    throw error;
  }
});
