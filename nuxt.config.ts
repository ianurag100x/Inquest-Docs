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
    tornFactionId: process.env.TORN_FACTION_ID,
    authSecret: process.env.AUTH_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },
});
