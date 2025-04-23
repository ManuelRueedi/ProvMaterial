import { eq } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const CredentialId = await useDrizzle()
    .select({
      id: tables.webauthnCredentials.id,
    })
    .from(tables.webauthnCredentials)
    .leftJoin(
      tables.users,
      eq(tables.webauthnCredentials.userId, tables.users.id),
    )
    .where(eq(tables.users.mail, "Manuel.Rueedi@bbz-sh.ch"));

  return {
    id: CredentialId[0],
  };
});
