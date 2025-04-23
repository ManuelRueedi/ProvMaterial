import { eq } from "drizzle-orm";

export default defineOAuthMicrosoftEventHandler({
  config: { scope: ["User.Read", "offline_access"] },

  async onSuccess(event, { user, tokens }) {
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
          rights: {
            //if user.mail ends with @shpower.ch, add rights to use and add Articles
            useArticels: user.mail.endsWith("@shpower.ch") ? true : false,
            editArticels: false,
            addArticels: user.mail.endsWith("@shpower.ch") ? true : false,
            removeArticels: false,
          },
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
        await useDrizzle().update(tables.users).set({
          firstName: user.givenName,
          lastName: user.surname,
          jobtitle: user.jobTitle,
        });
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
      console.log("Setting session");
      await setUserSession(event, {
        user: {
          userId: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          mail: dbUser.mail,
          jobtitle: dbUser.jobtitle,
          hasWebauthn: (await useDrizzle().query.webauthnCredentials.findFirst({
            where: eq(tables.webauthnCredentials.userId, Number(dbUser.id)),
          }))
            ? true
            : false,
        },
        rights: {
          //check if null and set to false otherwise use dbUser data
          useArticles: dbUser.rights?.useArticels ?? false,
          editArticles: dbUser.rights?.editArticels ?? false,
          addArticles: dbUser.rights?.addArticels ?? false,
          removeArticles: dbUser.rights?.removeArticels ?? false,
        },
        secure: {
          microsoftID: dbUser.microsoftID,
        },
        loggedInAt: Date.now(),
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
