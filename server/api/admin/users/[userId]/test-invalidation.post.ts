export default defineEventHandler(async (event) => {
  // Check admin permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Administrator-Berechtigung erforderlich",
    });
  }

  const userId = getRouterParam(event, "userId");

  if (!userId || isNaN(Number(userId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ungültige Benutzer-ID",
    });
  }

  try {
    // Get current session info
    const userSession = await getUserSession(event);
    console.log(`🔍 Current session:`, {
      userId: userSession?.user?.userId,
      loggedInAt: userSession?.user?.loggedInAt,
      loggedInAtDate: userSession?.user?.loggedInAt
        ? new Date(userSession.user.loggedInAt).toISOString()
        : "undefined",
    });

    // Check invalidation status
    const invalidationKey = `session:invalidate:${userId}`;
    const invalidationTimestamp = await hubKV().get<number>(invalidationKey);

    console.log(`🔑 Checking invalidation for user ${userId}`);
    console.log(`📦 KV key: ${invalidationKey}`);
    console.log(
      `⏰ Invalidation timestamp: ${invalidationTimestamp} ${invalidationTimestamp ? `(${new Date(invalidationTimestamp).toISOString()})` : "(not set)"}`,
    );

    // Manually force session invalidation for testing
    const timestamp = Date.now();
    await hubKV().set(invalidationKey, timestamp, { ttl: 60 * 60 * 24 * 30 });

    console.log(
      `🔒 Forced invalidation timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`,
    );

    // Verify it was set
    const verification = await hubKV().get<number>(invalidationKey);
    console.log(
      `✅ Verification: ${verification} ${verification ? `(${new Date(verification).toISOString()})` : "(not found)"}`,
    );

    return {
      success: true,
      message: `Session invalidation set for user ${userId}`,
      data: {
        userId: Number(userId),
        invalidationKey,
        timestamp,
        verification,
        currentSession: {
          userId: userSession?.user?.userId,
          loggedInAt: userSession?.user?.loggedInAt,
        },
      },
    };
  } catch (error) {
    console.error("Test invalidation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Testen der Session-Invalidierung",
    });
  }
});
