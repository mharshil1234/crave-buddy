import { getRestaurants, getRestaurantById } from "./restaurant";
import { geminiFlash, geminiPro } from "./ai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { MenuItem } from "@/types/restaurant";

type AIRestaurant = {
    id: string;
    name: string;
    cusines: string[];
    rating: number;
}

export function toAIRestaurants(restaurants: any): AIRestaurant[] {
    return restaurants.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        cusines: restaurant.cuisines,
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

export async function getMoodRestaurantsMenu({ lat, lng, moodRestaurants }: {lat: string; lng: string; moodRestaurants: string[] }): Promise<moodRestaurantsMenu> {
    return Object.fromEntries(
        await Promise.all(
            moodRestaurants.map((async (restaurantId) => {
                const restaurant = await getRestaurantById({lat, lng, restaurantId});

                return [
                    restaurantId,
                    restaurant.data.menu.map((item: MenuItem) => ({
                        id: item.id,
                        name: item.name,
                        isVeg: item.veg,
                        description: item.description,
                        price: item.price,
                        category: item.category
                    })
                    )
                ] as const;
            }))
        )
    )
}

export async function getMoodBoard({ lat, lng, isVeg, query }: { lat: string, lng: string, isVeg: string, query: string }) {
    const moodRestaurants = await getMoodRestaurants({ lat, lng, query });
    console.log(moodRestaurants);
    const moodRestaurantsMenuItems = await getMoodRestaurantsMenu({ lat, lng, moodRestaurants});
    return moodRestaurantsMenuItems;
}