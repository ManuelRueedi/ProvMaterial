import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Check admin permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin-Berechtigung erforderlich",
    });
  }

  const userId = getRouterParam(event, "userId");

  if (!userId || isNaN(Number(userId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige Benutzer-ID",
    });
  }

  // Prevent users from deleting themselves
  if (Number(userId) === session.user.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Sie können sich nicht selbst löschen",
    });
  }

  const db = useDrizzle();

  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(tables.users.id, Number(userId)),
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Benutzer nicht gefunden",
      });
    }

    // Delete WebAuthn credentials first (cascade should handle this, but let's be explicit)
    await db
      .delete(tables.webauthnCredentials)
      .where(eq(tables.webauthnCredentials.userId, Number(userId)));

    // Delete user
    await db.delete(tables.users).where(eq(tables.users.id, Number(userId)));

    console.log(
      `Admin API: Deleted user ${existingUser.mail} (ID: ${existingUser.id})`,
    );

    return {
      success: true,
      message: "Benutzer erfolgreich gelöscht",
    };
  } catch (error) {
    console.error("Admin API - Error deleting user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Löschen des Benutzers",
    });
  }
});
