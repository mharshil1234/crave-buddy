import restaurantMenu from "../../data/restaurantMenu.json";
import { pool } from "@/lib/db";
import type { MenuItem } from "@/types/restaurant";

type RestaurantData = {
    name: string;
    restaurantImg: string;
    location: string;
    cuisines: string[];
    rating: number;
    priceForTwo: number;
    deliveryTime: string;
    menu: MenuItem[];
};

export async function getRestaurants({ lat, lng }: { lat: string, lng: string }) {
    const response = await pool.query(
        `
        SELECT * FROM RESTAURANTS
        LIMIT 20
        `
    );

    return { RestaurantsData: response.rows };
}

export async function getRestaurantById({ lat, lng, restaurantId }: { lat: string, lng: string, restaurantId: string }) {
    const RestaurantsData = restaurantMenu as Record<string, RestaurantData>;

    const data = RestaurantsData[restaurantId];

    if (!data) {
        throw new Error("Restaurant not found");
    }

    return { data };
}