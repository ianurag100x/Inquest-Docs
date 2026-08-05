import { createHmac, timingSafeEqual } from "node:crypto";

export interface SessionPayload {
  v: number;

  u: number; // Torn User ID

  n: string; // Player Name

  f: number; // Faction ID

  fn: string; // Faction Name

  p: string; // Position

  i: number; // Issued At

  e: number; // Expiry
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function signSession(payload: SessionPayload, secret: string): string {
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(
  token: string | undefined | null,
  secret: string,
): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expectedSig = createHmac("sha256", secret)
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8"),
    ) as SessionPayload;
    if (!payload?.e || payload.e < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
