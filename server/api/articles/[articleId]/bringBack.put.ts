import {
  createError,
  defineEventHandler,
  getRouterParam,
  readValidatedBody,
} from "h3";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  additionalArticleIds: z.array(z.string()).max(99).optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to access articles",
    });
  }

  const db = useDrizzle();

  // Get articleId from route parameter
  const rawArticleId = getRouterParam(event, "articleId") ?? "";
  if (!rawArticleId || rawArticleId.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing articleId parameter",
    });
  }
  const articleId = decodeURIComponent(rawArticleId);

  /* ───────────── Body ─────────────── */
  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { additionalArticleIds } = result.data;

  // Combine route parameter articleId with additional articleIds from body
  const allArticleIds = [articleId, ...(additionalArticleIds || [])];
  const uniqueArticleIds = [...new Set(allArticleIds)]; // Remove duplicates

  /* ─────────────── Artikel prüfen ─────────────── */
  const articles = await db.query.articles.findMany({
    where: inArray(tables.articles.id, uniqueArticleIds),
    columns: {
      id: true,
      storageLocationId: true,
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

  /* ───── Prüfen, ob Artikel tatsächlich "draußen" sind ───── */
  const openHistories = await db.query.articleLocationHistory.findMany({
    where: and(
      inArray(tables.articleLocationHistory.articleId, uniqueArticleIds),
      isNull(tables.articleLocationHistory.toTs),
    ),
    columns: {
      id: true,
      articleId: true,
    },
  });

  const articlesOut = openHistories.map((h) => h.articleId);
  const notOutIds = uniqueArticleIds.filter((id) => !articlesOut.includes(id));

  if (notOutIds.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: `Folgende Artikel befinden sich bereits im Lager: ${notOutIds.join(", ")}`,
    });
  } /* ─────────────── Transaktion ─────────────── */
  try {
    const now = new Date();

    // First, close all open history records
    for (const history of openHistories) {
      await db
        .update(tables.articleLocationHistory)
        .set({
          toTs: now,
          bringBackUserId: session.user.userId,
        })
        .where(eq(tables.articleLocationHistory.id, history.id));
    }

    // Then, update all articles back to storage location
    for (const article of articles) {
      await db
        .update(tables.articles)
        .set({
          locationId: article.storageLocationId,
          currentProjectId: null,
          updatedAt: now,
        })
        .where(eq(tables.articles.id, article.id));
    }

    return { success: true, articlesReturned: uniqueArticleIds.length };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Transaction failed, full error: " + error,
    });
  }
});
