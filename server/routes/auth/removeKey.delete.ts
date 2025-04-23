import { eq } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  // Verify if the user is logged in
  const userSession = await requireUserSession(event);
  if (!userSession.user.userId) {
    return { status: 401, body: { message: "Unauthorized" } };
  }
  try {
    await useDrizzle()
      .delete(tables.webauthnCredentials)
      .where(
        eq(tables.webauthnCredentials.userId, Number(userSession.user.userId)),
      )
      .limit(1);
  } catch (err) {
    console.log(err);
  }
  await setUserSession(event, {
    ...userSession,
    user: {
      ...userSession.user,
      hasWebauthn: false,
    },
  });
  setResponseStatus(event, 200); // or event.node.res.statusCode = 200
  return { message: "WebAuthn key removed successfully" };
});
