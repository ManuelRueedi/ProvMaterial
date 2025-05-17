import { eq } from "drizzle-orm";

export default defineWebAuthnRegisterEventHandler({
  async storeChallenge(event, challenge, attemptId) {
    await hubKV().set(`auth:challenge:${attemptId}`, challenge, { ttl: 60 });
  },
  async getChallenge(event, attemptId) {
    const challenge = await hubKV().get<string>(`auth:challenge:${attemptId}`);
    if (!challenge) {
      throw createError({
        statusCode: 405,
        message: "WebAuthn challenge not found or has expired.",
      });
    }
    await hubKV().del(`auth:challenge:${attemptId}`);
    return challenge;
  },

  async validateUser(userBody, event) {
    const session = await requireUserSession(event);

    if (session.user.mail !== userBody.userName) {
      throw createError({
        statusCode: 403,
        message:
          "Authenticated user email does not match the provided username.",
      });
    }
    // check if the logged in user.id has a row in webauthnCredentials which matches the user id
    const response = await useDrizzle().query.webauthnCredentials.findFirst({
      where: eq(tables.webauthnCredentials.userId, Number(session.user.userId)),
    });
    if (response) {
      await setUserSession(event, {
        user: {
          hasWebauthn: true,
        },
      });
      throw createError({
        statusCode: 409,
        message: "User already registered a WebAuthn credential.",
      });
    }
  },

  async onSuccess(event, { credential, user }) {
    const session = await requireUserSession(event);
    await useDrizzle()
      .insert(tables.webauthnCredentials)
      .values({
        id: credential.id,
        userId: Number(session.user.userId),
        publicKey: credential.publicKey,
        counter: credential.counter,
        backedUp: credential.backedUp,
        transports: credential.transports,
      });
    // set the user session with the webauthnID
    await setUserSession(event, {
      user: {
        hasWebauthn: true,
      },
      secure: {
        webauthnId: credential.id,
      },
    });
  },
});
