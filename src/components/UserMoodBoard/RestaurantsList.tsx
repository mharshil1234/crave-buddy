"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/locationStore";
import { MenuItem } from "@/types/restaurant";
import { RestaurantCard } from "./RestaurantCard";
import { useCartStore } from "@/stores/cartStore";

type Restaurant = {
    id: string;
    name: string;
    restaurantImg: string;
    location: string;
    cuisines: string[];
    rating: number;
    priceForTwo: number;
    deliveryTime: string;
    menu: MenuItem[];
};

function getCartItems(cart: Record<string, Record<string, number>>) {
    return Object.values(cart).reduce<Record<string, number>>((items, restaurantCart) => {
        return {
            ...items,
            ...restaurantCart
        };
    }, {});
}

export function RestaurantsList({ mood_board }: { mood_board: Record<string, string[]> | undefined; }) {
    const { lat, lng } = useLocationStore();
    const setCart = useCartStore((state) => state.setCart);

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    async function enrichMoodBoard(
        moodBoard: Record<string, string[]>,
        lat: string,
        lng: string
    ) {
        const restaurantIds = Object.keys(moodBoard);

        const restaurants = await Promise.all(
            restaurantIds.map(async (restaurantId) => {

                const response = await fetch(`/api/restaurant/get-restaurant-details?lat=${lat}&lng=${lng}&id=${restaurantId}`, {
                    method: "GET"
                });
                const { data } = await response.json();

                const selectedItemIds = moodBoard[restaurantId];

                return {
                    id: restaurantId,
                    ...data,
                    menu: data.menu.filter((item: MenuItem) =>
                        selectedItemIds.includes(item.id)
                    ),
                };
            })
        );

        return restaurants;
    }

    useEffect(() => {
        async function loadRestaurants() {
            if (!mood_board || !lat || !lng) return;

            setIsLoading(true);

            try {
                const [enriched, cartResponse] = await Promise.all([
                    enrichMoodBoard(
                        mood_board,
                        lat,
                        lng
                    ),
                    fetch("/api/cart/get", {
                        method: "GET"
                    })
                ]);

                const cartData = await cartResponse.json();

                setRestaurants(enriched);
                setCart(getCartItems(cartData?.cart || {}));
            } catch (error) {
                console.log("Error loading mood board restaurants: ", error);
                setRestaurants([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadRestaurants();
    }, [mood_board, lat, lng, setCart]);

    return (
        <div className="mt-4 flex w-full max-w-200 flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
            {isLoading && <p className="text-gray-600">Loading restaurants...</p>}

            {!isLoading && restaurants.length === 0 && (
                <p className="text-gray-600">No restaurants found for this mood board.</p>
            )}

            {!isLoading && restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    );
}
