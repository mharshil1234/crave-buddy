import type { MenuItem } from "@/types/restaurant"
import { Star } from "lucide-react"
import { VegNonVegIcon } from "../ui/VegNonVegIcon"
import { QuantityButton } from "../ui/QuantityButton"
import { DishTile } from "../ui/DishTile"
import { useState } from "react";

export function MenuItemCard({ item, restaurantId }: { item: MenuItem; restaurantId: string }) {

    const [expanded, setExpanded] = useState(false);

    return (
        <article className="flex gap-4 border-t border-neutral-200 py-6 first:border-t-0">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <VegNonVegIcon veg={item.veg} />
                    {item.category && (
                        <span className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">{item.category}</span>
                    )}
                </div>
                <h3 className="mt-1.5 text-lg font-bold text-neutral-900">{item.name}</h3>
                <div className="mt-1 flex items-center gap-3">
                    <span className="font-bold text-neutral-900">₹{item.price}</span>
                    {item.rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-rating">
                            <Star size={13} fill="currentColor" aria-hidden="true" />
                            {item.rating}
                        </span>
                    )}
                </div>

                <p className={`mt-2 text-sm leading-relaxed text-neutral-600 ${expanded ? "" : "line-clamp-2"}`}>
                    {item.description}
                </p>

                {item.description.length > 100 && (
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 text-sm font-bold text-neutral-800 hover:text-brand cursor-pointer"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>

            <div className="relative mb-4 size-28 shrink-0 sm:size-36">
                <DishTile name={item.name} img={item.img} veg={item.veg} />
                <QuantityButton itemId={item.id} restaurantId={restaurantId} />
            </div>
        </article>
    )
}
