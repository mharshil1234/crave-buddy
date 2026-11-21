import { z } from "zod";
import { formatCostForTwo, getRestaurant, listRestaurantsWithMenus, restaurantImageUrl, toRestaurantWithMenu } from "@/lib/catalogue";
import { getRecommender } from "@/lib/recommender";
import { type RestaurantCandidate, type RestaurantNominee, type SessionPrompt } from "@/socket/types";

export const restaurantNomineeSchema = z.object({
    restaurantId: z.string().min(1),
    name: z.string().min(1),
    image: z.string(),
    cuisines: z.array(z.string()),
    rating: z.number(),
    deliveryTime: z.string(),
    costForTwo: z.string(),
    matchReason: z.string().trim().min(1).max(300),
});

export async function getGroupRestaurantCandidates(): Promise<RestaurantCandidate[]> {
    const restaurants = await listRestaurantsWithMenus({ openOnly: true });
    return restaurants.map((restaurant) => ({
        restaurantId: restaurant.id,
        name: restaurant.name,
        image: restaurantImageUrl(restaurant.cloudinary_image_id),
        cuisines: restaurant.cuisines,
        rating: restaurant.rating ?? 0,
        deliveryTime: restaurant.delivery_time ?? "",
        costForTwo: formatCostForTwo(restaurant.cost_for_two),
    }));
}

export async function getMoodRoomRestaurantMenu(restaurantId: string) {
    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant || !restaurant.menu_items.length) throw new Error("Restaurant menu is not available");
    return toRestaurantWithMenu(restaurant);
}

export function validateGroupNominations(value: unknown, restaurants: RestaurantCandidate[]): RestaurantNominee[] {
    const nominees = z.array(z.object({
        restaurantId: z.string(),
        matchReason: z.string().trim().min(1).max(300),
    })).min(3).max(4).parse(value);
    const candidates = new Map(restaurants.map((restaurant) => [restaurant.restaurantId, restaurant]));
    if (new Set(nominees.map((nominee) => nominee.restaurantId)).size !== nominees.length) {
        throw new Error("Restaurant nominations must be unique");
    }
    return nominees.map((nominee) => {
        const restaurant = candidates.get(nominee.restaurantId);
        if (!restaurant) throw new Error("Restaurant nomination is outside the candidate list");
        return { ...restaurant, matchReason: nominee.matchReason };
    });
}

export async function getGroupNominatedRestaurants({ prompts, restaurants }: {
    prompts: SessionPrompt[];
    restaurants: RestaurantCandidate[];
}): Promise<RestaurantNominee[]> {
    if (!prompts.length || restaurants.length < 3) throw new Error("Cravings and at least three restaurant candidates are required");
    const nominations = await getRecommender().nominateForGroup({
        cravings: prompts.map((prompt) => prompt.prompt),
        candidates: restaurants,
    });
    return validateGroupNominations(nominations, restaurants);
}
