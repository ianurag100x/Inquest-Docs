export default defineNuxtConfig({
  extends: ["docus"],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
      global: true,
    },
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    // Server-only values (never sent to the client bundle).
    tornFactionId: process.env.TORN_FACTION_ID || "21665",
    authSecret:
      process.env.AUTH_SECRET ||
      "f18a7ecee1b4584d9dcae77dbc28f72f21bafa9ac830f9409eee2726c0f16f08",
    supabaseUrl:
      process.env.SUPABASE_URL || "https://rwokbfpyxtzeqpntvhtm.supabase.co",
    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY ||
      "sb_publishable_a6Z_3RnM_83a4uT9idsjfw_wVa2ImIr",
  },
});
