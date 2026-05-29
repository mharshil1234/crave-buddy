import { getCartId } from "@/lib/cart";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {

    try {
        const { restaurantId, itemId, quantity } = await req.json();

        if (!restaurantId || !itemId || quantity < 0) {
            return NextResponse.json(
                { status: "error", message: "Invalid request body" },
                { status: 400 }
            )
        }

        const cartId = await getCartId();

        const key = `cart:${cartId}`;

        let cart = (await redis.get<Record<string, Record<string, number>>>(key)) || {};

        if(quantity === 0) {
            if(cart[restaurantId]) {
                delete cart[restaurantId][itemId];
                if(Object.keys(cart[restaurantId]).length === 0) {
                    delete cart[restaurantId];
                }
            }
        }
        else {
            if(!cart[restaurantId]) {
                cart[restaurantId] = {};
            }
            cart[restaurantId][itemId] = quantity;
        }

        await redis.set(key, cart, { ex: 60 * 60 * 24 * 7 });

        return NextResponse.json(
            { status: "success", message: "Cart updated successfully", cartId, cart },
            { status: 200 }
        )
    }
    catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json(
            { status: "error", message: "Failed to update cart" },
            { status: 500 }
        );
    }
}