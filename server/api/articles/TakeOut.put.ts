import { z } from "zod";
import { eq, and, isNull, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();

  /* ─────────────── Eingaben prüfen ─────────────── */
  const schema = z.object({
    articleId: z.string().trim(),
    newLocationId: z.number().int().positive(),
    newProjectId: z.number().int().positive().optional(),
  });

  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { articleId, newLocationId, newProjectId } = result.data;
  /* ─────────────── Artikel prüfen ─────────────── */
  const article = await db.query.articles.findFirst({
    where: eq(tables.articles.id, articleId),
    columns: {
      id: true,
    },
  });
  if (!article)
    throw createError({
      statusCode: 404,
      statusMessage: "Artikel nicht gefunden.",
    });

  /* ─────────────── Standort prüfen ─────────────── */
  const location = await db.query.locations.findFirst({
    where: eq(tables.locations.id, newLocationId),
  });
  if (!location)
    throw createError({
      statusCode: 400,
      statusMessage: "Standort nicht gefunden.",
    });

  if (location.isStorageLocation)
    throw createError({
      statusCode: 400,
      statusMessage:
        "Der angegebene Standort ist ein Lager und kann nicht als Einsatzort gewählt werden.",
    });

  /* ───── Prüfen, ob Artikel bereits unterwegs ist ───── */
  const openHistory = await db.query.articleLocationHistory.findFirst({
    where: and(
      eq(tables.articleLocationHistory.articleId, articleId),
      isNull(tables.articleLocationHistory.toTs),
    ),
  });

  if (openHistory)
    throw createError({
      statusCode: 409,
      statusMessage: "Artikel befindet sich bereits ausserhalb des Lagers.",
    });
  /* ─────────────── Transaktion ─────────────── */
  try {
    await db.transaction(async (tx) => {
      const project =
        typeof newProjectId === "number"
          ? await tx.query.projects.findFirst({
              where: eq(tables.projects.id, newProjectId),
            })
          : null;

      /* Historie anlegen */
      await tx.insert(tables.articleLocationHistory).values({
        articleId,
        locationName: location.name,
        locationaddress: location.address ?? "", // ggf. null-able machen
        locationLatitude: location.latitude ?? null,
        locationLongitude: location.longitude ?? null,
        locationID: location.id,
        projectName: project?.name ?? "",
        projectDescription: project?.description ?? "",
        projectId: project?.id ?? null,
        fromTs: sql`UNIX_TIMESTAMP()`,
      });

      /* Artikel aktualisieren */
      await tx
        .update(tables.articles)
        .set({
          locationId: location.id,
          currentProjectId: project?.id ?? null,
          updatedAt: sql`UNIX_TIMESTAMP()`,
        })
        .where(eq(tables.articles.id, articleId));
    });

    return { id: articleId };
  } catch (error) {
    console.error("Transaction failed, full error:", error);
    return { success: false };
  }
});
