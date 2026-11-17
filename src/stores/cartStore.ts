import { create } from "zustand";

/** Quantities grouped by restaurant, matching the shape returned by /api/cart/get. */
export type CartByRestaurant = Record<string, Record<string, number>>;

interface CartState {
    cart: Record<string, number>;
    setCart: (cart: Record<string, number>) => void;
    updateQuantity: (itemId: string, quantity: number) => void;

    /** Whole-cart view used by the header badge; `cart` above may hold only one restaurant's items. */
    cartByRestaurant: CartByRestaurant;
    setCartByRestaurant: (cart: CartByRestaurant) => void;
    setRestaurantItemQuantity: (restaurantId: string, itemId: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: {},
    setCart: (cart) => set({ cart }),
    updateQuantity: (itemId, quantity) => set((state) => {
        if(quantity<=0) {
            const cartCopy = { ...state.cart };
            delete cartCopy[itemId];
            return { cart: cartCopy };
        }
        return {
            cart: {
                ...state.cart,
                [itemId]: quantity
            }
        }
    }),

    cartByRestaurant: {},
    setCartByRestaurant: (cartByRestaurant) => set({ cartByRestaurant }),
    setRestaurantItemQuantity: (restaurantId, itemId, quantity) => set((state) => {
        const items = { ...state.cartByRestaurant[restaurantId] };
        if (quantity <= 0) {
            delete items[itemId];
        } else {
            items[itemId] = quantity;
        }

        const cartByRestaurant = { ...state.cartByRestaurant };
        if (Object.keys(items).length === 0) {
            delete cartByRestaurant[restaurantId];
        } else {
            cartByRestaurant[restaurantId] = items;
        }
        return { cartByRestaurant };
    }),
}));

/** Number of restaurants with at least one item in the cart. */
export function countCartRestaurants(cartByRestaurant: CartByRestaurant): number {
    return Object.values(cartByRestaurant).filter((items) =>
        Object.values(items).some((quantity) => quantity > 0)
    ).length;
}
