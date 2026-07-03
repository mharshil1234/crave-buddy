"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { RestaurantDetails, MenuItem } from "@/types/restaurant";
import { MainCard } from "@/components/RestaurantPage/MainCard";
import { Header } from "@/components/Header";
import { Search } from "@/components/RestaurantPage/Search";
import { MenuList } from "@/components/RestaurantPage/MenuList";

export default function RestaurantPage() {

    const { id } = useParams<{ id: string }>();

    const [restaurantDetails, setRestaurantDetails] = useState<RestaurantDetails | null>(null);
    const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[] | null>([]);
    const [loading, setLoading] = useState(true);

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

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            fetchRestaurantDetails(lat, lng, id);
        });

    }, [id])

    if (loading) {
        return (
            <main>
                <Header />
                <div className="p-8 px-40 flex justify-center items-center">
                    <div className="w-200 py-8">
                        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />

                        <div className="w-full rounded-2xl my-8 p-6 border border-gray-200 bg-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="mb-4">
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mt-4" />
                        </div>

                        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-4" />

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full flex mt-4 border-t-1 py-4">
                                <div className="w-[70%] mt-2">
                                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="ml-auto w-45 h-45 bg-gray-200 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main>

            <Header />

            <div className="p-8 px-40 flex justify-center items-center">
                <div className="w-200 py-8">

                    <h1 className="text-2xl font-bold">{restaurantDetails?.name}</h1>
                    <MainCard restaurantDetails={restaurantDetails} />

                    <div className="flex justify-center">
                        <h1 className="font-bold text-xl mt-4">MENU</h1>
                    </div>

                    <Search />

                    <MenuList menu={restaurantMenu} restaurantId={id} />

                </div>
            </div>

        </main>
    )
}