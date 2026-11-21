"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartItem } from "@/hooks/useCartItem";

export function QuantityButton({ itemId, restaurantId, itemName }: { itemId: string; restaurantId: string; itemName?: string }) {

    const { quantity, canIncrease, increase, decrease } = useCartItem(restaurantId, itemId);
    const label = itemName ? ` ${itemName}` : "";

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

    const removes = quantity === 1;

    return (
        <div className="flex h-9 w-full items-center justify-between rounded-lg bg-white px-1 ring-1 ring-neutral-300">
            <button
                type="button"
                aria-label={removes ? `Remove${label}` : `Decrease quantity${label}`}
                onClick={decrease}
                className={`flex size-7 items-center justify-center rounded-md transition cursor-pointer ${removes
                    ? "text-neutral-500 hover:bg-red-50 hover:text-red-600"
                    : "text-brand hover:bg-brand-soft"
                    }`}
            >
                {removes ? <Trash2 size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
            </button>

            <span className="text-sm font-bold tabular-nums text-neutral-900" aria-live="polite">
                {quantity}
            </span>

            <button
                type="button"
                aria-label={`Increase quantity${label}`}
                onClick={increase}
                disabled={!canIncrease}
                className="flex size-7 items-center justify-center rounded-md text-brand transition hover:bg-brand-soft cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={14} aria-hidden="true" />
            </button>
        </div>
    )
}
