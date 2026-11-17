import { redis } from "@/lib/redis";

type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window limiter backed by Upstash Redis.
 * Fails open if Redis is unreachable so an outage doesn't block the app.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    try {
        const count = await redis.incr(redisKey);
        if (count === 1) await redis.expire(redisKey, windowSeconds);
        const ttl = await redis.ttl(redisKey);
        if (ttl < 0) await redis.expire(redisKey, windowSeconds);
        return {
            allowed: count <= limit,
            remaining: Math.max(0, limit - count),
            retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
        };
    } catch (error) {
        console.error("Rate limiter unavailable:", error);
        return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
    }
}

export function clientIp(headers: Headers): string {
    return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
