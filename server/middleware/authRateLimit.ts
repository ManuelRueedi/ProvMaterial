import { getClientIP, isRateLimited } from "../utils/authRetry";

export default defineEventHandler(async (event) => {
  // Only apply rate limiting to authentication endpoints
  const url = getRequestURL(event);
  const isAuthEndpoint =
    url.pathname.startsWith("/auth/") && event.node.req.method === "POST";

  if (!isAuthEndpoint) {
    return; // Not an auth endpoint, skip rate limiting
  }

  const ip = getClientIP(event);

  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "Too many authentication attempts. Please try again later.",
    });
  }
});
