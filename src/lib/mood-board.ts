import { getRecommender } from "@/lib/recommender";
import { validateBoard } from "@/lib/recommender/validate";
import { getRestaurantById } from "@/lib/restaurant";
import type { RestaurantWithMenu } from "@/types/restaurant";

export type MoodBoardRestaurant = RestaurantWithMenu & { id: string };

/** Turns a stored board (restaurantId -> itemIds) into restaurants carrying only their picked dishes. */
export async function hydrateMoodBoard({ lat, lng, moodBoard }: { lat: string; lng: string; moodBoard: Record<string, string[]> }): Promise<MoodBoardRestaurant[]> {
    const restaurants = await Promise.all(Object.entries(moodBoard).map(async ([restaurantId, itemIds]) => {
        try {
            const { data } = await getRestaurantById({ lat, lng, restaurantId });
            const menu = data.menu.filter((item) => itemIds.includes(item.id));
            return menu.length ? { id: restaurantId, ...data, menu } : null;
        } catch {
            return null;
        }
    }));
    return restaurants.filter((restaurant): restaurant is MoodBoardRestaurant => restaurant !== null);
}

export async function getMoodBoard({ lat, lng, isVeg, query }: { lat: string, lng: string, isVeg: string, query: string }) {
    const vegOnly = isVeg === "true";
    const raw = await getRecommender().recommendBoard({ query, isVeg: vegOnly, lat, lng });
    return validateBoard(raw, { isVeg: vegOnly });
}
