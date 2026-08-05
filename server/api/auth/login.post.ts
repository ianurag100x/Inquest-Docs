import { signSession } from "../../utils/session";
import { getSupabaseClient } from "../../utils/supabase";

interface TornFactionResponse {
  faction?: {
    faction_id?: number;
    id?: number;
    name?: string;
    faction_name?: string;
    position?: string;
  };
  error?: {
    code: number;
    error: string;
  };
}

interface TornBasicResponse {
  profile?: {
    id: number;
    name: string;
  };

  error?: {
    code: number;
    error: string;
  };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody<{ apiKey?: string }>(event);
  const apiKey = body?.apiKey?.trim();

  if (!apiKey || apiKey.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please enter a valid Torn API key.",
    });
  }

  const supabase = getSupabaseClient(event);
  const requiredFactionId = Number(config.tornFactionId);

  const logAttempt = async (opts: {
    tornUserId?: number | null;
    tornName?: string | null;
    factionId?: number | null;
    factionName?: string | null;
    success: boolean;
    reason?: string | null;
  }) => {
    try {
      await supabase.rpc("record_torn_login", {
        p_torn_user_id: opts.tornUserId ?? null,
        p_torn_name: opts.tornName ?? null,
        p_faction_id: opts.factionId ?? null,
        p_faction_name: opts.factionName ?? null,
        p_success: opts.success,
        p_reason: opts.reason ?? null,
      });
    } catch (err) {
      console.error("Torn basic endpoint failed:", err);
    }
  };

  // 1. Verify the key and pull the caller's faction.
  let factionData: TornFactionResponse;

  try {
    factionData = await $fetch<TornFactionResponse>(
      "https://api.torn.com/v2/user/faction",
      {
        query: { key: apiKey },
      },
    );
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not reach the Torn API. Please try again.",
    });
  }

  if (factionData.error) {
    await logAttempt({
      success: false,
      reason: `torn_api_error_${factionData.error.code}`,
    });
    throw createError({
      statusCode: 401,
      statusMessage: factionData.error.error || "Torn rejected this API key.",
    });
  }

  const factionId = factionData.faction?.faction_id ?? factionData.faction?.id;
  const factionName =
    factionData.faction?.name ?? factionData.faction?.faction_name ?? null;

  console.log("========== INQUEST AUTH DEBUG ==========");

  console.log("Runtime Config:");
  console.log({
    tornFactionId: config.tornFactionId,
    requiredFactionId: Number(config.tornFactionId),
  });

  console.log("Torn Response:");
  console.log({
    factionId,
    factionName,
  });

  console.log("========================================");
  // 2. Pull basic profile info (best-effort, used only for display/audit).
  let tornUserId: number | undefined;
  let tornName: string | undefined;
  try {
    const basic = await $fetch<TornBasicResponse>(
      "https://api.torn.com/v2/user/basic",
      {
        query: { key: apiKey },
      },
    );
    tornUserId = basic.profile?.id;
    tornName = basic.profile?.name;
  } catch (err) {
    console.error("Torn basic endpoint failed:", err);
  }

  console.log("Comparison:");
  console.log({
    factionId,
    requiredFactionId,
    equal: factionId === requiredFactionId,
    factionType: typeof factionId,
    requiredType: typeof requiredFactionId,
  });

  // 3. Enforce the faction gate.
  if (!factionId || factionId !== requiredFactionId) {
    await logAttempt({
      tornUserId,
      tornName,
      factionId,
      factionName,
      success: false,
      reason: "faction_mismatch",
    });
    throw createError({
      statusCode: 403,
      statusMessage:
        "This documentation is only available to members of the required faction.",
    });
  }

  await logAttempt({
    tornUserId,
    tornName,
    factionId,
    factionName,
    success: true,
  });

  // 4. Issue a signed session cookie. The raw API key is never stored.
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 60 * 60 * 24 * 7;

  const token = signSession(
    {
      v: 1,

      u: tornUserId ?? 0,

      n: tornName ?? "Unknown",

      f: factionId,

      fn: factionName ?? "Unknown",

      p: factionData.faction?.position ?? "Member",

      i: now,

      e: expires,
    },
    config.authSecret as string,
  );

  setCookie(event, "faction_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    name: tornName ?? "Unknown",
    factionName,
  };
});
