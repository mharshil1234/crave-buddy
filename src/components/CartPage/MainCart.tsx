import { useState, useEffect, use } from "react";
import { useCartStore } from "@/stores/cartStore";
export function MainCart() {

    const cart = useCartStore((state) => state.cart);
    const setCart = useCartStore((state) => state.setCart);

    useEffect(() => {
        async function fetchCart() {

            try {

                const response = await fetch("/api/cart/get", {
                    method: "GET"
                })

                const data = await response.json();
                const cartData = data?.cart || {};
                setCart(cartData);

            }
            catch (error) {
                console.log("Error fetching cart: ", error);
            }
        }

        fetchCart();
    }, []);

    return (
        <div className="p-8 px-40 flex justify-center items-center">
            <div className="w-200 py-8 bg-white p-4">
                <h1>Main Cart</h1>
            </div>

        </div>
    )
}