import { z } from "zod";
import { eq } from "drizzle-orm";

// Define validation schema for location updates
const UpdateLocationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().optional(),
  latitude: z.number({ required_error: "Latitude is required" }).optional(),
  longitude: z.number({ required_error: "Longitude is required" }).optional(),
  isStorageLocation: z.boolean().optional(),
});

export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>;

export default defineEventHandler(async (event) => {
  // Check user permissions
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Benutzer hat keine Berechtigung auf Standorte zuzugreifen",
    });
  }

  // Get location ID from URL parameters
  const locationId = getRouterParam(event, "locationId");

  if (!locationId || isNaN(Number(locationId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid location ID",
    });
  }

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    UpdateLocationSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid location data",
      data: result.error.issues,
    });
  }

  const updateData = result.data;
  const db = useDrizzle();

  try {
    // Check if location exists
    const existingLocation = await db
      .select()
      .from(tables.locations)
      .where(eq(tables.locations.id, Number(locationId)))
      .limit(1);

    if (!existingLocation || existingLocation.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Location not found",
      });
    }

    // Update location
    const updatedLocation = await db
      .update(tables.locations)
      .set(updateData)
      .where(eq(tables.locations.id, Number(locationId)))
      .returning();

    if (!updatedLocation || updatedLocation.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update location",
      });
    }

    return updatedLocation[0];
  } catch (error) {
    // Handle database constraint errors
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: "A location with this name already exists",
      });
    }

    // Re-throw createError instances
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // Handle other errors
    console.error("Error updating location:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while updating location",
    });
  }
});
