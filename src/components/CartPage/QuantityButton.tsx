"use client";

import { Minus, Plus } from "lucide-react";
import { useCartItem } from "@/hooks/useCartItem";

export function QuantityButton({ itemId, restaurantId }: { itemId: string; restaurantId: string }) {

    const { quantity, canIncrease, increase, decrease } = useCartItem(restaurantId, itemId);

    if (quantity === 0) {
        return (
            <button
                type="button"
                onClick={increase}
                className="h-9 w-full rounded-lg text-sm font-extrabold text-brand ring-1 ring-neutral-300 transition hover:bg-brand-soft cursor-pointer"
            >
                ADD
            </button>
        );
    }

    return (
        <div className="flex h-9 w-full items-center justify-between rounded-lg px-1 ring-1 ring-neutral-300">
            <button
                type="button"
                aria-label="Decrease quantity"
                onClick={decrease}
                className="flex size-7 items-center justify-center rounded-md text-brand transition hover:bg-brand-soft cursor-pointer"
            >
                <Minus size={14} aria-hidden="true" />
            </button>

            <span className="text-sm font-bold text-neutral-900" aria-live="polite">
                {quantity}
            </span>

            <button
                type="button"
                aria-label="Increase quantity"
                onClick={increase}
                disabled={!canIncrease}
                className="flex size-7 items-center justify-center rounded-md text-brand transition hover:bg-brand-soft cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={14} aria-hidden="true" />
            </button>
        </div>
    )
}
