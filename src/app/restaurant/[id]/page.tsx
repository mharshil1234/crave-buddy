"use client";

import { useState, useEffect} from "react";
import { useParams } from "next/navigation";
import type { RestaurantMainCard } from "@/types/restaurant";
import { MainCard } from "@/components/RestaurantPage/MainCard";

export default function RestaurantPage() {

    const { id } = useParams<{ id: string }>();

    const [restaurantMainDetails, setRestaurantMainDetails] = useState<RestaurantMainCard | null>(null);

    useEffect(() => {

        async function fetchRestaurantDetails(lat: number, lng: number, restaurantId: string) {

            try {
                const response = await fetch(`/api/restaurant/get-restaurant-details?lat=${lat}&lng=${lng}&id=${restaurantId}`, {
                    method: "GET"
                });
                const data = await response.json();
                const restaurantData = data?.data?.cards?.find((x: any) =>
                x?.card?.card?.info
                )
                ?.card?.card || null;
                setRestaurantMainDetails(restaurantData);
                
            } catch(err) {
                console.log("Error: ", err);
            }
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            fetchRestaurantDetails(lat, lng, id);
        });

    }, [])

    return (
        <main>
            <div className="p-4">
                <h1 className="text-3xl font-bold">Restaurant Id: {id}</h1>
            </div>
            <MainCard restaurantMainDetails={restaurantMainDetails} />
        </main>
    )
}