"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/locationStore";
import type { RestaurantWithMenu } from "@/types/restaurant";
import { RestaurantCard } from "./RestaurantCard";
import { useCartStore } from "@/stores/cartStore";

type Restaurant = RestaurantWithMenu & { id: string };

function getCartItems(cart: Record<string, Record<string, number>>) {
    return Object.values(cart).reduce<Record<string, number>>((items, restaurantCart) => {
        return {
            ...items,
            ...restaurantCart
        };
    }, {});
}

export function RestaurantsList({ moodBoardId, mood_board }: { moodBoardId: string; mood_board: Record<string, string[]> | undefined; }) {
    const { lat, lng } = useLocationStore();
    const setCart = useCartStore((state) => state.setCart);

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadRestaurants() {
            if (!mood_board || !lat || !lng) return;

            setIsLoading(true);

            try {
                const params = new URLSearchParams({ id: moodBoardId, lat, lng });
                const [restaurantsResponse, cartResponse] = await Promise.all([
                    fetch(`/api/mood-board/restaurants?${params}`, {
                        method: "GET"
                    }),
                    fetch("/api/cart/get", {
                        method: "GET"
                    })
                ]);

                if (!restaurantsResponse.ok) throw new Error(`Mood board restaurants failed with ${restaurantsResponse.status}`);

                const restaurantsData = await restaurantsResponse.json() as { restaurants: Restaurant[] };
                const cartData = await cartResponse.json();

                setRestaurants(restaurantsData.restaurants);
                setCart(getCartItems(cartData?.cart || {}));
            } catch (error) {
                console.log("Error loading mood board restaurants: ", error);
                setRestaurants([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadRestaurants();
    }, [moodBoardId, mood_board, lat, lng, setCart]);

    return (
        <section className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-lg font-extrabold text-gray-950">Recommended picks</h2>
                    <p className="text-sm text-gray-500">Restaurants and dishes matched to your craving.</p>
                </div>
            </div>

            {!mood_board && (
                <div className="flex flex-col gap-3">
                    <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
                </div>
            )}

            {mood_board && isLoading && (
                <div className="flex flex-col gap-3">
                    <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
                </div>
            )}

            {mood_board && !isLoading && restaurants.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                    No restaurants found for this mood board.
                </div>
            )}

            {mood_board && !isLoading && restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </section>
    );
}
