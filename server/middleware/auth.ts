import { verifySession } from "../utils/session";

const PUBLIC_PATH_PREFIXES = [
  "/api/auth/",
  "/api/reactions",
  "/_nuxt/",
  "/_payload",
  "/_content",
  "/api/_content",
  "/__nuxt_content",
  "/__nuxt_devtools__",
  "/__nuxt",
  "/favicon.ico",
  "/robots.txt",
  "/site.webmanifest",
  "/icon",
  "/images/",
];

function isPublicPath(path: string) {
  return PUBLIC_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;

  /**
   * 1. Static assets & auth APIs (return early without no-cache headers)
   */
  if (isPublicPath(path)) {
    return;
  }

  const config = useRuntimeConfig(event);
  const token = getCookie(event, "faction_session");
  const session = verifySession(token, config.authSecret as string);

  // 2. Prevent browser/Vercel CDN 304 caching of authenticated HTML pages and redirects
  setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate, private");
  setHeader(event, "Pragma", "no-cache");

  /**
   * 3. Login page
   */
  if (path === "/login" || path === "/login/") {
    if (session) {
      return sendRedirect(event, "/", 302);
    }

    return;
  }

  /**
   * 4. Not authenticated
   */
  if (!session) {
    if (path.startsWith("/api/") || event.method !== "GET") {
      throw createError({
        statusCode: 401,
        statusMessage: "Not authenticated",
      });
    }

    return sendRedirect(
      event,
      `/login?redirect=${encodeURIComponent(path)}`,
      302,
    );
  }

  /**
   * 5. Authenticated
   */
  return;
});