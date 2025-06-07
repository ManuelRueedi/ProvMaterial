import { sql } from "drizzle-orm";
import type { Project } from "@/composables/articles/types";

export default defineEventHandler(async (event): Promise<Project[]> => {
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
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

    // Transform to match Project interface (convert null to undefined)
    return allProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
    }));
  } catch (error: unknown) {
    console.error("Fehler beim Abrufen aller Projekte:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Ein interner Serverfehler ist beim Abrufen der Projekte aufgetreten.",
    });
  }
});
