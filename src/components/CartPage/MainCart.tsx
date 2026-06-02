import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { RestaurantCartCard } from "./RestaurantCartCard";
import type { restaurantCartData } from "@/types/restaurant";

function getCartFromDetails(cartDetails: Record<string, restaurantCartData>) {
    return Object.values(cartDetails).reduce<Record<string, number>>((items, restaurantData) => {
        const restaurantItems = restaurantData.items.reduce<Record<string, number>>((itemQuantities, item) => {
            return {
                ...itemQuantities,
                [item.id]: item.quantity
            };
        }, {});

        return {
            ...items,
            ...restaurantItems
        };
    }, {});
}

export function MainCart() {

    const setCart = useCartStore((state) => state.setCart);

    const [cartDetails, setCartDetails] = useState<Record<string, restaurantCartData> | null>({});

    useEffect(() => {
        async function fetchCartDetails() {

            try {
                const respone = await fetch("/api/cart/get-details", {
                    method: "GET"
                });

                const data = await respone.json();
                const cartDetailsData = data?.cartDetails || {};
                setCartDetails(cartDetailsData);
                setCart(getCartFromDetails(cartDetailsData));
            }
            catch (error) {
                console.log("Error fetching cart details: ", error);
            }

        }

        fetchCartDetails();
    }, [setCart]);

    return (
        <div className="p-8 px-40 flex justify-center items-center">
            <div className="w-200 py-8 bg-white p-4 flex flex-col gap-4">
                {cartDetails && Object.keys(cartDetails).length > 0 ? (
                    Object.entries(cartDetails).map(([restaurantId, restaurantData]) => (
                        <RestaurantCartCard key={restaurantId} restaurantId={restaurantId} restaurantData={restaurantData} />
                    ))
                ) : (
                    <p>Your cart is empty.</p>
                )}
            </div>
        </div>
    )
}
