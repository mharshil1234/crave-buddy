import restaurantMenu from "../../data/restaurantMenu.json";
import { pool } from "@/lib/db";

export async function getRestaurants({ lat, lng }: { lat: string, lng: string }) {
    const response = await pool.query(
        `
        SELECT * FROM RESTAURANTS
        LIMIT 20
        `
    );

    return { RestaurantsData: response.rows };
}

export async function getRestaurantByid({ lat, lng, restaurantId }: { lat: string, lng: string, restaurantId: string }) {
    const RestaurantsData = restaurantMenu as Record<string, any>;

    const data = RestaurantsData[restaurantId];

    if (!data) {
        throw new Error("Restaurant not found");
    }

    return { data };
}