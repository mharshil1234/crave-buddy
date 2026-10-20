import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";
import { voteRestaurantThroughSocket } from "@/lib/mood-room-socket-command";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

function errorResponse(error: unknown) {
    if (error instanceof MoodRoomAccessError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Restaurant vote request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load or save restaurant votes" }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const state = await getSessionState({ ...await params, userId: session.user.id });
        const totalVotes = Object.values(state.restaurantVotes).reduce((total, vote) => total + vote.count, 0);
        return NextResponse.json({ success: true, nominees: state.restaurantNominees, votes: state.restaurantVotes, totalVotes, state }, {
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
        const parsed = z.object({ restaurantId: z.string().min(1).max(100) }).safeParse(await req.json().catch(() => null));
        if (!parsed.success) throw new MoodRoomAccessError("Choose a restaurant", 400);
        const result = await voteRestaurantThroughSocket(scope, parsed.data.restaurantId, req.headers.get("cookie") || "");
        if (!result.ok) throw new MoodRoomAccessError(result.error, 409);
        return NextResponse.json({ success: true, votes: result.state.restaurantVotes, state: result.state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
