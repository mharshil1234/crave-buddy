import { useState, useEffect, use } from "react";
import { useCartStore } from "@/stores/cartStore";
import { RestaurantCartCard } from "./RestaurantCartCard";
import { map } from "zod";
import { ca } from "zod/locales";

export function MainCart() {

    const cart = useCartStore((state) => state.cart);
    const setCart = useCartStore((state) => state.setCart);

    const [cartDetails, setCartDetails] = useState<Record<string, any> | null>({});

    useEffect(() => {
        async function fetchCart() {

            try {

                const response = await fetch("/api/cart/get", {
                    method: "GET"
                });

                const data = await response.json();
                const cartData = data?.cart || {};
                setCart(cartData);

            }
            catch (error) {
                console.log("Error fetching cart: ", error);
            }
        }

        async function fetchCartDetails() {

            try {
                const respone = await fetch("/api/cart/get-details", {
                    method: "GET"
                });

                const data = await respone.json();
                const cartDetailsData = data?.cartDetails || {};
                setCartDetails(cartDetailsData);
            }
            catch (error) {
                console.log("Error fetching cart details: ", error);
            }

        }

        fetchCart();
        fetchCartDetails();
    }, []);

    return (
        <div className="p-8 px-40 flex justify-center items-center">
            <div className="w-200 py-8 bg-white p-4 flex flex-col gap-4">
                {cart && Object.entries(cart).map(([restaurantId]) => (
                    <RestaurantCartCard key={restaurantId} restaurantId={restaurantId} />
                ))} 
            </div>
        </div>
    )
}