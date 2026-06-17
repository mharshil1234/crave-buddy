"use client";

import type { MenuItem } from "@/types/restaurant";
import { ChevronRight, Clock, IndianRupee, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ItemCard } from "./ItemCard";

type RestaurantCardProps = {
    restaurant: {
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
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="w-full overflow-hidden rounded-xl bg-white shadow-md">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-4 p-4 text-left hover:cursor-pointer hover:bg-gray-50"
            >
                <ChevronRight
                    className="shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                />

                <Image
                    src="/restaurant.jpeg"
                    alt={restaurant.name}
                    width={96}
                    height={80}
                    className="h-20 w-24 shrink-0 rounded-lg bg-gray-200 object-cover"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold">{restaurant.name}</h2>
                            <p className="truncate text-sm text-gray-600">
                                {restaurant.cuisines.join(", ")}
                            </p>
                            <p className="truncate text-sm text-gray-500">{restaurant.location}</p>
                        </div>

                        <div className="shrink-0 rounded-md bg-[#256f3a] px-2 py-1 text-sm font-bold text-white">
                            <span className="inline-flex items-center gap-1">
                                <Star size={13} fill="white" />
                                {restaurant.rating}
                            </span>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                            <Clock size={14} />
                            {restaurant.deliveryTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <IndianRupee size={14} />
                            {restaurant.priceForTwo} for two
                        </span>
                        <span>{restaurant.menu.length} picks</span>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="mx-4 mb-4 rounded-lg bg-gray-50 p-4">
                    {restaurant.menu.map((item) => (
                        <ItemCard key={item.id} item={item} restaurantId={restaurant.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
