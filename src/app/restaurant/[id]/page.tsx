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
            }
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            fetchRestaurantDetails(lat, lng, id);
        });

    }, [id])

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