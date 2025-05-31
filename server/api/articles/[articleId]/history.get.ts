import { eq } from "drizzle-orm";
import { getRouterParam, createError, defineEventHandler } from "h3";
import { z } from "zod";

export type HistoryView = {
  locationName: string;
  locationAddress: string;
  projectName: string | null;
  projectDescription: string | null;
  from: number; // Unix ms
  to: number | null; // Unix ms
};

export default defineEventHandler(async (event): Promise<HistoryView[]> => {
  /* ── 1. read + validate slot ─────────────────────────────── */
  try {
    // Get raw param directly from the request URL to avoid potential decoding issues
    const rawId = getRouterParam(event, "articleId") ?? "";
    console.log("Raw articleId from URL:", rawId);

    // Basic validation
    if (!rawId || rawId.trim() === "") {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing articleId parameter",
      });
    }

    // Decode manually if needed (h3 should do this automatically but just to be safe)
    const articleId = decodeURIComponent(rawId);
    console.log("Decoded articleId:", articleId);

    /* ── 2. fetch data ───────────────────────────────────────── */
    try {
      const db = useDrizzle();
      // console.log("Querying database for articleId:", articleId);

      const rows = await db.query.articleLocationHistory.findMany({
        where: eq(tables.articleLocationHistory.articleId, articleId),
        orderBy: (article, { desc }) => [desc(article.fromTs)],
      });

      // console.log(
      //   `Found ${rows.length} history entries for article ${articleId}`,
      // );

      /* map → API view */
      return rows.map<HistoryView>((r) => ({
        locationName: r.locationName,
        locationAddress: r.locationaddress ?? "",
        projectName: r.projectName,
        projectDescription: r.projectDescription,
        from: new Date(r.fromTs).getTime(),
        to: r.toTs ? new Date(r.toTs).getTime() : null,
      }));
    } catch (err: any) {
      console.error("Database error:", err);
      throw createError({
        statusCode: 500,
        statusMessage: "Database error",
        data: {
          message: err?.message ?? String(err),
          code: err?.code,
          query: "articleLocationHistory lookup",
        },
      });
    }
  } catch (err: any) {
    console.error("Error in history handler:", err);
    if (err.statusCode) throw err; // Already a formatted error

    throw createError({
      statusCode: 500,
      statusMessage: "Server error processing request",
      data: err?.message ?? String(err),
    });
  }
});
