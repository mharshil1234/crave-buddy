import { geminiRecommender } from "./gemini";
import { serviceRecommender } from "./service";
import type { Recommender } from "./types";

export type { BoardRecommendation, BoardRequest, GroupNomination, GroupRequest, Recommender } from "./types";

const providers: Record<string, Recommender> = {
    gemini: geminiRecommender,
    service: serviceRecommender,
};

/** Picks the provider from RECOMMENDER_PROVIDER (gemini | service). Defaults to gemini. */
export function getRecommender(): Recommender {
    const name = process.env.RECOMMENDER_PROVIDER?.trim().toLowerCase() || "gemini";
    const provider = providers[name];
    if (!provider) throw new Error(`Unknown RECOMMENDER_PROVIDER "${name}". Use one of: ${Object.keys(providers).join(", ")}`);
    return provider;
}
