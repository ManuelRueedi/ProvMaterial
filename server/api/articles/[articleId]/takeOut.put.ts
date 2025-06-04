import { z } from "zod";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { getRouterParam } from "h3";
import type { Article, Location, Project } from "@/composables/articles/types";

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
    additionalArticleIds: z.array(z.string().min(1)).optional(), // Support for additional articles
  });

  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { newLocationId, newProjectId, additionalArticleIds } = result.data;

  // Combine route parameter articleId with additional articleIds from body
  const allArticleIds = [articleId, ...(additionalArticleIds || [])];
  const uniqueArticleIds = [...new Set(allArticleIds)]; // Remove duplicates

  /* ─────────────── Artikel prüfen ─────────────── */
  const articles = await db.query.articles.findMany({
    where: inArray(tables.articles.id, uniqueArticleIds),
    columns: {
      id: true,
    },
  });

  const foundArticleIds = articles.map((article) => article.id);
  const notFoundIds = uniqueArticleIds.filter(
    (id) => !foundArticleIds.includes(id),
  );

  if (notFoundIds.length > 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Folgende Artikel wurden nicht gefunden: ${notFoundIds.join(", ")}`,
    });
  }

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

  /* ───── Prüfen, ob Artikel bereits unterwegs sind ───── */
  const openHistories = await db.query.articleLocationHistory.findMany({
    where: and(
      inArray(tables.articleLocationHistory.articleId, uniqueArticleIds),
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
  /* ─────────────── Transaktion ─────────────── */
  const project =
    newProjectId !== undefined
      ? await db.query.projects.findFirst({
          where: eq(tables.projects.id, newProjectId),
        })
      : null;
  try {
    const historyRecords = uniqueArticleIds.map((id) => ({
      articleId: id,
      locationName: location.name,
      locationaddress: location.address ?? "", // ggf. null-able machen
      locationLatitude: location.latitude ?? null,
      locationLongitude: location.longitude ?? null,
      locationID: location.id,
      projectName: project?.name ?? "",
      projectDescription: project?.description ?? "",
      projectId: project?.id ?? null,
    }));

    const updateRecords = uniqueArticleIds.map((id) =>
      db
        .update(tables.articles)
        .set({
          locationId: location.id,
          currentProjectId: project?.id ?? null,
          updatedAt: new Date(),
        })
        .where(eq(tables.articles.id, id)),
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
