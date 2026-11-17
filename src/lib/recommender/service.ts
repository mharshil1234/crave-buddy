import { z } from "zod";
import { NOMINATION_TIMEOUT_MS } from "@/socket/types";
import type { BoardRequest, GroupRequest, Recommender } from "./types";

/**
 * HTTP client for the crave-buddy-recommendation service.
 *
 * Contract the service implements:
 *   POST /recommend/board  { query, is_veg }  -> { restaurants: [{ restaurant_id, item_ids }] }
 *   POST /recommend/group  { cravings, candidate_ids } -> { nominees: [{ restaurant_id, match_reason }] }
 */

const BOARD_TIMEOUT_MS = 15_000;

const boardResponseSchema = z.object({
    restaurants: z.array(z.object({
        restaurant_id: z.string().min(1),
        item_ids: z.array(z.string().min(1)),
    })),
});

const groupResponseSchema = z.object({
    nominees: z.array(z.object({
        restaurant_id: z.string().min(1),
        match_reason: z.string().trim().min(1).max(300),
    })),
});

function serviceUrl(path: string) {
    const baseUrl = process.env.RECOMMENDER_URL;
    if (!baseUrl) throw new Error("RECOMMENDER_URL is required when RECOMMENDER_PROVIDER=service");
    return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

async function post<T>(path: string, body: unknown, schema: z.ZodType<T>, timeoutMs: number): Promise<T> {
    const response = await fetch(serviceUrl(path), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(process.env.RECOMMENDER_API_KEY ? { Authorization: `Bearer ${process.env.RECOMMENDER_API_KEY}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
    });
    if (!response.ok) throw new Error(`Recommendation service ${path} failed with ${response.status}`);
    return schema.parse(await response.json());
}

export const serviceRecommender: Recommender = {
    name: "service",

    async recommendBoard({ query, isVeg }: BoardRequest) {
        const result = await post("recommend/board", { query, is_veg: isVeg }, boardResponseSchema, BOARD_TIMEOUT_MS);
        return Object.fromEntries(result.restaurants.map(({ restaurant_id, item_ids }) => [restaurant_id, item_ids]));
    },

    async nominateForGroup({ cravings, candidates }: GroupRequest) {
        const result = await post(
            "recommend/group",
            { cravings, candidate_ids: candidates.map((candidate) => candidate.restaurantId) },
            groupResponseSchema,
            NOMINATION_TIMEOUT_MS - 5000,
        );
        return result.nominees.map(({ restaurant_id, match_reason }) => ({ restaurantId: restaurant_id, matchReason: match_reason }));
    },
};
