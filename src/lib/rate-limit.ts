import { getCache } from "@vercel/functions";

const WINDOW_SECONDS = 600;
const MAX_REQUESTS_PER_WINDOW = 8;

/**
 * Fixed-window per-IP limiter backed by Vercel Runtime Cache. Each agent
 * message can trigger many LLM calls and spin up a sandbox, so this guards
 * against a script hammering /api/agent and draining AI Gateway credits.
 * Falls back to an in-memory cache outside Vercel (e.g. `next dev`).
 */
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const cache = getCache();
  const windowId = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `ratelimit:${ip}:${windowId}`;

  const current = ((await cache.get(key)) as number | null) ?? 0;

  if (current >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % WINDOW_SECONDS);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  await cache.set(key, current + 1, { ttl: WINDOW_SECONDS, tags: ["ratelimit"] });
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - current - 1,
    retryAfterSeconds: 0,
  };
}
