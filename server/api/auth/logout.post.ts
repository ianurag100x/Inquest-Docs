export default defineEventHandler((event) => {
  deleteCookie(event, "faction_session", {
    path: "/",
  });

  return {
    success: true,
  };
});
