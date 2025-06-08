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
        "Benutzer hat keine Berechtigung zum Löschen von Standorten",
    });
  }

  // Get and validate locationId parameter
  const locationId = getRouterParam(event, "locationId");

  if (!locationId || isNaN(Number(locationId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige Standort-ID",
    });
  }

  const numericLocationId = Number(locationId);
  const db = useDrizzle();

  try {
    // Check if location exists
    const existingLocation = await db.query.locations.findFirst({
      where: eq(tables.locations.id, numericLocationId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!existingLocation) {
      throw createError({
        statusCode: 404,
        statusMessage: `Standort mit ID "${locationId}" nicht gefunden`,
      });
    }

    // Check if any articles are currently using this location (either as location or storage location)
    const articlesUsingAsLocation = await db.query.articles.findMany({
      where: eq(tables.articles.locationId, numericLocationId),
      columns: {
        id: true,
      },
    });

    const articlesUsingAsStorage = await db.query.articles.findMany({
      where: eq(tables.articles.storageLocationId, numericLocationId),
      columns: {
        id: true,
      },
    });

    const totalArticlesUsing =
      articlesUsingAsLocation.length + articlesUsingAsStorage.length;

    if (totalArticlesUsing > 0) {
      const locationUsage =
        articlesUsingAsLocation.length > 0 ? "als Einsatzort" : "";
      const storageUsage =
        articlesUsingAsStorage.length > 0 ? "als Lagerort" : "";
      const usage = [locationUsage, storageUsage].filter(Boolean).join(" und ");

      throw createError({
        statusCode: 409,
        statusMessage: `Standort kann nicht gelöscht werden, da er derzeit von ${totalArticlesUsing} Artikel(n) ${usage} verwendet wird. Verschieben Sie zuerst alle Artikel von diesem Standort.`,
      });
    }

    // Delete the location
    // Note: articleLocationHistory.locationID has "onDelete: set null" so history records will be updated automatically
    await db
      .delete(tables.locations)
      .where(eq(tables.locations.id, numericLocationId));

    return {
      success: true,
      locationId: numericLocationId,
      message: `Standort "${existingLocation.name}" erfolgreich gelöscht`,
    };
  } catch (error) {
    // If it's already a createError, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error deleting location:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Löschen des Standorts fehlgeschlagen",
    });
  }
});
