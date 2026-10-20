import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";
import { getMoodRoomRestaurantMenu } from "@/lib/mood-room";
import { lockItemsThroughSocket, voteItemThroughSocket } from "@/lib/mood-room-socket-command";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

function errorResponse(error: unknown) {
    if (error instanceof MoodRoomAccessError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Item vote request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load or save group menu votes" }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const state = await getSessionState({ ...await params, userId: session.user.id });
        if (!state.selectedRestaurantId || !["ITEM_VOTING", "FINISHED"].includes(state.phase)) {
            throw new MoodRoomAccessError("The winning restaurant is not available yet", 409);
        }
        const restaurant = getMoodRoomRestaurantMenu(state.selectedRestaurantId);
        return NextResponse.json({ success: true, restaurant, votes: state.itemVotes, state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) throw new MoodRoomAccessError("Invalid request origin", 403);
        const scope = await params;
        await getSessionState({ ...scope, userId: session.user.id });
        const body = await req.json().catch(() => null);
        const parsed = z.object({ itemId: z.string().min(1).max(150), quantity: z.number().int().min(0).max(20) }).safeParse(body);
        if (!parsed.success) throw new MoodRoomAccessError("Choose a valid menu item and quantity", 400);
        const result = await voteItemThroughSocket(scope, parsed.data.itemId, parsed.data.quantity, req.headers.get("cookie") || "");
        if (!result.ok) throw new MoodRoomAccessError(result.error, 409);
        return NextResponse.json({ success: true, votes: result.state.itemVotes, state: result.state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) throw new MoodRoomAccessError("Invalid request origin", 403);
        const scope = await params;
        await getSessionState({ ...scope, userId: session.user.id });
        const result = await lockItemsThroughSocket(scope, req.headers.get("cookie") || "");
        if (!result.ok) throw new MoodRoomAccessError(result.error, 409);
        return NextResponse.json({ success: true, state: result.state }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        return errorResponse(error);
    }
}
