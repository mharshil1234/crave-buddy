import restaurantMenu from "../../data/restaurantMenu.json";
import { prisma } from "./prisma";

export async function getRestaurants({ lat, lng }: { lat: string, lng: string }) {
    const restaurantsData = await prisma.restaurants.findMany({
        take: 20,
    });

    return {
        RestaurantsData: restaurantsData,
    };
}

export async function getRestaurantById({ lat, lng, restaurantId }: { lat: string, lng: string, restaurantId: string }) {
    const RestaurantsData = restaurantMenu as Record<string, any>;

    const data = RestaurantsData[restaurantId];

    if (!data) {
        throw new Error("Restaurant not found");
    }

    return { data };
}