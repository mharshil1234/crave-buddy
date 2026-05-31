import { updateCart } from "@/lib/cart";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {

    try {
        const { restaurantId, itemId, newQuantity } = await req.json();

        if (!restaurantId || !itemId || newQuantity < 0) {
            return NextResponse.json(
                { status: "error", message: "Invalid request body" },
                { status: 400 }
            )
        }

        const { cartId, cart } = await updateCart(restaurantId, itemId, newQuantity);

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