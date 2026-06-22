import { getCart } from "@/lib/cart";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const { cartId, cart } = await getCart();
        
        return NextResponse.json(
            { cartId, cart },
            { status: 200 }
        );
    }
    catch {
        return NextResponse.json(
            { status: "error", message: "Failed to retrieve cart" },
            { status: 500 }
        );  
    }
}