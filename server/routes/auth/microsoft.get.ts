import { eq } from "drizzle-orm";

export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ["User.Read", "offline_access"],
    authorizationParams: {
      prompt: "select_account",
    },
  },

  async onSuccess(event, { user }) {
    try {
      // Validate required user data
      if (!user?.id || !user?.mail || !user?.givenName) {
        console.error("Microsoft OAuth: Missing required user data", {
          hasId: !!user?.id,
          hasMail: !!user?.mail,
          hasGivenName: !!user?.givenName,
        });
        throw createError({
          statusCode: 400,
          statusMessage: "Incomplete user data from Microsoft",
        });
      }

      // Check if user email is from @shpower.ch domain
      if (!user.mail.endsWith("@shpower.ch")) {
        console.log(`Unauthorized login attempt from: ${user.mail}`);
        return sendRedirect(event, "/login?error=unauthorized");
      }

      console.log(
        `Microsoft OAuth: Successful authentication for ${user.mail}`,
      );

      let dbUser;
      try {
        // Use database transaction for atomic operations
        dbUser = await useDrizzle().transaction(async (tx) => {
          // Check if the user is already in database based on microsoftID
          const userData = await tx.query.users.findFirst({
            where: (users, { eq }) => eq(users.microsoftID, user.id),
          });

          if (!userData) {
            console.log("User not found in database, creating it");
            // Create new user
            const insertResult = await tx
              .insert(tables.users)
              .values({
                microsoftID: user.id,
                mail: user.mail,
                firstName: user.givenName,
                lastName: user.surname || "",
                jobtitle: user.jobTitle || "",
                rights: ["useArticles", "addArticles"],
              })
              .returning();

            return insertResult[0];
          } else {
            // Check if the user has changed his name or job title
            const needsUpdate =
              userData.firstName !== user.givenName ||
              userData.lastName !== (user.surname || "") ||
              userData.jobtitle !== (user.jobTitle || "");

            if (needsUpdate) {
              console.log(
                "User found in database, updating profile information",
              );
              // Update the user in the database
              const updateResult = await tx
                .update(tables.users)
                .set({
                  firstName: user.givenName,
                  lastName: user.surname || "",
                  jobtitle: user.jobTitle || "",
                })
                .where(eq(tables.users.microsoftID, user.id))
                .returning();

              return updateResult[0];
            }

            return userData;
          }
        });
      } catch (dbError) {
        console.error("Database transaction failed:", dbError);

        // Try a fallback approach without transaction
        try {
          console.log(
            "Attempting fallback database operation without transaction",
          );

          // Check if the user is already in database based on microsoftID
          const userData = await useDrizzle().query.users.findFirst({
            where: (users, { eq }) => eq(users.microsoftID, user.id),
          });

          if (!userData) {
            console.log("Creating user without transaction");
            const insertResult = await useDrizzle()
              .insert(tables.users)
              .values({
                microsoftID: user.id,
                mail: user.mail,
                firstName: user.givenName,
                lastName: user.surname || "",
                jobtitle: user.jobTitle || "",
                rights: ["useArticles", "addArticles"],
              })
              .returning();

            dbUser = insertResult[0];
          } else {
            // Check if the user needs updating
            const needsUpdate =
              userData.firstName !== user.givenName ||
              userData.lastName !== (user.surname || "") ||
              userData.jobtitle !== (user.jobTitle || "");

            if (needsUpdate) {
              console.log("Updating user without transaction");
              const updateResult = await useDrizzle()
                .update(tables.users)
                .set({
                  firstName: user.givenName,
                  lastName: user.surname || "",
                  jobtitle: user.jobTitle || "",
                })
                .where(eq(tables.users.microsoftID, user.id))
                .returning();

              dbUser = updateResult[0];
            } else {
              dbUser = userData;
            }
          }
        } catch (fallbackError) {
          console.error(
            "Fallback database operation also failed:",
            fallbackError,
          );
          throw createError({
            statusCode: 500,
            statusMessage: "Database operation failed",
          });
        }
      }

      if (!dbUser) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to create or retrieve user",
        });
      }

      // Check if user has WebAuthn credentials
      const hasWebauthn =
        await useDrizzle().query.webauthnCredentials.findFirst({
          where: (credentials, { eq }) => eq(credentials.userId, dbUser.id),
        });

      // Create user session
      await setUserSession(
        event,
        {
          user: {
            userId: dbUser.id,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            mail: dbUser.mail,
            jobtitle: dbUser.jobtitle,
            hasWebauthn: !!hasWebauthn,
            loggedInAt: Date.now(),
          },
          rights: dbUser.rights || [],
          secure: {
            microsoftId: dbUser.microsoftID,
          },
        },
        {
          // Set session to expire in 30 days for auto-login
          maxAge: 60 * 60 * 24 * 30, // 30 days
        },
      );

      console.log(
        `Microsoft OAuth: Session created for user ${dbUser.mail} (ID: ${dbUser.id})`,
      );

      // Set a remember me cookie for auto-login
      setCookie(event, "remember-login", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return sendRedirect(event, "/");
    } catch (error) {
      console.error("Microsoft OAuth onSuccess error:", error);

      // Type guard for H3 errors
      if (error && typeof error === "object" && "statusCode" in error) {
        throw error;
      }

      // For other error types, wrap in H3 error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw createError({
        statusCode: 500,
        statusMessage: `Internal authentication error: ${errorMessage}`,
      });
    }
  },

  // Enhanced error handling
  onError(event, error) {
    console.error("Microsoft OAuth error:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
    });

    // Clear any partial authentication state
    clearUserSession(event);

    // Determine error type and redirect appropriately
    if (error.message?.includes("access_denied")) {
      return sendRedirect(event, "/login?error=access_denied");
    } else if (error.message?.includes("invalid_request")) {
      return sendRedirect(event, "/login?error=invalid_request");
    } else if (error.statusCode === 400) {
      return sendRedirect(event, "/login?error=bad_request");
    }

    return sendRedirect(event, "/login?error=auth_error");
  },
});
