import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addFinalizedOrderToCart } from "@/lib/cart";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) throw new MoodRoomAccessError("Invalid request origin", 403);
        const state = await getSessionState({ ...await params, userId: session.user.id });
        if (state.phase !== "FINISHED" || !state.result) throw new MoodRoomAccessError("The group order has not been finalized", 409);
        const { cartId, cart } = await addFinalizedOrderToCart(state.result.restaurantId, state.result.items.map(({ id, quantity }) => ({ id, quantity })));
        return NextResponse.json({ success: true, cartId, cart }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        if (error instanceof MoodRoomAccessError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        console.error("Adding finalized Mood Room order to cart failed:", error);
        return NextResponse.json({ success: false, message: "Unable to add the group order to your cart" }, { status: 500 });
    }
}
