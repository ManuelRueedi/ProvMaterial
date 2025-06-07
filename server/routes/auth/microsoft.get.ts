import { eq } from "drizzle-orm";

export default defineOAuthMicrosoftEventHandler({
  config: { scope: ["User.Read", "offline_access"] },

  async onSuccess(event, { user }) {
    // Check if user email is from @shpower.ch domain
    if (!user.mail.endsWith("@shpower.ch")) {
      console.log(`Unauthorized login attempt from: ${user.mail}`);
      return sendRedirect(event, "/login?error=unauthorized");
    }

    // check if the user is already in database based on microsoftID
    const userData = await useDrizzle().query.users.findFirst({
      where: (users, { eq }) => eq(users.microsoftID, user.id),
    });
    // if not, create it
    if (!userData) {
      console.log("User not found in database, creating it");
      await useDrizzle()
        .insert(tables.users)
        .values({
          microsoftID: user.id,
          mail: user.mail,
          firstName: user.givenName,
          lastName: user.surname,
          jobtitle: user.jobTitle,
          rights: ["useArticles", "addArticles"],
        });
    } else {
      // if user is already in database, update it if needed
      // Check if the user has changed his name or job title
      if (
        userData.firstName !== user.givenName ||
        userData.lastName !== user.surname ||
        userData.jobtitle !== user.jobTitle
      ) {
        console.log("User found in database, updating it");
        // Update the user in the database
        await useDrizzle()
          .update(tables.users)
          .set({
            firstName: user.givenName,
            lastName: user.surname,
            jobtitle: user.jobTitle,
          })
          .where(eq(tables.users.microsoftID, user.id));
      }
    }
    // wait till db is updated then get the user from the database
    const dbUser = await useDrizzle().query.users.findFirst({
      where: (users, { eq }) => eq(users.microsoftID, user.id),
    });
    if (!dbUser) {
      throw createError({
        statusCode: 500,
        message: "User not found in database",
      });
    } else {
      await setUserSession(event, {
        user: {
          userId: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          mail: dbUser.mail,
          jobtitle: dbUser.jobtitle,
          hasWebauthn: (await useDrizzle().query.webauthnCredentials.findFirst({
            where: eq(tables.webauthnCredentials.userId, dbUser.id),
          }))
            ? true
            : false,
          loggedInAt: Date.now(),
        },
        rights: dbUser.rights || [],
        secure: {
          microsoftId: dbUser.microsoftID,
        },
      });
      return sendRedirect(event, "/");
    }
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("Microsoft OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
