import { getSupabaseClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string;
    emoji?: string;
  }>(event);

  const name = body.name?.trim();

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please enter your name.",
    });
  }

  const supabase = getSupabaseClient(event);

  const { error } = await supabase
  .from("reactions")
  .upsert(
    {
      name,
      emoji: body.emoji ?? "❤️",
    },
    {
      onConflict: "name",
    }
  );

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
    count: count ?? 0,
  };
})