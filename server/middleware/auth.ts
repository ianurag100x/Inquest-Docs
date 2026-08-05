import { verifySession } from "../utils/session";

// Paths that must remain reachable without a session.
const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/api/auth/",
  "/_nuxt/",
  "/__nuxt_devtools__",
  "/favicon.ico",
  "/robots.txt",
  "/site.webmanifest",
  "/icon",
  "/images/",
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // Only gate actual page navigations / document requests; let assets,
  // the login page, and the auth API itself through.
  if (isPublicPath(path)) {
    return;
  }

  const config = useRuntimeConfig(event);
  const token = getCookie(event, "faction_session");
  const session = verifySession(token, config.authSecret as string);

  if (!session) {
    // Non-GET requests (e.g. an API call from client JS) get a 401,
    // page navigations get redirected to the login screen.
    if (event.method !== "GET") {
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
});
