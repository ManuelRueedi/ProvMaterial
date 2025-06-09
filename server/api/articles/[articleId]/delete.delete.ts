import { createError, defineEventHandler, getRouterParam } from "h3";
import { eq } from "drizzle-orm";
import * as tables from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
  // Check user session and permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("removeArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Benutzer hat keine Berechtigung zum Löschen von Artikeln",
    });
  }

  // Get and validate articleId parameter
  const rawId = getRouterParam(event, "articleId") ?? "";

  if (!rawId || rawId.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Fehlender articleId Parameter",
    });
  }

  const articleId = decodeURIComponent(rawId);

  const db = useDrizzle();

  try {
    // Check if article exists and get full data for changelog
    const existingArticle = await db.query.articles.findFirst({
      where: eq(tables.articles.id, articleId),
    });

    if (!existingArticle) {
      throw createError({
        statusCode: 404,
        statusMessage: `Artikel mit ID "${articleId}" nicht gefunden`,
      });
    }

    // Check if article is currently taken out (not in storage location)
    if (existingArticle.locationId !== existingArticle.storageLocationId) {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Artikel kann nicht gelöscht werden, da er derzeit aus dem Lager entnommen ist. Bitte bringen Sie ihn zuerst zurück.",
      });
    }

    // Create change log entry before deletion
    await db.insert(tables.changeLog).values({
      articleId: articleId,
      userId: session.user.userId,
      action: "delete",
      old: existingArticle,
      new: null,
    } as typeof tables.changeLog.$inferInsert);

    // Delete related records first (due to foreign key constraints)

    // 1. Delete from article location history
    await db
      .delete(tables.articleLocationHistory)
      .where(eq(tables.articleLocationHistory.articleId, articleId));

    // 2. Delete from inspections
    await db
      .delete(tables.inspections)
      .where(eq(tables.inspections.articleId, articleId));

    // Note: We keep changelog entries for audit trail purposes

    // 3. Finally delete the article itself
    await db.delete(tables.articles).where(eq(tables.articles.id, articleId));

    return {
      success: true,
      articleId,
      message: "Artikel erfolgreich gelöscht",
    };
  } catch (error) {
    // If it's already a createError, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error deleting article:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Löschen des Artikels fehlgeschlagen",
    });
  }
});
