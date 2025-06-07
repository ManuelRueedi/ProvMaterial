import { sql, eq } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  isStorageLocation: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export default defineEventHandler(async (event) => {
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Benutzer hat keine Berechtigung auf Standorte zuzugreifen",
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

  const { isStorageLocation } = validationResult.data;

  const db = useDrizzle();

  try {
    // Build where condition based on filter
    const whereCondition =
      isStorageLocation !== undefined
        ? eq(tables.locations.isStorageLocation, isStorageLocation)
        : undefined;

    const allLocations = await db
      .select()
      .from(tables.locations)
      .where(whereCondition)
      .orderBy(sql`${tables.locations.name} asc`);

    if (!allLocations) {
      throw createError({
        statusCode: 500,
        statusMessage: "Keine Standorte gefunden.",
      });
    }

    return allLocations;
  } catch (error: unknown) {
    console.error("Fehler beim Abrufen aller Standorte:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Ein interner Serverfehler ist beim Abrufen der Standorte aufgetreten.",
    });
  }
});
