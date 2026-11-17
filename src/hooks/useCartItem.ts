"use client";

import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { MAX_ITEM_QUANTITY } from "@/lib/cart-limits";

// In-flight cart requests per item. The server's quantity is applied only once
// the last request for an item settles, so overlapping clicks never flicker back.
const pendingRequests = new Map<string, number>();

function settle(itemId: string): boolean {
    const remaining = (pendingRequests.get(itemId) ?? 1) - 1;
    if (remaining <= 0) {
        pendingRequests.delete(itemId);
        return true;
    }
    pendingRequests.set(itemId, remaining);
    return false;
}

/** Quantity of one cart item plus an optimistic, atomic +1/-1 updater. */
export function useCartItem(restaurantId: string, itemId: string) {
    const quantity = useCartStore((state) => state.cart[itemId] ?? 0);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    async function change(delta: 1 | -1) {
        const current = useCartStore.getState().cart[itemId] ?? 0;
        const next = Math.min(MAX_ITEM_QUANTITY, Math.max(0, current + delta));
        if (next === current) return;

        updateQuantity(itemId, next);
        pendingRequests.set(itemId, (pendingRequests.get(itemId) ?? 0) + 1);

        let serverQuantity: number | null = null;
        try {
            const response = await fetch("/api/cart/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ restaurantId, itemId, delta }),
            });
            const data = await response.json().catch(() => null) as { quantity?: number } | null;
            if (!response.ok || typeof data?.quantity !== "number") throw new Error("Failed to update cart");
            serverQuantity = data.quantity;
        } catch (error) {
            console.error("Error updating item quantity:", error);
            // Undo only this click's optimistic change.
            const latest = useCartStore.getState().cart[itemId] ?? 0;
            updateQuantity(itemId, Math.max(0, latest - delta));
            toast.error("Couldn't update your cart");
        } finally {
            if (settle(itemId) && serverQuantity !== null) updateQuantity(itemId, serverQuantity);
        }
    }

    return {
        quantity,
        canIncrease: quantity < MAX_ITEM_QUANTITY,
        increase: () => change(1),
        decrease: () => change(-1),
    };
}
