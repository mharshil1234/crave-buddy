import { redis } from "@/lib/redis";
import { getCartId } from "@/lib/cart";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {

        const cartId = await getCartId();

        const key = `cart:${cartId}`;

        const cart = await redis.get<Record<string, Record<string, number>>>(key) || {};
        
        return NextResponse.json(
            { cartId, cart },
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { status: "error", message: "Failed to retrieve cart" },
            { status: 500 }
        );  
    }
}