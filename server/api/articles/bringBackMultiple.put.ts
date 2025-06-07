import { createError, defineEventHandler, readValidatedBody } from "h3";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Article, Location, Project } from "@/composables/articles/types";

const schema = z.object({
  articleIds: z.array(z.string()).min(1).max(100),
});

export default defineEventHandler(async (event) => {
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "User does not have permission to access articles",
    });
  }

  const db = useDrizzle();

  /* ───────────── Body ─────────────── */
  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const { articleIds } = result.data;

  // Remove duplicates
  const uniqueArticleIds = [...new Set(articleIds)];

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
  }
  /* ─────────────── Transaktion ─────────────── */
  try {
    const now = new Date();

    // First, close all open history records
    for (const history of openHistories) {
      await db
        .update(tables.articleLocationHistory)
        .set({ toTs: now })
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
