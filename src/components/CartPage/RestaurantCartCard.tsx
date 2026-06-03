"use client";

import type { restaurantCartData } from "@/types/restaurant";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { ItemCard } from "./ItemCard";
import { useCartStore } from "@/stores/cartStore";

export function RestaurantCartCard({ restaurantId, restaurantData }: { restaurantId: string; restaurantData: restaurantCartData }) {

    const cart = useCartStore((state) => state.cart);

    const totalPrice = restaurantData.items.reduce((sum, item) => {
        const itemQuantity = cart[item.id] ?? item.quantity;
        return sum + item.price * itemQuantity;
    }, 0);

    const [isOpen, setIsOpen] = useState(false);

    if (totalPrice === 0) {
        return null;
    }

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
                        ₹ {totalPrice}
                    </div>

                </div>

            </div>

            <div>
                {isOpen && (
                    <div className="w-full mt-4 p-4 bg-gray-100 rounded-lg flex flex-col gap-4">
                        {restaurantData.items
                            .filter((item) => (cart[item.id] ?? 0) > 0)
                            .map((item) => {
                                const itemTotal = (cart[item.id] ?? 0) * item.price;
                                return (
                                    <ItemCard
                                        key={item.id}
                                        restaurantId={restaurantId}
                                        itemId={item.id}
                                        itemName={item.name}
                                        itemPrice={item.price}
                                        itemImg="/restaurant.jpeg"
                                        itemIsVeg={item.isVeg}
                                        itemTotal={itemTotal}
                                    />
                                )
                            }
                            )}
                    </div>
                )}

            </div>
        </div>
    )
}