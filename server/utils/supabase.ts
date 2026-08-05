import { createClient } from "@supabase/supabase-js";
import type { H3Event } from "h3";

export function getSupabaseClient(event: H3Event) {
  const config = useRuntimeConfig(event);
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
