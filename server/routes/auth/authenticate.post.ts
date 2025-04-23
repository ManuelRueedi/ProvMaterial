// server/api/webauthn/authenticate.post.ts
// export default defineWebAuthnAuthenticateEventHandler({
//   async storeChallenge(event, challenge, attemptId) {
//     // Store the challenge in a KV store or DB
//     await useStorage().setItem(`attempt:${attemptId}`, challenge);
//   },
//   async getChallenge(event, attemptId) {
//     const challenge = await useStorage().getItem(`attempt:${attemptId}`);

//     // Make sure to always remove the attempt because they are single use only!
//     await useStorage().removeItem(`attempt:${attemptId}`);

//     if (!challenge)
//       throw createError({ statusCode: 400, message: "Challenge expired" });

//     return challenge;
//   },
//   async onSuccess(event, { authenticator }) {
//     // ...
//   },
//   // Optionally, we can prefetch the credentials if the user gives their userName during login
//   async allowCredentials(event, userName) {
//     const credentials = await useDatabase().sql`...`;
//     // If no credentials are found, the authentication cannot be completed
//     if (!credentials.length)
//       throw createError({ statusCode: 400, message: "User not found" });

//     // If user is found, only allow credentials that are registered
//     // The browser will automatically try to use the credential that it knows about
//     // Skipping the step for the user to select a credential for a better user experience
//     return credentials;
//     // example: [{ id: '...' }]
//   },
//   async getCredential(event, credentialId) {
//     // Look for the credential in our database
//     const credential = await useDatabase().sql`...`;

//     // If the credential is not found, there is no account to log in to
//     if (!credential)
//       throw createError({ statusCode: 400, message: "Credential not found" });

//     return credential;
//   },
//   async onSuccess(event, { credential, authenticationInfo }) {
//     // The credential authentication has been successful
//     // We can look it up in our database and get the corresponding user
//     const db = useDatabase();
//     const user = await db.sql`...`;

//     // Update the counter in the database (authenticationInfo.newCounter)
//     await db.sql`...`;

//     // Set the user session
//     await setUserSession(event, {
//       user: {
//         id: user.id,
//       },
//       loggedInAt: Date.now(),
//     });
//   },
// });
