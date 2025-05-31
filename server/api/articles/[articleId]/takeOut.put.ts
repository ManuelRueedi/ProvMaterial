import { z } from "zod";
import { eq, and, isNull, sql } from "drizzle-orm";
import { projects } from "~~/server/database/schema";
import { getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();

  /* ─────────────── Eingaben prüfen ─────────────── */
  // Get articleId from route parameter
  const rawArticleId = getRouterParam(event, "articleId") ?? "";
  if (!rawArticleId || rawArticleId.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing articleId parameter",
    });
  }
  const articleId = decodeURIComponent(rawArticleId);

  // Validate request body
  const schema = z.object({
    newLocationId: z.number().int().positive(),
    newProjectId: z.number().int().positive().optional(),
  });

  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { newLocationId, newProjectId } = result.data;

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
  const project =
    newProjectId !== undefined
      ? await db.query.projects.findFirst({
          where: eq(tables.projects.id, newProjectId),
        })
      : null;
  try {
    return await db.batch([
      /* Historie anlegen */
      db.insert(tables.articleLocationHistory).values({
        articleId,
        locationName: location.name,
        locationaddress: location.address ?? "", // ggf. null-able machen
        locationLatitude: location.latitude ?? null,
        locationLongitude: location.longitude ?? null,
        locationID: location.id,
        projectName: project?.name ?? "",
        projectDescription: project?.description ?? "",
        projectId: project?.id ?? null,
      }),

      /* Artikel aktualisieren */
      db
        .update(tables.articles)
        .set({
          locationId: location.id,
          currentProjectId: project?.id ?? null,
          updatedAt: new Date(),
        })
        .where(eq(tables.articles.id, articleId)),
    ]);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Transaction failed, full error: " + error,
    });
  }
});
