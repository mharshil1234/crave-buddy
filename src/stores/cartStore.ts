import { create } from "zustand";

interface CartState {
    cart: Record<string, number>;
    setCart: (cart: Record<string, number>) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: {},
    setCart: (cart) => set({ cart }),
    updateQuantity: (itemId, quantity) => set((state) => {
        if(quantity<0) {
            let cartCopy = { ...state.cart };
            delete cartCopy[itemId];
            return { cart: cartCopy };
        }
        return {
            cart: {
                ...state.cart,
                [itemId]: quantity
            }
        }
    })
}));