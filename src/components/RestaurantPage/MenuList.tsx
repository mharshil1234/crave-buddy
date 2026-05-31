import { useState, useEffect } from "react";
import type { MenuItem } from "@/types/restaurant";
import { MenuItemCard } from "@/components/RestaurantPage/MenuItemCard";
import { useCartStore } from "@/stores/cartStore";

export function MenuList({ menu, restaurantId }: { menu: MenuItem[] | null; restaurantId: string }) {

    const setCart = useCartStore((state) => state.setCart);

    useEffect(() => {

        async function fetchCart() {

            try {
                const response = await fetch("/api/cart/get", {
                    method: "GET"
                });
                const data = await response.json();
                const cartData = data?.cart?.[restaurantId] || {};
                setCart(cartData);
            } catch (err) {
                console.log("Error fetching cart: ", err);
            }
        }

        fetchCart();
    }, [restaurantId])

    return (
        <div className="w-full mt-8">
            {menu?.map((item) => (
                <MenuItemCard key={item.id} item={item} restaurantId={restaurantId} />
            ))}
        </div>
    )
}