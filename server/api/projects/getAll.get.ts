import { sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = requireUserSession(event);

  if (!(await session).rights.useArticles) {
    throw createError({
      statusCode: 403,
      statusMessage: "Benutzer hat keine Berechtigung auf Projekte zuzugreifen",
    });
  }

  const db = useDrizzle();

  try {
    const allProjects = await db
      .select()
      .from(tables.projects)
      .orderBy(sql`${tables.projects.name} asc`);

    if (!allProjects) {
      throw createError({
        statusCode: 500,
        statusMessage: "Keine Projekte gefunden.",
      });
    }

    return allProjects;
  } catch (error: any) {
    console.error("Fehler beim Abrufen aller Projekte:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Ein interner Serverfehler ist beim Abrufen der Projekte aufgetreten.",
    });
  }
});
