export default defineEventHandler(async (event) => {
  // Check admin permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Administrator-Berechtigung erforderlich",
    });
  }

  const db = useDrizzle();

  try {
    // Get all users with basic info
    const users = await db
      .select({
        id: tables.users.id,
        microsoftID: tables.users.microsoftID,
        mail: tables.users.mail,
        firstName: tables.users.firstName,
        lastName: tables.users.lastName,
        jobtitle: tables.users.jobtitle,
        rights: tables.users.rights,
      })
      .from(tables.users); // Get WebAuthn credentials for all users
    const webauthnCreds = await db
      .select({
        userId: tables.webauthnCredentials.userId,
        id: tables.webauthnCredentials.id,
      })
      .from(tables.webauthnCredentials); // Combine user data with WebAuthn info
    const usersWithWebAuthn = users.map((user) => {
      const userCreds = webauthnCreds.filter((cred) => cred.userId === user.id);
      const hasWebauthn = userCreds.length > 0;

      return {
        id: user.id,
        microsoftID: user.microsoftID,
        mail: user.mail,
        firstName: user.firstName,
        lastName: user.lastName,
        jobtitle: user.jobtitle || "",
        rights: user.rights || [],
        hasWebauthn,
        credentialCount: userCreds.length,
        lastLogin: null, // Not available in current schema
      };
    });

    return usersWithWebAuthn;
  } catch (error) {
    console.error("Admin API - Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Laden der Benutzerdaten",
    });
  }
});
