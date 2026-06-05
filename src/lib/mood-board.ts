import { getRestaurants, getRestaurantByid } from "./restaurant";
import { geminiFlash, geminiPro } from "./ai";
import { generateText, Output } from "ai";
import { z } from "zod";

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