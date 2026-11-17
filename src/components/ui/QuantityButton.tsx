"use client";

import { useCartItem } from "@/hooks/useCartItem";

export function QuantityButton({ itemId, restaurantId }: { itemId: string; restaurantId: string }) {

    const { quantity, canIncrease, increase, decrease } = useCartItem(restaurantId, itemId);

    return (
        <div className="absolute bottom-[0.2rem] left-1/2 -translate-x-1/2 bg-white w-[70%] h-10 rounded-xl shadow-lg flex items-center justify-center">

            {quantity === 0 && (
                <button
                    type="button"
                    onClick={increase}
                    className="w-full h-full font-bold text-green-600 rounded-xl hover:cursor-pointer hover:bg-gray-200"
                >
                    ADD
                </button>
            )}

            {quantity > 0 && (
                <div className="flex items-center justify-between w-full px-1">
                    <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={decrease}
                        className="w-8 h-8 flex items-center justify-center text-green-600 font-bold text-xl rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                        -
                    </button>

                    <span className="font-bold text-green-600">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={increase}
                        disabled={!canIncrease}
                        className="w-8 h-8 flex items-center justify-center text-green-600 font-bold text-xl rounded-xl hover:bg-gray-200 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    )
}
