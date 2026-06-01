"use client";

import type { restaurantCartData } from "@/types/restaurant";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export function RestaurantCartCard({ restaurantId, restaurantData }: { restaurantId: string; restaurantData: restaurantCartData }) {

    const [total, setTotal] = useState(restaurantData.restaurantTotal);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-md flex items-center">

            <div className="w-full flex items-center justify-between">

                <div className="flex items-center gap-4 hover:cursor-pointer">
                    <ChevronRight style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 200ms"
                    }}
                        onClick={() => setIsOpen(!isOpen)} />
                    <span>{restaurantData.restaurantName}</span>
                </div>

                <div className="ml-auto font-bold">
                    ₹ {total}
                </div>

            </div>

        </div>
    )
}