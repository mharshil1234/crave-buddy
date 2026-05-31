import restaurantMenu from "../../data/restaurantMenu.json";

export async function getRestaurantByid({ lat, lng, restaurantId }: { lat: number, lng: number, restaurantId: string }) {
    const RestaurantsData = restaurantMenu as Record<string, any>;

    const data = RestaurantsData[restaurantId];

    if (!data) {
        throw new Error("Restaurant not found");
    }

    return { data };
}