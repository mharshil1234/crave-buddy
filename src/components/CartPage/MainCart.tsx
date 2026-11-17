import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Info, ShieldCheck, ShoppingBag } from "lucide-react";
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

    const activeRestaurants = restaurants
        .map(([restaurantId, restaurantData]) => ({
            restaurantId,
            name: restaurantData.restaurantName,
            total: restaurantData.items.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0),
        }))
        .filter((restaurant) => restaurant.total > 0);

    function handleCheckout() {
        toast.info("Checkout is coming soon!");
    }

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:pb-12">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-brand">
                <ArrowLeft size={16} aria-hidden="true" />
                Continue shopping
            </Link>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Your cart</h1>
                <p className="text-sm text-neutral-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"} from {activeRestaurants.length} {activeRestaurants.length === 1 ? "restaurant" : "restaurants"}
                </p>
            </div>

            {activeRestaurants.length > 1 && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-ink">
                    <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    Your cart has dishes from {activeRestaurants.length} restaurants, so they&apos;ll arrive as separate deliveries.
                </p>
            )}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    {restaurants.map(([restaurantId, restaurantData]) => (
                        <RestaurantCartCard key={restaurantId} restaurantId={restaurantId} restaurantData={restaurantData} />
                    ))}
                </div>

                <aside className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Order summary">
                    <h2 className="text-lg font-extrabold text-neutral-900">Order summary</h2>

                    {activeRestaurants.length > 1 && (
                        <ul className="mt-4 space-y-2 border-b border-neutral-100 pb-4 text-sm">
                            {activeRestaurants.map((restaurant) => (
                                <li key={restaurant.restaurantId} className="flex justify-between gap-4 text-neutral-600">
                                    <span className="truncate">{restaurant.name}</span>
                                    <span className="shrink-0 tabular-nums">₹{restaurant.total}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-600">
                            <dt>Item total ({itemCount})</dt>
                            <dd className="tabular-nums">₹{subtotal}</dd>
                        </div>
                        <div className="flex justify-between gap-4 text-neutral-600">
                            <dt>Delivery & taxes</dt>
                            <dd className="text-right text-neutral-400">At checkout</dd>
                        </div>
                        <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-extrabold text-neutral-900">
                            <dt>To pay</dt>
                            <dd className="tabular-nums">₹{subtotal}</dd>
                        </div>
                    </dl>

                    <button type="button" onClick={handleCheckout} className="btn btn-primary mt-5 hidden w-full py-3.5 text-base lg:flex">
                        Proceed to checkout
                    </button>

                    <p className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                        <ShieldCheck size={14} aria-hidden="true" className="shrink-0 text-rating" />
                        You won&apos;t be charged until you place the order.
                    </p>
                </aside>
            </div>

            {/* Phone/tablet: checkout stays reachable without scrolling to the summary */}
            <div data-checkout-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-5xl items-center gap-4">
                    <div className="min-w-0">
                        <p className="text-xs text-neutral-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
                        <p className="text-lg font-extrabold tabular-nums text-neutral-900">₹{subtotal}</p>
                    </div>
                    <button type="button" onClick={handleCheckout} className="btn btn-primary ml-auto flex-1 py-3 sm:max-w-xs">
                        Proceed to checkout
                    </button>
                </div>
            </div>
        </div>
    )
}
