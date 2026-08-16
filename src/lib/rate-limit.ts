import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Fixed-window rate limiter.
 *
 * Uses Upstash Redis when configured; otherwise falls back to an in-process Map.
 * The fallback is per-instance, so on serverless it only slows an attacker down
 * rather than stopping them — set the Upstash vars in production.
 */
type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

async function redis(command: (string | number)[]) {
  const res = await fetch(`${REDIS_URL}/${command.map(String).map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  return (await res.json()) as { result: number };
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/**
 * Read-only check. Use before doing the work, so a caller that is already
 * blocked cannot proceed.
 */
export async function isRateLimited(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (useRedis) {
    try {
      const { result } = await redis(["GET", key]);
      const count = Number(result ?? 0);
      return count >= limit
        ? { ok: false, retryAfterSeconds: windowSeconds }
        : { ok: true, retryAfterSeconds: 0 };
    } catch {
      /* fall through */
    }
  }
  const bucket = memory.get(key);
  const now = Date.now();
  if (!bucket || bucket.resetAt < now || bucket.count < limit) {
    return { ok: true, retryAfterSeconds: 0 };
  }
  return {
    ok: false,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Clear a counter — call after a successful attempt. */
export async function resetRateLimit(key: string) {
  if (useRedis) {
    try {
      await redis(["DEL", key]);
      return;
    } catch {
      /* fall through */
    }
  }
  memory.delete(key);
}

/** Increment a counter. Call only when an attempt *fails*. */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (useRedis) {
    try {
      const { result: count } = await redis(["INCR", key]);
      if (count === 1) await redis(["EXPIRE", key, windowSeconds]);
      return count > limit
        ? { ok: false, retryAfterSeconds: windowSeconds }
        : { ok: true, retryAfterSeconds: 0 };
    } catch {
      // Never let a limiter outage take down login — fall through to memory.
    }
  }

  const now = Date.now();
  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Hashed client IP — enough to throttle on, without storing personal data. */
export function clientIpHash() {
  const h = headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
