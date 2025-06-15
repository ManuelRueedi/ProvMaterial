import { eq } from "drizzle-orm";

export default defineWebAuthnAuthenticateEventHandler({
  async storeChallenge(event, challenge, attemptId) {
    await hubKV().set(`auth:challenge:${attemptId}`, challenge, { ttl: 60 });
  },
  async getChallenge(event, attemptId) {
    const challenge = await hubKV().get<string>(`auth:challenge:${attemptId}`);
    if (!challenge) {
      throw createError({
        statusCode: 400,
        statusMessage: "Challenge not found or expired",
      });
    }
    await hubKV().del(`auth:challenge:${attemptId}`);
    return challenge;
  },

  async allowCredentials(event, userName) {
    const user = await useDrizzle().query.users.findFirst({
      where: eq(tables.users.mail, userName),
      with: {
        credentials: true,
      },
    });

    return user?.credentials || [];
  },

  async getCredential(event, credentialId) {
    // Look for the credential in our database
    const credential = await useDrizzle().query.webauthnCredentials.findFirst({
      where: eq(tables.webauthnCredentials.id, credentialId),
      with: {
        user: true,
      },
    });

    // If the credential is not found, there is no account to log in to
    if (!credential)
      throw createError({
        statusCode: 401,
        statusMessage: "Credential not found",
      });

    return credential;
  },
  async onSuccess(event, { credential, authenticationInfo }) {
    const dbUser = await useDrizzle().query.users.findFirst({
      where: (users, { eq }) => eq(users.id, credential.userId),
    });
    if (!dbUser) {
      throw createError({
        statusCode: 502,
        statusMessage: "User not found in database",
      });
    }

    //update the counter
    console.log(
      `Updating counter for credential ${credential.id} to ${authenticationInfo.newCounter}`,
    );
    await useDrizzle()
      .update(tables.webauthnCredentials)
      .set({
        counter: authenticationInfo.newCounter,
      })
      .where(eq(tables.webauthnCredentials.id, credential.id));
    await setUserSession(
      event,
      {
        user: {
          userId: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          mail: dbUser.mail,
          jobtitle: dbUser.jobtitle,
          hasWebauthn: true,
          loggedInAt: Date.now(),
        },
        rights: dbUser.rights || [],
        secure: {
          webauthnId: credential.id,
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
        `Cleared session invalidation flag for user ${dbUser.mail} after successful WebAuthn authentication`,
      );
    } catch (kvError) {
      console.warn(`Failed to clear session invalidation flag:`, kvError);
    }

    console.log(
      `WebAuthn: Session created for user ${dbUser.mail} (ID: ${dbUser.id})`,
    );
  },
});
