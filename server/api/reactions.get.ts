import fs from "node:fs";
import path from "node:path";
import { getSupabaseClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string }>(event);
  const name = body?.name?.trim();

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please enter your name to add a reaction.",
    });
  }

  let count = 0;
  let supabaseSuccess = false;

  // 1. Check & insert in Supabase
  try {
    const supabase = getSupabaseClient(event);

    // Check if name already reacted
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .ilike("name", name)
      .limit(1);

    if (existing && existing.length > 0) {
      // User has already reacted! Get current total count and return
      const { count: currentCount } = await supabase
        .from("reactions")
        .select("*", { count: "exact", head: true });

      return {
        success: true,
        count: currentCount ?? 1,
        alreadyReacted: true,
        hasReacted: true,
        message: "You have already reacted!",
      };
    }

    // Insert new reaction (storing name)
    const { error: insertErr } = await supabase
      .from("reactions")
      .insert([{ name }]);

    if (!insertErr) {
      supabaseSuccess = true;
      const { count: updatedCount } = await supabase
        .from("reactions")
        .select("*", { count: "exact", head: true });

      if (typeof updatedCount === "number") {
        count = updatedCount;
      }
    }
  } catch (err) {
    console.error("Supabase reaction process failed:", err);
  }


  return {
    success: true,
    count: count || 1,
    hasReacted: true,
  };
});
