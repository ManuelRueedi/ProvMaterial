import { createError, defineEventHandler, getRouterParam } from "h3";
import { eq } from "drizzle-orm";
import * as tables from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
  // Check user session and permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Benutzer hat keine Berechtigung zum Löschen von Projekten",
    });
  }

  // Get and validate projectId parameter
  const projectId = getRouterParam(event, "projectId");

  if (!projectId || isNaN(Number(projectId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige Projekt-ID",
    });
  }

  const numericProjectId = Number(projectId);
  const db = useDrizzle();

  try {
    // Check if project exists
    const existingProject = await db.query.projects.findFirst({
      where: eq(tables.projects.id, numericProjectId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!existingProject) {
      throw createError({
        statusCode: 404,
        statusMessage: `Projekt mit ID "${projectId}" nicht gefunden`,
      });
    }

    // Check if any articles are currently using this project
    const articlesUsingProject = await db.query.articles.findMany({
      where: eq(tables.articles.currentProjectId, numericProjectId),
      columns: {
        id: true,
      },
    });

    if (articlesUsingProject.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Projekt kann nicht gelöscht werden, da es derzeit von ${articlesUsingProject.length} Artikel(n) verwendet wird. Entfernen Sie zuerst alle Artikel aus diesem Projekt.`,
      });
    }

    // Delete the project
    // Note: articleLocationHistory.projectId has "onDelete: set null" so history records will be updated automatically
    await db
      .delete(tables.projects)
      .where(eq(tables.projects.id, numericProjectId));

    return {
      success: true,
      projectId: numericProjectId,
      message: `Projekt "${existingProject.name}" erfolgreich gelöscht`,
    };
  } catch (error) {
    // If it's already a createError, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error deleting project:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Löschen des Projekts fehlgeschlagen",
    });
  }
});
