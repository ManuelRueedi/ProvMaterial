import { sql, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = requireUserSession(event);

  if (!(await session).rights.useArticles) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Benutzer hat keine Berechtigung auf Standorte zuzugreifen",
    });
  }

  const db = useDrizzle();

  try {
    const allLocations = await db
      .select()
      .from(tables.locations)
      .where(eq(tables.locations.isStorageLocation, false))
      .orderBy(sql`${tables.locations.name} asc`);

    if (!allLocations) {
      throw createError({
        statusCode: 500,
        statusMessage: "Keine Standorte gefunden.",
      });
    }

    return allLocations;
  } catch (error: any) {
    console.error("Fehler beim Abrufen aller Standorte:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Ein interner Serverfehler ist beim Abrufen der Standorte aufgetreten.",
    });
  }
});
