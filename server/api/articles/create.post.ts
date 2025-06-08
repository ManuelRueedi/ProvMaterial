import { createError, defineEventHandler, readValidatedBody } from "h3";
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

// Define the input schema for creating an article
const createArticleSchema = z.object({
  id: z.string().min(1, "Article ID is required"),
  type: TypeEnum,
  ampacity: AmpacityEnum,
  connector: ConnectorEnum.optional(),
  outputs: z.record(ConnectorEnum, z.number()).optional().default({}),
  tags: z.array(TagEnum).optional().default([]),
  lengthInMeter: z.number().nonnegative("Length must be non-negative"),
  locationId: z
    .number()
    .int()
    .positive("Location ID must be a positive integer"),
  storageLocationId: z
    .number()
    .int()
    .positive("Storage location ID must be a positive integer"),
  storageLocationSection: z.string().optional(),
  currentProjectId: z.number().int().positive().optional(),
});

export default defineEventHandler(async (event) => {
  // Check user session and permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("addArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to add articles",
    });
  }

  const db = useDrizzle();

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    createArticleSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid article data",
      data: result.error.issues,
    });
  }

  const articleData = result.data;

  try {
    // Check if article ID already exists
    const existingArticle = await db.query.articles.findFirst({
      where: eq(tables.articles.id, articleData.id),
      columns: { id: true },
    });

    if (existingArticle) {
      throw createError({
        statusCode: 409,
        statusMessage: `Article with ID "${articleData.id}" already exists`,
      });
    }

    // Verify that the location exists and is valid
    const location = await db.query.locations.findFirst({
      where: eq(tables.locations.id, articleData.locationId),
      columns: { id: true, isStorageLocation: true },
    });

    if (!location) {
      throw createError({
        statusCode: 400,
        statusMessage: `Location with ID ${articleData.locationId} not found`,
      });
    }

    // Verify that the storage location exists and is a storage location
    const storageLocation = await db.query.locations.findFirst({
      where: eq(tables.locations.id, articleData.storageLocationId),
      columns: { id: true, isStorageLocation: true },
    });

    if (!storageLocation) {
      throw createError({
        statusCode: 400,
        statusMessage: `Storage location with ID ${articleData.storageLocationId} not found`,
      });
    }

    if (!storageLocation.isStorageLocation) {
      throw createError({
        statusCode: 400,
        statusMessage: `Location with ID ${articleData.storageLocationId} is not a storage location`,
      });
    }

    // Verify project exists if provided
    if (articleData.currentProjectId) {
      const project = await db.query.projects.findFirst({
        where: eq(tables.projects.id, articleData.currentProjectId),
        columns: { id: true },
      });

      if (!project) {
        throw createError({
          statusCode: 400,
          statusMessage: `Project with ID ${articleData.currentProjectId} not found`,
        });
      }
    }

    // Insert the article
    const now = new Date();
    await db.insert(tables.articles).values({
      id: articleData.id,
      type: articleData.type,
      ampacity: ampacityToNumber(articleData.ampacity),
      connector: articleData.connector,
      outputs: articleData.outputs,
      tags: articleData.tags,
      lengthInMeter: articleData.lengthInMeter,
      locationId: articleData.locationId,
      storageLocationId: articleData.storageLocationId,
      storageLocationSection: articleData.storageLocationSection || null,
      currentProjectId: articleData.currentProjectId || null,
      createdAt: now,
      updatedAt: now,
    });

    // If the article is not in storage (locationId !== storageLocationId), create history record
    if (articleData.locationId !== articleData.storageLocationId) {
      const locationDetails = await db.query.locations.findFirst({
        where: eq(tables.locations.id, articleData.locationId),
      });

      const projectDetails = articleData.currentProjectId
        ? await db.query.projects.findFirst({
            where: eq(tables.projects.id, articleData.currentProjectId),
          })
        : null;

      await db.insert(tables.articleLocationHistory).values({
        articleId: articleData.id,
        locationName: locationDetails?.name || "Unknown",
        locationaddress: locationDetails?.address || "",
        locationLatitude: locationDetails?.latitude || 0,
        locationLongitude: locationDetails?.longitude || 0,
        locationID: articleData.locationId,
        projectName: projectDetails?.name || null,
        projectDescription: projectDetails?.description || null,
        projectId: articleData.currentProjectId || null,
        takeOutUserId: session.user.userId,
        fromTs: now,
        toTs: null, // Open history record
      });
    }

    return {
      success: true,
      articleId: articleData.id,
      message: "Article created successfully",
    };
  } catch (error) {
    // If it's already a createError, re-throw it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Error creating article:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create article",
    });
  }
});
