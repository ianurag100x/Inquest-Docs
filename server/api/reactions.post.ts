import { getSupabaseClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string;
  }>(event);

  const name = body.name?.trim();

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please enter your name.",
    });
  }

  const supabase = getSupabaseClient(event);

  // Check if the user has already reacted
  const { data: existing, error: existingError } = await supabase
    .from("reactions")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    throw createError({
      statusCode: 500,
      statusMessage: existingError.message,
    });
  }

  if (existing) {
    const { count } = await supabase
      .from("reactions")
      .select("*", {
        head: true,
        count: "exact",
      });

    return {
      success: false,
      alreadyReacted: true,
      message: "You've already reacted. Thank you for your support! 💜",
      count: count ?? 0,
    };
  }

  // Insert new reaction
  const { error } = await supabase
    .from("reactions")
    .insert({
      name,
    });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  const { count } = await supabase
    .from("reactions")
    .select("*", {
      head: true,
      count: "exact",
    });

  return {
    success: true,
    alreadyReacted: false,
    message: "Thank you for reacting! 💜",
    count: count ?? 0,
  };
});