import { beforeEach, describe, expect, it, vi } from "vitest";

const { store, ttls, redis } = vi.hoisted(() => {
    const store = new Map<string, number>();
    const ttls = new Map<string, number>();
    const redis = {
        incr: vi.fn(async (key: string) => { store.set(key, (store.get(key) ?? 0) + 1); return store.get(key)!; }),
        expire: vi.fn(async (key: string, seconds: number) => { ttls.set(key, seconds); return 1; }),
        ttl: vi.fn(async (key: string) => ttls.get(key) ?? -1),
    };
    return { store, ttls, redis };
});
vi.mock("@/lib/redis", () => ({ redis }));

import { clientIp, rateLimit } from "./rate-limit";

beforeEach(() => {
    store.clear();
    ttls.clear();
    vi.clearAllMocks();
});

describe("rateLimit", () => {
    it("allows up to the limit then blocks", async () => {
        const results = [];
        for (let i = 0; i < 4; i++) results.push(await rateLimit("user:1", 3, 60));
        expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
        expect(results[3]).toMatchObject({ remaining: 0, retryAfterSeconds: 60 });
        expect(redis.incr).toHaveBeenCalledWith("ratelimit:user:1");
    });

    it("keeps separate counters per key", async () => {
        await rateLimit("a", 1, 60);
        expect((await rateLimit("b", 1, 60)).allowed).toBe(true);
    });

    it("fails open when Redis throws", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        redis.incr.mockRejectedValueOnce(new Error("down"));
        expect(await rateLimit("x", 1, 60)).toMatchObject({ allowed: true });
    });
});

describe("clientIp", () => {
    it("prefers the first forwarded address", () => {
        expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
        expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
        expect(clientIp(new Headers())).toBe("unknown");
    });
});
