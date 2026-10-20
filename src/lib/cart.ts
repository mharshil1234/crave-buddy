import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";
import { getRestaurantById } from "@/lib/restaurant";

export async function getCartId() {
    const cookieStore = await cookies();

    let cartId = cookieStore.get("cartID")?.value;

    if (!cartId) {
        cartId = randomUUID();
        cookieStore.set("cartID", cartId, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    }

    return cartId;
}

export async function getCart() {
    const cartId = await getCartId();

    const key = `cart:${cartId}`;

    const cart = await redis.get<Record<string, Record<string, number>>>(key) || {};

    return {
        cartId,
        cart
    };
}

export async function updateCart(restaurantId: string, itemId: string, newQuantity: number) {
    const cartId = await getCartId();

    const key = `cart:${cartId}`;

    const cart = (await redis.get<Record<string, Record<string, number>>>(key)) || {};

    if (newQuantity === 0) {
        if (cart[restaurantId]) {
            delete cart[restaurantId][itemId];
            if (Object.keys(cart[restaurantId]).length === 0) {
                delete cart[restaurantId];
            }
        }
    }
    else {
        if (!cart[restaurantId]) {
            cart[restaurantId] = {};
        }
        cart[restaurantId][itemId] = newQuantity;
    }

    await redis.set(key, cart, { ex: 60 * 60 * 24 * 7 });

    return {
        cartId,
        cart
    }
}

export async function addFinalizedOrderToCart(restaurantId: string, items: Array<{ id: string; quantity: number }>) {
    const details = await getRestaurantById({ lat: "0", lng: "0", restaurantId }) as RestaurantDetails;
    const menuItems = new Map(details.data.menu.map((item) => [item.id, item]));
    const validItems = items.map((item) => {
        const menuItem = menuItems.get(item.id);
        if (!menuItem || !Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("Finalized order contains an invalid menu item");
        return { id: item.id, quantity: item.quantity };
    });
    if (!validItems.length) throw new Error("Finalized order is empty");

    const { cartId, cart } = await getCart();
    const restaurantCart = { ...(cart[restaurantId] ?? {}) };
    for (const item of validItems) restaurantCart[item.id] = (restaurantCart[item.id] ?? 0) + item.quantity;
    const updatedCart = { ...cart, [restaurantId]: restaurantCart };
    await redis.set(`cart:${cartId}`, updatedCart, { ex: 60 * 60 * 24 * 7 });
    return { cartId, cart: updatedCart };
}

type MenuItem = {
    id: string;
    name: string;
    price: number;
    img: string;
    veg: boolean;
};

type RestaurantDetails = {
    data: {
        name: string;
        restaurantImg: string;
        menu: MenuItem[];
    };
};

type CartItemDetails = {
    id: string;
    name: string;
    price: number;
    img: string;
    isVeg: boolean;
    quantity: number;
    total: number;
};

type RestaurantCartDetails = {
    restaurantId: string;
    restaurantName: string;
    restaurantImg: string;
    restaurantTotal: number;
    items: CartItemDetails[];
};

export async function getCartDetails() {
    const { cart } = await getCart();

    const result: Record<string, RestaurantCartDetails> = {};

    for (const [restaurantId, itemsList] of Object.entries(cart)) {
        const restaurantDetails = await getRestaurantById({
            lat: "0",
            lng: "0",
            restaurantId,
        }) as RestaurantDetails;

        const menuMap = new Map<string, MenuItem>(
            restaurantDetails.data.menu.map((item) => [item.id, item])
        );

        let restaurantTotal = 0;
        const items: CartItemDetails[] = [];

        for (const [itemId, quantity] of Object.entries(itemsList)) {
            const item = menuMap.get(itemId);

            if (!item) {
                continue;
            }

            const itemTotal = item.price * quantity;

            restaurantTotal += itemTotal;

            items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                isVeg: item.veg,
                quantity,
                total: itemTotal,
            });
        }

        result[restaurantId] = {
            restaurantId,
            restaurantName: restaurantDetails.data.name,
            restaurantImg: restaurantDetails.data.restaurantImg,
            restaurantTotal,
            items,
        };
    }

    return { result };
}
