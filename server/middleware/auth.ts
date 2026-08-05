import { verifySession } from "../utils/session";

const PUBLIC_PATH_PREFIXES = [
  "/api/auth/",
  "/api/reactions",
  "/_nuxt/",
  "/_payload",
  "/_content",
  "/api/_content",
  "/__nuxt_devtools__",
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

  const config = useRuntimeConfig(event);
  const token = getCookie(event, "faction_session");
  const session = verifySession(token, config.authSecret as string);

  /**
   * Login page
   */
  if (path === "/login") {
    if (session) {
      return sendRedirect(event, "/", 302);
    }

    return;
  }

  /**
   * Static assets & auth APIs
   */
  if (isPublicPath(path)) {
    return;
  }

  /**
   * Not authenticated
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
   * Authenticated
   */
  return;
});