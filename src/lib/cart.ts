import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";

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

    let cart = (await redis.get<Record<string, Record<string, number>>>(key)) || {};

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