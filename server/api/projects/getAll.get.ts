import { sql, isNotNull, eq, and } from "drizzle-orm";
import type { Project } from "@/composables/articles/types";

export default defineEventHandler(async (event): Promise<Project[]> => {
  const session = requireUserSession(event);
  const query = getQuery(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Benutzer hat keine Berechtigung auf Projekte zuzugreifen",
    });
  }

  const db = useDrizzle();
  const hasDeployedArticles = query.hasDeployedArticles === "true";

  try {
    let allProjects;

    if (hasDeployedArticles) {
      // Only get projects that have articles not in storage
      allProjects = await db
        .selectDistinct({
          id: tables.projects.id,
          name: tables.projects.name,
          description: tables.projects.description,
        })
        .from(tables.projects)
        .innerJoin(
          tables.articles,
          eq(tables.articles.currentProjectId, tables.projects.id),
        )
        .innerJoin(
          tables.locations,
          eq(tables.articles.locationId, tables.locations.id),
        )
        .where(
          and(
            isNotNull(tables.articles.locationId),
            eq(tables.locations.isStorageLocation, false),
          ),
        )
        .orderBy(sql`${tables.projects.name} asc`);
    } else {
      // Get all projects (original behavior)
      allProjects = await db
        .select()
        .from(tables.projects)
        .orderBy(sql`${tables.projects.name} asc`);
    }

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
