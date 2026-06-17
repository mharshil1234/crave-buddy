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
        <article className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:cursor-pointer hover:bg-orange-50/40 sm:items-center sm:gap-4"
            >
                <ChevronRight
                    className="mt-8 shrink-0 text-gray-400 transition-transform duration-200 sm:mt-0"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                />

                <Image
                    src="/restaurant.jpeg"
                    alt={restaurant.name}
                    width={96}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-lg bg-gray-200 object-cover sm:w-24"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-extrabold text-gray-950">{restaurant.name}</h2>
                            <p className="truncate text-sm text-gray-600">
                                {restaurant.cuisines.join(", ")}
                            </p>
                            <p className="truncate text-sm text-gray-500">{restaurant.location}</p>
                        </div>

                        <div className="w-fit shrink-0 rounded-full bg-[#256f3a] px-2.5 py-1 text-sm font-bold text-white">
                            <span className="inline-flex items-center gap-1">
                                <Star size={13} fill="white" />
                                {restaurant.rating}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                            <Clock size={14} />
                            {restaurant.deliveryTime}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                            <IndianRupee size={14} />
                            {restaurant.priceForTwo} for two
                        </span>
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 font-bold text-orange-700">
                            {restaurant.menu.length} picks
                        </span>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="mx-4 mb-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                    {restaurant.menu.map((item) => (
                        <ItemCard key={item.id} item={item} restaurantId={restaurant.id} />
                    ))}
                </div>
            )}
        </article>
    );
}
