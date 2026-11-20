import "server-only";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

// ─── Config ───────────────────────────────────────────────────────────────────

export function isRatelimitConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ─── IP extraction ────────────────────────────────────────────────────────────

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // x-real-ip is injected by Vercel's infrastructure and is not spoofable by
  // clients once traffic passes through Vercel's edge.
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  // x-forwarded-for: "client, proxy1, proxy2" — first segment is the origin.
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// ─── Core limiter ─────────────────────────────────────────────────────────────

// "open"   – fail-open when Upstash is not configured: allow the request and
//            emit a CRITICAL log so operators know to fix the env vars. Right
//            for public-facing forms where availability matters more than
//            blocking a brief window of unchecked traffic during misconfiguration.
// "closed" – fail-closed: block the request. Right for security-critical paths
//            (e.g. admin login) where the risk of an unprotected endpoint
//            outweighs a temporary denial of service to the operator.
type OnMisconfigured = "open" | "closed";

async function applyLimit(
  identifier: string,
  max: number,
  window: string,
  onMisconfigured: OnMisconfigured = "open",
): Promise<RateLimitResult> {
  if (!isRatelimitConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[ratelimit] WARNING: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN " +
          "not set — rate limiting is DISABLED. This is a development fallback " +
          "only, not production protection.",
      );
      return { allowed: true };
    }
    if (onMisconfigured === "closed") {
      console.error(
        "[ratelimit] CRITICAL: Upstash credentials missing in production. " +
          "Blocking request as a fail-safe.",
      );
      return { allowed: false };
    }
    // fail-open: do not punish legitimate users with a misleading rate-limit
    // error when the real problem is missing env vars.
    console.error(
      "[ratelimit] CRITICAL: Upstash credentials missing in production. " +
        "Allowing request — rate limiting is NOT active. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.",
    );
    return { allowed: true };
  }

  try {
    // Instances are created inside the function so env vars are read at
    // call time, which keeps the module testable without module-reload tricks.
    const limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(max, window as `${number} ${"ms" | "s" | "m" | "h" | "d"}`),
      prefix: "nexchair:rl",
    });

    const { success, reset } = await limiter.limit(identifier);

    if (!success) {
      // reset is a Unix timestamp in milliseconds.
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((reset - Date.now()) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true };
  } catch (err) {
    // Fail open: log the error but allow the request rather than causing a DoS
    // when Upstash is temporarily unavailable. The error is never silenced.
    console.error("[ratelimit] Upstash request failed:", err);
    return { allowed: true };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Admin login protection.
 * 5 attempts per 15-minute sliding window, keyed on IP + email.
 * Rationale: brute force needs thousands of attempts; 5/15 min stops that
 * while giving a legitimate admin enough retries before a short cooldown.
 * Fails closed when Upstash is not configured: an unprotected login endpoint
 * is more dangerous than a temporarily locked-out admin.
 */
export async function checkLoginRateLimit(
  email: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return applyLimit(`login:${ip}:${email.toLowerCase()}`, 5, "15 m", "closed");
}

/**
 * Public enquiry form protection.
 * 5 submissions per 10-minute sliding window, keyed on IP.
 * Rationale: real users rarely send more than 1–2 enquiries per session;
 * 5/10 min accommodates retries without enabling inbox flooding.
 * Fails open when Upstash is not configured: a misconfigured rate limiter
 * must not silently block every legitimate enquiry with a misleading
 * "Too many submissions" error.
 */
export async function checkEnquiryRateLimit(): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return applyLimit(`enquiry:${ip}`, 5, "10 m", "open");
}
