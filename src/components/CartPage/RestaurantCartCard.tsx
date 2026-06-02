"use client";

import type { restaurantCartData } from "@/types/restaurant";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { ItemCard } from "./ItemCard";

export function RestaurantCartCard({ restaurantId, restaurantData }: { restaurantId: string; restaurantData: restaurantCartData }) {

    const [total, setTotal] = useState(restaurantData.restaurantTotal);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full p-4 bg-white shadow-md rounded-xl">
            <div className="flex items-center">

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

            <div>
                {isOpen && (
                    <div className="w-full mt-4 p-4 bg-gray-100 rounded-lg flex flex-col gap-4">
                        {restaurantData.items.map((item) => (
                            <ItemCard
                                key={item.id}
                                restaurantId={restaurantId}
                                itemId={item.id}
                                itemName={item.name}
                                itemPrice={item.price}
                                itemImg="/restaurant.jpeg"
                                quantity={item.quantity}
                                itemTotal={item.total}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}