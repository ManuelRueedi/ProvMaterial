import { z } from "zod";

// Define validation schema for location creation
const LocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isStorageLocation: z.boolean().optional().default(false),
});

export type CreateLocationRequest = z.infer<typeof LocationSchema>;

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

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    LocationSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid location data",
      data: result.error.issues,
    });
  }

  const locationData = result.data;
  const db = useDrizzle();

  try {
    // Insert new location
    const newLocation = await db
      .insert(tables.locations)
      .values(locationData)
      .returning();

    if (!newLocation || newLocation.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create location",
      });
    }

    return newLocation[0];
  } catch (error: any) {
    console.error("Error creating location:", error);

    // Check for unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ein Standort mit diesem Namen existiert bereits",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ein Fehler ist beim Erstellen des Standorts aufgetreten",
      data: error.message,
    });
  }
});
