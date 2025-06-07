import { eq } from "drizzle-orm";
import { getRouterParam, createError, defineEventHandler } from "h3";
import type { Article } from "@/composables/articles/types";
import { numberToAmpacity } from "@/composables/articles/types";

export default defineEventHandler(async (event): Promise<Article> => {
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to access articles",
    });
  }

  // Get and validate articleId parameter
  const rawId = getRouterParam(event, "articleId") ?? "";

  if (!rawId || rawId.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing articleId parameter",
    });
  }

  const articleId = decodeURIComponent(rawId);

  try {
    const db = useDrizzle();

    const result = await db.query.articles.findFirst({
      where: eq(tables.articles.id, articleId),
      columns: {
        id: true,
        type: true,
        lengthInMeter: true,
        ampacity: true,
        connector: true,
        outputs: true,
        tags: true,
        storageLocationSection: true,
        createdAt: false,
        updatedAt: false,
        currentProjectId: false,
        locationId: false,
        storageLocationId: false,
      },
      with: {
        location: {
          columns: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        storageLocation: {
          columns: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        project: {
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: `Article with ID '${articleId}' not found`,
      });
    }

    // Map DB result to Article interface
    const article: Article = {
      id: result.id,
      type: result.type,
      lengthInMeter: result.lengthInMeter,
      ampacity: numberToAmpacity(result.ampacity),
      connector: result.connector!,
      outputs: result.outputs || {},
      tags: [...(result.tags || [])],
      storageLocationSection: result.storageLocationSection || "",
      location: result.location
        ? {
            id: result.location.id,
            name: result.location.name,
            address: result.location.address || "",
            latitude: result.location.latitude || undefined,
            longitude: result.location.longitude || undefined,
          }
        : undefined,
      storageLocation: {
        id: result.storageLocation.id,
        name: result.storageLocation.name,
        address: result.storageLocation.address || "",
        latitude: result.storageLocation.latitude || undefined,
        longitude: result.storageLocation.longitude || undefined,
      },
      project: result.project
        ? {
            id: result.project.id,
            name: result.project.name,
            description: result.project.description || undefined,
          }
        : undefined,
    };

    return article;
  } catch (error) {
    // Re-throw createError instances
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error fetching article:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch article",
    });
  }
});
