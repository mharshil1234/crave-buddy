"use client";

import { useState, useEffect } from "react";
import { RestaurantCard } from "./RestaurantCard"

type Restaurant = {
        id: string;
        name: string;
        cloudinaryImageId: string;
        areaName: string;
        cuisines: string;
        avgRatingString: string;
};

export function LandingMain() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {

        async function fetchRestaurants(lat: number, lng: number) {

            try {

                const response = await fetch(`/api/restaurant/get-restaurants?lat=${lat}&lng=${lng}`, {
                    method: "GET"
                });
                const data = await response.json();

                /*const restaurantsData = data?.data?.cards?.find((x: any) =>
                x?.card?.card?.gridElements?.infoWithStyle?.restaurants
                )
                ?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];*/

                setRestaurants(data);


            } catch (error) {

                console.error("Error fetching restaurants:", error);
            
            }       

        }

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            fetchRestaurants(lat, lng);
        });

    }, [])
    
    return (

        <div className="px-15 py-10">

            <h1 className="text-2xl font-bold">Discover the best restaurants</h1>

            <div className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">

                {restaurants.map((restaurant) => {

                    const info = restaurant;

                    return (
                        <RestaurantCard
                            key={info.id}
                            id={info.id}
                            image={`https://media-assets.swiggy.com/swiggy/image/upload/${info.cloudinaryImageId}`}
                            name={info.name}
                            cuisine={info.cuisines}
                            location={info.areaName}
                            rating={info.avgRatingString}
                        />
                    )
                })}

            </div>
        </div>
    )

}