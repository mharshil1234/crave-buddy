import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";
import { getMoodRoomRestaurantMenu } from "@/lib/mood-room";

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
        const restaurant = await getMoodRoomRestaurantMenu(state.selectedRestaurantId);
        return NextResponse.json({ success: true, restaurant, votes: state.itemVotes, state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
