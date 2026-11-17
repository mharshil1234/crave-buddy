import { getRestaurant, listRestaurants, toRestaurantWithMenu } from "@/lib/catalogue";

export async function getRestaurants({ lat, lng }: { lat: string, lng: string }) {
    const restaurants = await listRestaurants({ limit: 20 });

    return {
        RestaurantsData: restaurants.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            cloudinary_image_id: restaurant.cloudinary_image_id,
            area_name: restaurant.area_name,
            cuisines: restaurant.cuisines.join(", "),
            avg_rating_string: restaurant.rating?.toString() ?? null,
        })),
    };
}

export async function getRestaurantById({ lat, lng, restaurantId }: { lat: string, lng: string, restaurantId: string }) {
    const restaurant = await getRestaurant(restaurantId);

    if (!restaurant) {
        throw new Error("Restaurant not found");
    }

    return { data: toRestaurantWithMenu(restaurant) };
}
