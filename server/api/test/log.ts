export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  console.log("session", session);
  console.log("usermail", session.user?.mail);
});
