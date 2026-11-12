import { createHash } from "crypto";

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.IP_HASH_SALT ?? ""}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Bot checks shared by the public forms:
 *  - honeypot field ("website") must be empty
 *  - form must have been open for at least 3 seconds (renderedAt timestamp)
 *  - optional Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is set
 */
export async function checkBot(body: { website?: unknown; renderedAt?: unknown; turnstileToken?: unknown }, ip: string) {
  if (typeof body.website === "string" && body.website.trim() !== "") return "honeypot";
  const renderedAt = Number(body.renderedAt);
  if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < 3000) return "too-fast";
  if (Date.now() - renderedAt > 1000 * 60 * 60 * 24) return "stale";

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (typeof body.turnstileToken !== "string" || !body.turnstileToken) return "captcha-missing";
    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({ secret, response: body.turnstileToken, remoteip: ip }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (!data.success) return "captcha-failed";
    } catch {
      return "captcha-unavailable";
    }
  }
  return null;
}

/** Small in-process limiter for login and live endpoints (forms use DB-backed limits). */
const buckets = new Map<string, { count: number; reset: number }>();
export function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  return b.count <= limit;
}
