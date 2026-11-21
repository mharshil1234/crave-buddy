"use client";

import { useState, useEffect } from "react";
import { MapPinOff, UtensilsCrossed } from "lucide-react";
import { RestaurantCard, RestaurantCardSkeleton } from "./RestaurantCard";

type Restaurant = {
    id: string;
    name: string;
    cloudinary_image_id: string | null;
    image: string;
    area_name: string;
    cuisines: string;
    avg_rating_string: string;
};

type Status = "loading" | "ready" | "no-location" | "error";

export function LandingMain() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {

        async function fetchRestaurants(lat: number, lng: number) {
            try {
                const response = await fetch(`/api/restaurant/get-restaurants?lat=${lat}&lng=${lng}`, {
                    method: "GET"
                });
                if (!response.ok) throw new Error(`Request failed with ${response.status}`);
                const data = await response.json();

                /*const restaurantsData = data?.data?.cards?.find((x: any) =>
                x?.card?.card?.gridElements?.infoWithStyle?.restaurants
                )
                ?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];*/

                setRestaurants(Array.isArray(data) ? data : []);
                setStatus("ready");
            } catch (error) {
                console.error("Error fetching restaurants:", error);
                setStatus("error");
            }
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                fetchRestaurants(lat, lng);
            },
            () => setStatus("no-location"),
        );

    }, [])

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">Restaurants near you</h2>
                    <p className="mt-1 text-sm text-neutral-500">Or skip the browsing and describe your mood above.</p>
                </div>
                {status === "ready" && restaurants.length > 0 && (
                    <p className="text-sm font-medium text-neutral-500">{restaurants.length} places</p>
                )}
            </div>

            {status === "loading" && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading restaurants">
                    {Array.from({ length: 8 }, (_, i) => <RestaurantCardSkeleton key={i} />)}
                </div>
            )}

            {status === "ready" && restaurants.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            id={restaurant.id}
                            image={restaurant.image}
                            name={restaurant.name}
                            cuisine={restaurant.cuisines}
                            location={restaurant.area_name}
                            rating={restaurant.avg_rating_string}
                        />
                    ))}
                </div>
            )}

            {status === "no-location" && (
                <EmptyState
                    icon={<MapPinOff size={28} aria-hidden="true" />}
                    title="We need your location"
                    body="Allow location access in your browser and reload the page to see restaurants near you."
                />
            )}

            {(status === "error" || (status === "ready" && restaurants.length === 0)) && (
                <EmptyState
                    icon={<UtensilsCrossed size={28} aria-hidden="true" />}
                    title={status === "error" ? "Couldn't load restaurants" : "No restaurants found nearby"}
                    body={status === "error" ? "Something went wrong on our side. Please try again in a moment." : "Try again later, or describe your mood above to get suggestions."}
                />
            )}
        </section>
    )
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">{icon}</span>
            <h3 className="mt-4 text-lg font-bold text-neutral-900">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">{body}</p>
        </div>
    );
}
