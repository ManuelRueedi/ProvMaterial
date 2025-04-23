import { eq } from "drizzle-orm";

export default defineWebAuthnRegisterEventHandler({
  async validateUser(userBody, event) {
    const session = await requireUserSession(event);

    if (session.user.mail !== userBody.userName) {
      throw createError({
        statusCode: 401,
        message: "User not authenticated or email mismatch",
      });
    }
    // check if the loged in user.id has a row in webauthnCredentials witch matches the user id
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
        statusCode: 400,
        message: "User already has a webauthn credential",
      });
    }
  },

  async onSuccess(event, { credential, user }) {
    const session = await requireUserSession(event);
    const clear = await await useDrizzle()
      .insert(tables.webauthnCredentials)
      .values({
        id: credential.id,
        userId: Number(session.user.userId),
        publicKey: credential.publicKey,
        counter: credential.counter,
        backedUp: credential.backedUp,
        transports: JSON.stringify(credential.transports),
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
