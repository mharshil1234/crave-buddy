import { changeCartItem, InvalidCartItemError } from "@/lib/cart";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateCartSchema = z.object({
    restaurantId: z.string().min(1).max(100),
    itemId: z.string().min(1).max(150),
    delta: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(req: NextRequest) {
    const parsed = updateCartSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 });
    }

    try {
        const { restaurantId, itemId, delta } = parsed.data;
        const { quantity } = await changeCartItem(restaurantId, itemId, delta);

        return NextResponse.json({ status: "success", quantity }, { status: 200 });
    } catch (error) {
        if (error instanceof InvalidCartItemError) {
            return NextResponse.json({ status: "error", message: error.message }, { status: 400 });
        }
        console.error("Error updating cart:", error);
        return NextResponse.json({ status: "error", message: "Failed to update cart" }, { status: 500 });
    }
}
