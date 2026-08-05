export default defineNuxtConfig({
  extends: ["docus"],

  runtimeConfig: {
    // Server-only values (never sent to the client bundle).
    tornFactionId: process.env.TORN_FACTION_ID || "32145",
  },
});
