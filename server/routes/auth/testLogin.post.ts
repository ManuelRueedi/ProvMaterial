import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Right } from "@/composables/articles/types";

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

    // Get or create test user in database
    const db = useDrizzle();
    const testEmail = "test@example.com";

    let dbUser = await db.query.users.findFirst({
      where: eq(tables.users.mail, testEmail),
    });

    if (!dbUser) {
      console.log("Test user not found in database, creating it");
      // Create new test user
      const expectedRights: Right[] = [
        "useArticles",
        "editArticles",
        "addArticles",
        "removeArticles",
        "admin",
      ];
      const insertResult = await db
        .insert(tables.users)
        .values({
          microsoftID: "test-microsoft-id",
          mail: testEmail,
          firstName: "Test",
          lastName: "Benutzer",
          jobtitle: "Test-Konto",
          rights: expectedRights,
        })
        .returning();

      dbUser = insertResult[0];
      console.log(`Test user created with ID: ${dbUser!.id}`);
    } else {
      console.log(`Test user found with ID: ${dbUser.id}`);

      // Check if test user needs updating (ensure it has all required rights)
      const expectedRights: Right[] = [
        "useArticles",
        "editArticles",
        "addArticles",
        "removeArticles",
        "admin",
      ];
      const currentRights = dbUser.rights || [];
      const needsRightsUpdate = !expectedRights.every((right) =>
        currentRights.includes(right),
      );

      if (needsRightsUpdate) {
        console.log("Updating test user rights");
        const updateResult = await db
          .update(tables.users)
          .set({
            rights: expectedRights,
          })
          .where(eq(tables.users.id, dbUser.id))
          .returning();

        dbUser = updateResult[0] || dbUser;
      }
    }

    if (!dbUser) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create or retrieve test user",
      });
    }

    // Create a test user session
    await setUserSession(
      event,
      {
        user: {
          userId: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName || "",
          mail: dbUser.mail,
          jobtitle: dbUser.jobtitle || "",
          hasWebauthn: false,
          loggedInAt: Date.now(),
        },
        rights:
          dbUser.rights ||
          ([
            "useArticles",
            "editArticles",
            "addArticles",
            "removeArticles",
            "admin",
          ] as Right[]),
        secure: {
          isTestAccount: true,
        },
      },
      {
        // Set session to expire in 30 days for auto-login
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    );

    // Clear any session invalidation flags since user has successfully re-authenticated
    try {
      const invalidationKey = `session:invalidate:${dbUser.id}`;
      await hubKV().del(invalidationKey);
      console.log(
        `Cleared session invalidation flag for test user after successful authentication`,
      );
    } catch (kvError) {
      console.warn(`Failed to clear session invalidation flag:`, kvError);
    }

    console.log(`Test login: Session created for test user (ID: ${dbUser.id})`);

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
