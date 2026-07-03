import { getRestaurants, getRestaurantById } from "./restaurant";
import { geminiFlash } from "./ai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { MenuItem } from "@/types/restaurant";

type AIRestaurant = {
    id: string;
    name: string;
    cusines: string[];
    rating: number;
}

export function toAIRestaurants(restaurants: { id: string; name: string; cuisines: string | null; avg_rating_string: string | null }[]): AIRestaurant[] {
    return restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        cusines: restaurant.cuisines?.split(", ").filter(Boolean) ?? [],
        rating: Number(restaurant.avg_rating_string)
    }));
}

export async function getMoodRestaurants({ lat, lng, query }: { lat: string, lng: string, query: string }) {

    const restaurants = await getRestaurants({ lat, lng });
    const AIRestaurants = toAIRestaurants(restaurants.RestaurantsData);

    const prompt = `
        You are helping create a food mood board.

        User mood:
        "${query}"

        Available restaurants:
        ${JSON.stringify(AIRestaurants)}

        Interpret the request as a food craving or mood.

        Examples:
        - "something hot" means warm, comforting, freshly cooked food.
        - "something spicy" means food with strong spice levels.
        - "movie night" means shareable, indulgent food.
        - "healthy lunch" means nutritious and balanced food.
        - "late night craving" means satisfying comfort food.

        Task:
        - Select exactly 2 restaurants that best satisfy the craving.
        - Consider cuisine fit before rating.
        - Prioritize restaurants whose cuisine naturally matches the craving.

        Return only restaurant IDs.
    `;

    const response = await generateText({
        model: geminiFlash,
        prompt,
        output: Output.object({
            schema: z.object({
                restaurantIds: z.array(z.string()).length(2)
            })
        })
    });

    return response.output.restaurantIds;
}

type moodRestaurantsMenu = Record<
    string,
    {
        id: string;
        name: string;
        isVeg: boolean;
        description: string;
        price: number;
        category: string;

    }[]
>;

export async function getMoodRestaurantsMenu({ lat, lng, moodRestaurants }: { lat: string; lng: string; moodRestaurants: string[] }): Promise<moodRestaurantsMenu> {
    const entries = (
        await Promise.all(
            moodRestaurants.map(async (restaurantId) => {
                try {
                    const restaurant = await getRestaurantById({
                        lat,
                        lng,
                        restaurantId,
                    });

                    return [
                        restaurantId,
                        restaurant.data.menu.map((item: MenuItem) => ({
                            id: item.id,
                            name: item.name,
                            isVeg: item.veg,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                        })),
                    ] as const;
                } catch {
                    return null;
                }
            })
        )
    ).filter(
        (
            entry
        ): entry is readonly [string, moodRestaurantsMenu[string]] =>
            entry !== null
    );

    return Object.fromEntries(entries);
}

export async function getMoodMenu({ moodRestaurantsMenuItems, query, isVeg }: { moodRestaurantsMenuItems: moodRestaurantsMenu; query: string; isVeg: string }) {
    const prompt = `
        You are helping create a food mood board.

        User mood:
        "${query}"

        ${isVeg === "true"
            ? `
        IMPORTANT:
        - Recommend ONLY vegetarian items.
        - Select only items where isVeg is true.
        `
            : ""}

        Selected restaurants and their menus:
        ${JSON.stringify(moodRestaurantsMenuItems)}

        Interpret the user's mood as a food craving, dining occasion, or desired eating experience.

        Examples:

        * "something hot" → warm, comforting, freshly cooked food
        * "something spicy" → bold flavors and high spice levels
        * "movie night" → indulgent, shareable, snackable food
        * "healthy lunch" → balanced, nutritious, lighter meals
        * "late night craving" → satisfying comfort food
        * "treat myself" → premium, indulgent, highly enjoyable dishes

        Task:

        1. For each restaurant, select 2-4 menu items that best match the user's mood.
        2. Prioritize dishes whose category, description, and overall vibe strongly align with the craving.
        3. Prefer signature or standout dishes when multiple options are similar.
        4. Do not recommend items that are a weak match for the mood just to fill slots.

        You must recommend items for every restaurant provided.
        Do not return an empty object.
        Every restaurant ID in the input must appear in the output.

        Return only the best matching item IDs for each restaurant.
    `;

    const response = await generateText({
        model: geminiFlash,
        prompt,
        output: Output.object({
            schema: z.record(
                z.string(),
                z.array(z.string()).min(1).max(4)
            )
        })
    })
    return response.output;
}

export async function getMoodBoard({ lat, lng, isVeg, query }: { lat: string, lng: string, isVeg: string, query: string }) {
    const useAI = true;
    if (!useAI) {
        return {
            "502999": [
                "502999_1",
            ]
        }
    }
    console.log("1");
    const moodRestaurants = await getMoodRestaurants({ lat, lng, query });
    console.log("2", moodRestaurants);
    const moodRestaurantsMenuItems = await getMoodRestaurantsMenu({ lat, lng, moodRestaurants });
    console.log("3", moodRestaurantsMenuItems);
    const moodMenu = await getMoodMenu({ moodRestaurantsMenuItems, query, isVeg });
    console.log("4", moodMenu);
    return moodMenu;
}