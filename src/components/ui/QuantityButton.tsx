"use client";

import { Minus, Plus } from "lucide-react";
import { useCartItem } from "@/hooks/useCartItem";

export function QuantityButton({ itemId, restaurantId }: { itemId: string; restaurantId: string }) {

    const { quantity, canIncrease, increase, decrease } = useCartItem(restaurantId, itemId);

    return (
        <div className="absolute -bottom-4 left-1/2 flex h-10 w-[80%] -translate-x-1/2 items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-neutral-200">

            {quantity === 0 && (
                <button
                    type="button"
                    onClick={increase}
                    className="size-full rounded-xl text-sm font-extrabold tracking-wide text-brand transition hover:bg-brand-soft cursor-pointer"
                >
                    ADD
                </button>
            )}

            {quantity > 0 && (
                <div className="flex size-full items-center justify-between rounded-xl bg-brand px-1 text-white">
                    <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={decrease}
                        className="flex size-8 items-center justify-center rounded-lg transition hover:bg-white/20 cursor-pointer"
                    >
                        <Minus size={16} aria-hidden="true" />
                    </button>

                    <span className="font-bold" aria-live="polite">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={increase}
                        disabled={!canIncrease}
                        className="flex size-8 items-center justify-center rounded-lg transition hover:bg-white/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={16} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    )
}
