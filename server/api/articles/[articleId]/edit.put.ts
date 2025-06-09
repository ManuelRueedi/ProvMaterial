import {
  createError,
  defineEventHandler,
  readValidatedBody,
  getRouterParam,
} from "h3";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  TypeEnum,
  AmpacityEnum,
  ConnectorEnum,
  TagEnum,
  ampacityToNumber,
} from "@/composables/articles/types";
import * as tables from "~~/server/database/schema";

// Define the input schema for editing an article
const editArticleSchema = z.object({
  type: TypeEnum.optional(),
  ampacity: AmpacityEnum.optional(),
  connector: ConnectorEnum.optional().nullable(),
  outputs: z.record(ConnectorEnum, z.number()).optional(),
  tags: z.array(TagEnum).optional(),
  lengthInMeter: z
    .number()
    .nonnegative("Length must be non-negative")
    .optional(),
  locationId: z
    .number()
    .int()
    .positive("Location ID must be a positive integer")
    .optional(),
  storageLocationId: z
    .number()
    .int()
    .positive("Storage location ID must be a positive integer")
    .optional(),
  storageLocationSection: z.string().optional().nullable(),
  currentProjectId: z.number().int().positive().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  // Check user session and permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("editArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Benutzer hat keine Berechtigung zum Bearbeiten von Artikeln",
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

  const db = useDrizzle();

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    editArticleSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid article data",
      data: result.error.issues,
    });
  }

  const updateData = result.data;

  try {
    // Check if article exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(tables.articles.id, articleId),
      with: {
        location: true,
        storageLocation: true,
        project: true,
      },
    });

    if (!existingArticle) {
      throw createError({
        statusCode: 404,
        statusMessage: `Article with ID "${articleId}" not found`,
      });
    }

    // Store original data for change log
    const _originalData = {
      id: existingArticle.id,
      type: existingArticle.type,
      ampacity: existingArticle.ampacity,
      connector: existingArticle.connector,
      outputs: existingArticle.outputs,
      tags: existingArticle.tags,
      lengthInMeter: existingArticle.lengthInMeter,
      locationId: existingArticle.locationId,
      storageLocationId: existingArticle.storageLocationId,
      storageLocationSection: existingArticle.storageLocationSection,
      currentProjectId: existingArticle.currentProjectId,
    };

    // Verify that the location exists if provided
    if (updateData.locationId) {
      const location = await db.query.locations.findFirst({
        where: eq(tables.locations.id, updateData.locationId),
        columns: { id: true, isStorageLocation: true },
      });

      if (!location) {
        throw createError({
          statusCode: 400,
          statusMessage: `Location with ID ${updateData.locationId} not found`,
        });
      }
    }

    // Verify that the storage location exists and is a storage location if provided
    if (updateData.storageLocationId) {
      const storageLocation = await db.query.locations.findFirst({
        where: eq(tables.locations.id, updateData.storageLocationId),
        columns: { id: true, isStorageLocation: true },
      });

      if (!storageLocation) {
        throw createError({
          statusCode: 400,
          statusMessage: `Storage location with ID ${updateData.storageLocationId} not found`,
        });
      }

      if (!storageLocation.isStorageLocation) {
        throw createError({
          statusCode: 400,
          statusMessage: `Location with ID ${updateData.storageLocationId} is not a storage location`,
        });
      }
    }

    // Verify project exists if provided
    if (updateData.currentProjectId) {
      const project = await db.query.projects.findFirst({
        where: eq(tables.projects.id, updateData.currentProjectId),
        columns: { id: true },
      });

      if (!project) {
        throw createError({
          statusCode: 400,
          statusMessage: `Project with ID ${updateData.currentProjectId} not found`,
        });
      }
    }

    // Prepare update values - only include fields that are provided
    const updateValues: Partial<typeof tables.articles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (updateData.type !== undefined) {
      updateValues.type = updateData.type;
    }
    if (updateData.ampacity !== undefined) {
      updateValues.ampacity = ampacityToNumber(updateData.ampacity);
    }
    if (updateData.connector !== undefined) {
      updateValues.connector = updateData.connector;
    }
    if (updateData.outputs !== undefined) {
      updateValues.outputs = updateData.outputs;
    }
    if (updateData.tags !== undefined) {
      updateValues.tags = updateData.tags;
    }
    if (updateData.lengthInMeter !== undefined) {
      updateValues.lengthInMeter = updateData.lengthInMeter;
    }
    if (updateData.locationId !== undefined) {
      updateValues.locationId = updateData.locationId;
    }
    if (updateData.storageLocationId !== undefined) {
      updateValues.storageLocationId = updateData.storageLocationId;
    }
    if (updateData.storageLocationSection !== undefined) {
      updateValues.storageLocationSection = updateData.storageLocationSection;
    }
    if (updateData.currentProjectId !== undefined) {
      updateValues.currentProjectId = updateData.currentProjectId;
    }

    // Update the article
    await db
      .update(tables.articles)
      .set(updateValues)
      .where(eq(tables.articles.id, articleId));

    // Create change log entry
    const newData = { ..._originalData, ...updateValues };
    await db.insert(tables.changeLog).values({
      articleId: articleId,
      userId: session.user.userId,
      old: _originalData,
      new: newData,
    } as typeof tables.changeLog.$inferInsert);

    // Handle location history if location changed
    const newLocationId = updateData.locationId ?? existingArticle.locationId;
    const newStorageLocationId =
      updateData.storageLocationId ?? existingArticle.storageLocationId;
    const newProjectId =
      updateData.currentProjectId !== undefined
        ? updateData.currentProjectId
        : existingArticle.currentProjectId;

    // If location changed and article moved away from storage, close old history and create new one
    if (
      updateData.locationId &&
      updateData.locationId !== existingArticle.locationId
    ) {
      // Close existing open history record if any
      await db
        .update(tables.articleLocationHistory)
        .set({
          toTs: new Date(),
          bringBackUserId: session.user.userId,
        })
        .where(eq(tables.articleLocationHistory.articleId, articleId));

      // If article is not in storage location, create new history record
      if (newLocationId !== newStorageLocationId) {
        const locationDetails = await db.query.locations.findFirst({
          where: eq(tables.locations.id, newLocationId),
        });

        const projectDetails = newProjectId
          ? await db.query.projects.findFirst({
              where: eq(tables.projects.id, newProjectId),
            })
          : null;

        await db.insert(tables.articleLocationHistory).values({
          articleId,
          locationName: locationDetails?.name || "Unknown",
          locationaddress: locationDetails?.address || "",
          locationLatitude: locationDetails?.latitude || 0,
          locationLongitude: locationDetails?.longitude || 0,
          locationID: newLocationId,
          projectName: projectDetails?.name || null,
          projectDescription: projectDetails?.description || null,
          projectId: newProjectId || null,
          takeOutUserId: session.user.userId,
          fromTs: new Date(),
          toTs: null, // Open history record
        });
      }
    }

    return {
      success: true,
      articleId,
      message: "Article updated successfully",
    };
  } catch (error) {
    // If it's already a createError, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error updating article:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update article",
    });
  }
});
