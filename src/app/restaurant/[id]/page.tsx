"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { RestaurantDetails, MenuItem } from "@/types/restaurant";
import { MainCard } from "@/components/RestaurantPage/MainCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search } from "@/components/RestaurantPage/Search";
import { MenuList } from "@/components/RestaurantPage/MenuList";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function RestaurantPage() {

    const { id } = useParams<{ id: string }>();

    const [restaurantDetails, setRestaurantDetails] = useState<RestaurantDetails | null>(null);
    const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[] | null>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredMenu = normalizedQuery
        ? (restaurantMenu ?? []).filter((item) =>
            [item.name, item.description, item.category].some((field) => field?.toLowerCase().includes(normalizedQuery))
        )
        : restaurantMenu;

    useEffect(() => {

        async function fetchRestaurantDetails(lat: number, lng: number, restaurantId: string) {

            try {
                const response = await fetch(`/api/restaurant/get-restaurant-details?lat=${lat}&lng=${lng}&id=${restaurantId}`, {
                    method: "GET"
                });
                const data = await response.json();

                /*const restaurantData = data?.data?.cards?.find((x: any) =>
                x?.card?.card?.info
                )
                ?.card?.card || null;*/

                const restaurantData = data?.data || null;
                setRestaurantDetails(restaurantData);
                setRestaurantMenu(restaurantData?.menu || null);

            } catch (err) {
                console.log("Error: ", err);
            } finally {
                setLoading(false);
            }
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                fetchRestaurantDetails(lat, lng, id);
            },
            () => setLoading(false),
        );

    }, [id])

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-neutral-50">
                <Header />
                <main className="mx-auto w-full max-w-3xl min-h-dvh px-4 py-6 sm:px-6 sm:py-8" aria-busy="true" aria-label="Loading restaurant">
                    <div className="card overflow-hidden">
                        <div className="h-40 animate-pulse bg-neutral-200 sm:h-52" />
                        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-12 animate-pulse rounded bg-neutral-200" />
                                    <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 h-11 w-full animate-pulse rounded-full bg-neutral-200" />

                    <div className="card mt-6 px-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 border-t border-neutral-200 py-6 first:border-t-0">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-4 w-8 animate-pulse rounded bg-neutral-200" />
                                    <div className="h-6 w-48 animate-pulse rounded bg-neutral-200" />
                                    <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
                                    <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                                </div>
                                <div className="size-28 shrink-0 animate-pulse rounded-2xl bg-neutral-200 sm:size-36" />
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!restaurantDetails) {
        return (
            <div className="flex min-h-screen flex-col bg-neutral-50">
                <Header />
                <main className="mx-auto flex w-full max-w-3xl min-h-dvh flex-col items-center px-4 py-20 text-center sm:px-6">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                        <UtensilsCrossed size={28} aria-hidden="true" />
                    </span>
                    <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Restaurant not available</h1>
                    <p className="mt-2 max-w-sm text-neutral-500">
                        We couldn&apos;t load this restaurant. It may not deliver to your location, or location access is turned off.
                    </p>
                    <Link href="/" className="btn btn-primary mt-6">Browse restaurants</Link>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">

            <Header />

            <main className="mx-auto w-full max-w-3xl min-h-dvh px-4 py-6 sm:px-6 sm:py-8">

                <MainCard restaurantDetails={restaurantDetails} />

                {/* Stays under the sticky site header while scrolling the menu */}
                <div className="sticky top-16 z-30 -mx-4 mt-6 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:top-18 sm:-mx-6 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-extrabold tracking-tight text-neutral-900">Menu</h2>
                        <span className="text-sm text-neutral-500">{filteredMenu?.length ?? 0} dishes</span>
                    </div>
                    <Search value={searchQuery} onChange={setSearchQuery} />
                </div>

                <div className="card mt-2 px-5">
                    {normalizedQuery && filteredMenu?.length === 0 ? (
                        <p className="py-10 text-center text-neutral-500">
                            No dishes match &ldquo;{searchQuery.trim()}&rdquo;.
                        </p>
                    ) : (
                        <MenuList menu={filteredMenu} restaurantId={id} />
                    )}
                </div>

            </main>

            <Footer />

        </div>
    )
}
