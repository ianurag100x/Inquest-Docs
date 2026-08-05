import { verifySession } from "../../utils/session";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  const token = getCookie(event, "faction_session");

  const session = verifySession(token, config.authSecret as string);

  if (!session) {
    return {
      authenticated: false,
    };
  }

  return {
    authenticated: true,
    user: session,
  };
});
