import { z } from "zod";
import { eq, and, isNull, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to access articles",
    });
  }

  const db = useDrizzle();

  /* ─────────────── Eingaben prüfen ─────────────── */
  // Validate request body
  const schema = z.object({
    articleIds: z.array(z.string().min(1)).min(1).max(100), // Allow up to 100 articles at once
    newLocationId: z.number().int().positive(),
    newProjectId: z.number().int().positive().optional(),
  });

  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { articleIds, newLocationId, newProjectId } = result.data;

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

  /* ─────────────── Artikel prüfen ─────────────── */
  const articles = await db.query.articles.findMany({
    where: inArray(tables.articles.id, articleIds),
    columns: {
      id: true,
    },
  });

  const foundArticleIds = articles.map((article) => article.id);
  const notFoundIds = articleIds.filter((id) => !foundArticleIds.includes(id));

  if (notFoundIds.length > 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Folgende Artikel wurden nicht gefunden: ${notFoundIds.join(", ")}`,
    });
  }

  /* ───── Prüfen, ob Artikel bereits unterwegs sind ───── */
  const openHistories = await db.query.articleLocationHistory.findMany({
    where: and(
      inArray(tables.articleLocationHistory.articleId, articleIds),
      isNull(tables.articleLocationHistory.toTs),
    ),
    columns: {
      articleId: true,
    },
  });

  if (openHistories.length > 0) {
    const alreadyOutIds = openHistories.map((h) => h.articleId);
    throw createError({
      statusCode: 409,
      statusMessage: `Folgende Artikel befinden sich bereits ausserhalb des Lagers: ${alreadyOutIds.join(", ")}`,
    });
  }

  /* ─────────────── Projekt prüfen ─────────────── */
  const project =
    newProjectId !== undefined
      ? await db.query.projects.findFirst({
          where: eq(tables.projects.id, newProjectId),
        })
      : null;

  /* ─────────────── Transaktion ─────────────── */
  try {
    const historyRecords = articleIds.map((articleId) => ({
      articleId,
      locationName: location.name,
      locationaddress: location.address ?? "",
      locationLatitude: location.latitude ?? null,
      locationLongitude: location.longitude ?? null,
      locationID: location.id,
      projectName: project?.name ?? "",
      projectDescription: project?.description ?? "",
      projectId: project?.id ?? null,
      takeOutUserId: session.user.userId,
    }));

    const updateRecords = articleIds.map((articleId) =>
      db
        .update(tables.articles)
        .set({
          locationId: location.id,
          currentProjectId: project?.id ?? null,
          updatedAt: new Date(),
        })
        .where(eq(tables.articles.id, articleId)),
    );

    return await db.batch([
      /* Historie anlegen */
      db.insert(tables.articleLocationHistory).values(historyRecords),
      /* Artikel aktualisieren */
      ...updateRecords,
    ]);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Transaction failed, full error: " + error,
    });
  }
});
