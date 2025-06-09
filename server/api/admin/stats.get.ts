import { count, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Check admin permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const db = useDrizzle();

  try {
    // Get detailed statistics in parallel
    const [
      articlesCount,
      locationsCount,
      projectsCount,
      usersCount,
      webauthnCount,
      articlesByType,
      articlesInStorage,
      articlesDeployed,
      recentActivity,
      changeLogStats,
      recentChanges,
    ] = await Promise.all([
      // Basic counts
      db.select({ count: count() }).from(tables.articles),
      db.select({ count: count() }).from(tables.locations),
      db.select({ count: count() }).from(tables.projects),
      db.select({ count: count() }).from(tables.users),
      db.select({ count: count() }).from(tables.webauthnCredentials),

      // Articles by type
      db
        .select({
          type: tables.articles.type,
          count: count(),
        })
        .from(tables.articles)
        .groupBy(tables.articles.type),

      // Articles in storage vs deployed
      db
        .select({ count: count() })
        .from(tables.articles)
        .where(
          sql`${tables.articles.locationId} = ${tables.articles.storageLocationId}`,
        ),

      db
        .select({ count: count() })
        .from(tables.articles)
        .where(
          sql`${tables.articles.locationId} != ${tables.articles.storageLocationId}`,
        ),

      // Recent activity (last 10 history entries)
      db.query.articleLocationHistory.findMany({
        orderBy: (history, { desc }) => [desc(history.fromTs)],
        limit: 10,
        with: {
          takeOutUser: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // Change log statistics by action
      db
        .select({
          action: tables.changeLog.action,
          count: count(),
        })
        .from(tables.changeLog)
        .groupBy(tables.changeLog.action),

      // Recent changes (last 10 changelog entries)
      db.query.changeLog.findMany({
        orderBy: (changelog, { desc }) => [desc(changelog.changeTs)],
        limit: 10,
        with: {
          user: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Transform articles by type to object
    const typeDistribution = articlesByType.reduce(
      (acc, item) => {
        acc[item.type] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Transform change log statistics to object
    const changeStats = changeLogStats.reduce(
      (acc, item) => {
        acc[item.action] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      overview: {
        articles: articlesCount[0]?.count || 0,
        locations: locationsCount[0]?.count || 0,
        projects: projectsCount[0]?.count || 0,
        users: usersCount[0]?.count || 0,
        webauthnKeys: webauthnCount[0]?.count || 0,
      },
      articles: {
        total: articlesCount[0]?.count || 0,
        inStorage: articlesInStorage[0]?.count || 0,
        deployed: articlesDeployed[0]?.count || 0,
        byType: typeDistribution,
      },
      activity: {
        recent: recentActivity.map((entry) => ({
          id: entry.id,
          articleId: entry.articleId,
          locationName: entry.locationName,
          projectName: entry.projectName || null,
          userName: entry.takeOutUser
            ? `${entry.takeOutUser.firstName} ${entry.takeOutUser.lastName}`
            : "Unknown",
          timestamp: entry.toTs ? entry.toTs.getTime() : entry.fromTs.getTime(),
          action: entry.toTs ? "returned" : "taken_out",
        })),
      },
      changelog: {
        statistics: changeStats,
        recent: recentChanges.map((entry) => ({
          id: entry.id,
          articleId: entry.articleId || entry.old?.id || entry.new?.id || null,
          action: entry.action,
          userName: entry.user
            ? `${entry.user.firstName} ${entry.user.lastName}`
            : "System",
          timestamp: entry.changeTs?.getTime() || Date.now(),
          oldData: entry.old,
          newData: entry.new,
        })),
      },
      system: {
        timestamp: Date.now(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    };
  } catch (error) {
    console.error("Admin API - Error fetching enhanced stats:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error loading system statistics",
    });
  }
});
