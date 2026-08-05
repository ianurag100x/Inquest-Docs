import { getSupabaseClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseClient(event);

  const { count, error } = await supabase
    .from("reactions")
    .select("*", {
      head: true,
      count: "exact",
    });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    count: count ?? 0,
  };
});