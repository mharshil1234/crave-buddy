import { getRecommender } from "@/lib/recommender";
import { validateBoard } from "@/lib/recommender/validate";

export async function getMoodBoard({ lat, lng, isVeg, query }: { lat: string, lng: string, isVeg: string, query: string }) {
    const vegOnly = isVeg === "true";
    const raw = await getRecommender().recommendBoard({ query, isVeg: vegOnly, lat, lng });
    return validateBoard(raw, { isVeg: vegOnly });
}
