"use client";

import type { restaurantCartData } from "@/types/restaurant";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { ItemCard } from "./ItemCard";
import { useCartStore } from "@/stores/cartStore";

export function RestaurantCartCard({ restaurantId, restaurantData }: { restaurantId: string; restaurantData: restaurantCartData }) {

    const cart = useCartStore((state) => state.cart);
    const [isOpen, setIsOpen] = useState(true);
    const panelId = useId();

    const items = restaurantData.items.filter((item) => (cart[item.id] ?? 0) > 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);

    if (totalPrice === 0) {
        return null;
    }

    return (
        <section className="card overflow-hidden">
            <div className="flex items-center gap-3 p-4">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    {restaurantData.restaurantImg && (
                        <Image src={restaurantData.restaurantImg} alt="" fill sizes="48px" className="object-cover" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <Link href={`/restaurant/${restaurantId}`} className="block truncate font-bold text-neutral-900 hover:text-brand">
                        {restaurantData.restaurantName}
                    </Link>
                    <p className="text-sm text-neutral-500">
                        {items.length} {items.length === 1 ? "dish" : "dishes"} · ₹{totalPrice}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={isOpen ? "Hide items" : "Show items"}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 cursor-pointer"
                >
                    <ChevronDown size={20} aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {isOpen && (
                <div id={panelId} className="divide-y divide-neutral-100 border-t border-neutral-100 px-4">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            restaurantId={restaurantId}
                            itemId={item.id}
                            itemName={item.name}
                            itemPrice={item.price}
                            itemIsVeg={item.isVeg}
                            itemTotal={(cart[item.id] ?? 0) * item.price}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
