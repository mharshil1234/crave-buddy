import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
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

    const cart = useCartStore((state) => state.cart);
    const setCart = useCartStore((state) => state.setCart);

    const [cartDetails, setCartDetails] = useState<Record<string, restaurantCartData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCartDetails() {

            try {
                const response = await fetch("/api/cart/get-details", {
                    method: "GET"
                });

                const data = await response.json();
                const cartDetailsData = data?.cartDetails || {};
                setCartDetails(cartDetailsData);
                setCart(getCartFromDetails(cartDetailsData));
            }
            catch (error) {
                console.log("Error fetching cart details: ", error);
                toast.error("Couldn't load your cart");
            }
            finally {
                setLoading(false);
            }

        }

        fetchCartDetails();
    }, [setCart]);

    // Live totals from the store, so they update as quantities change.
    const restaurants = Object.entries(cartDetails);
    let itemCount = 0;
    let subtotal = 0;
    for (const [, restaurantData] of restaurants) {
        for (const item of restaurantData.items) {
            const quantity = cart[item.id] ?? 0;
            itemCount += quantity;
            subtotal += quantity * item.price;
        }
    }

    if (loading) {
        return (
            <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8" aria-busy="true" aria-label="Loading cart">
                <div className="space-y-4">
                    {[1, 2].map((i) => <div key={i} className="card h-40 animate-pulse" />)}
                </div>
                <div className="card h-48 animate-pulse" />
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <ShoppingBag size={30} aria-hidden="true" />
                </span>
                <h1 className="mt-5 text-2xl font-extrabold text-neutral-900">Your cart is empty</h1>
                <p className="mt-2 max-w-sm text-neutral-500">
                    Add dishes from a restaurant, or let us suggest something that matches your mood.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/" className="btn btn-primary">Browse restaurants</Link>
                    <Link href="/mood-board" className="btn btn-secondary">Try a Mood Board</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Your cart</h1>
            <p className="mt-1 text-sm text-neutral-500">
                {itemCount} {itemCount === 1 ? "item" : "items"} from {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"}
            </p>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    {restaurants.map(([restaurantId, restaurantData]) => (
                        <RestaurantCartCard key={restaurantId} restaurantId={restaurantId} restaurantData={restaurantData} />
                    ))}
                </div>

                <aside className="card p-5 lg:sticky lg:top-24" aria-label="Order summary">
                    <h2 className="text-lg font-extrabold text-neutral-900">Order summary</h2>
                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-600">
                            <dt>Items ({itemCount})</dt>
                            <dd>₹{subtotal}</dd>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                            <dt>Delivery & taxes</dt>
                            <dd>Calculated at checkout</dd>
                        </div>
                        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold text-neutral-900">
                            <dt>Subtotal</dt>
                            <dd>₹{subtotal}</dd>
                        </div>
                    </dl>
                    <button
                        type="button"
                        onClick={() => toast.info("Checkout is coming soon!")}
                        className="btn btn-primary mt-5 w-full"
                    >
                        Proceed to checkout
                    </button>
                    <Link href="/" className="mt-3 block text-center text-sm font-semibold text-brand hover:text-brand-hover">
                        Add more items
                    </Link>
                </aside>
            </div>
        </div>
    )
}
