import type { Article } from "@/composables/articles/types";
import { numberToAmpacity } from "@/composables/articles/types";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  inStorage: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export default defineEventHandler(async (event): Promise<Article[]> => {
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to access articles",
    });
  }

  // Parse and validate query parameters
  const query = getQuery(event);
  const validationResult = querySchema.safeParse(query);

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameters",
      data: validationResult.error.issues,
    });
  }

  const { projectId, locationId, inStorage } = validationResult.data;

  try {
    const db = useDrizzle();

    // Build where conditions based on filters
    const whereConditions = [];

    if (projectId !== undefined) {
      whereConditions.push(eq(tables.articles.currentProjectId, projectId));
    }

    if (locationId !== undefined) {
      whereConditions.push(eq(tables.articles.locationId, locationId));
    }

    if (inStorage !== undefined) {
      if (inStorage) {
        // Article is in storage: locationId equals storageLocationId
        whereConditions.push(
          sql`${tables.articles.locationId} = ${tables.articles.storageLocationId}`,
        );
      } else {
        // Article is not in storage: locationId differs from storageLocationId
        whereConditions.push(
          sql`${tables.articles.locationId} != ${tables.articles.storageLocationId}`,
        );
      }
    }

    // Combine all conditions with AND
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db.query.articles.findMany({
      where: whereClause,
      columns: {
        id: true,
        type: true,
        ampacity: true,
        lengthInMeter: true,
        storageLocationSection: true,
        connector: true,
        outputs: true,
        tags: true,
        updatedAt: false,
        createdAt: false,
        currentProjectId: false,
      },
      with: {
        storageLocation: {
          columns: {
            name: true,
          },
        },
        ...(inStorage !== true && {
          location: {
            columns: {
              name: true,
            },
          },
        }),
        project: {
          columns: {
            name: true,
          },
        },
      },
    });

    // Map DB result to Article interface
    return (result ?? []).map(
      (row): Article => ({
        id: row.id,
        type: row.type,
        ampacity: numberToAmpacity(row.ampacity),
        lengthInMeter: row.lengthInMeter,
        connector: row.connector || undefined,
        outputs: row.outputs ?? {},
        tags: row.tags,
        ...(inStorage !== true &&
          row.location && {
            location: {
              name: row.location.name,
              address: "", // Minimal data - not fetched
            },
          }),
        storageLocation: {
          name: row.storageLocation.name,
          address: "", // Minimal data - not fetched
        },
        storageLocationSection: row.storageLocationSection || undefined,
        ...(row.project && {
          project: {
            name: row.project.name,
          },
        }),
      }),
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch articles",
    });
  }
});
