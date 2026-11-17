import { getRecommender } from "@/lib/recommender";

export async function getMoodBoard({ lat, lng, isVeg, query }: { lat: string, lng: string, isVeg: string, query: string }) {
    return getRecommender().recommendBoard({ query, isVeg: isVeg === "true", lat, lng });
}
