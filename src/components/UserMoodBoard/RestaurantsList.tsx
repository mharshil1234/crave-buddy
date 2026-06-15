"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/locationStore";
import { MenuItem } from "@/types/restaurant";

type Restaurant = {
    id: string;
    name: string;
    restaurantImg: string;
    menu: MenuItem[];
};

export function RestaurantsList({ mood_board }: { mood_board: Record<string, string[]> | undefined; }) {
    const { lat, lng } = useLocationStore();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

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

            const enriched = await enrichMoodBoard(
                mood_board,
                lat,
                lng
            );

            setRestaurants(enriched);
        }

        loadRestaurants();
    }, [mood_board, lat, lng]);

    return (
        <div className="mt-4 flex w-full max-w-200 flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
            {restaurants.map((restaurant) => (
                <div key={restaurant.id}>
                    {restaurant.name}
                </div>
            ))}
        </div>
    );
}