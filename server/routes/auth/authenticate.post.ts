import { eq } from "drizzle-orm";
import { webauthnCredentials } from "~~/server/database/schema";

export default defineWebAuthnAuthenticateEventHandler({
  async storeChallenge(event, challenge, attemptId) {
    await hubKV().set(`auth:challenge:${attemptId}`, challenge, { ttl: 60 });
  },
  async getChallenge(event, attemptId) {
    const challenge = await hubKV().get<string>(`auth:challenge:${attemptId}`);
    if (!challenge) {
      throw createError({
        statusCode: 400,
        message: "Challenge not found or expired",
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
      throw createError({ statusCode: 401, message: "Credential not found" });

    return credential;
  },
  async onSuccess(event, { credential, authenticationInfo }) {
    const dbUser = await useDrizzle().query.users.findFirst({
      where: (users, { eq }) => eq(users.id, credential.userId),
    });
    if (!dbUser) {
      throw createError({
        statusCode: 502,
        message: "User not found in database",
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

    await setUserSession(event, {
      user: {
        userId: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        mail: dbUser.mail,
        jobtitle: dbUser.jobtitle,
        hasWebauthn: true,
        loggedInAt: Date.now(),
      },
      rights: {
        //check if null and set to false otherwise use dbUser data
        useArticles: dbUser.rights?.useArticels ?? false,
        editArticles: dbUser.rights?.editArticels ?? false,
        addArticles: dbUser.rights?.addArticels ?? false,
        removeArticles: dbUser.rights?.removeArticels ?? false,
      },
      secure: {
        webauthnID: credential.id,
      },
    });
  },
});
