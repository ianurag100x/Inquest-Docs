import fs from "node:fs";
import path from "node:path";
import { getSupabaseClient } from "../utils/supabase";
import { verifySession } from "../utils/session";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate, private");
  setHeader(event, "Pragma", "no-cache");

  const config = useRuntimeConfig(event);
  const token = getCookie(event, "faction_session");
  const session = verifySession(token, config.authSecret as string);

  const currentUserName = session?.n?.trim() || "";

  let count = 0;
  let hasReacted = false;

  // 1. Try Supabase first
  try {
    const supabase = getSupabaseClient(event);
    
    // Fetch total reaction count
    const { count: totalCount, error } = await supabase
      .from("reactions")
      .select("*", { count: "exact", head: true });

    if (!error && typeof totalCount === "number") {
      count = totalCount;
    }

    // Check if the current logged-in user has already reacted
    if (currentUserName) {
      const { data: userReaction } = await supabase
        .from("reactions")
        .select("id")
        .eq("name", currentUserName)
        .limit(1);

      if (userReaction && userReaction.length > 0) {
        hasReacted = true;
      }
    }

    return { count, hasReacted };
  } catch (err) {
    console.error("Supabase get reactions failed, using CSV fallback:", err);
  }

  return { count, hasReacted };
});
