import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

function errorResponse(error: unknown) {
    if (error instanceof MoodRoomAccessError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Craving request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load or save cravings" }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const state = await getSessionState({ ...await params, userId: session.user.id });
        return NextResponse.json({ success: true, prompts: state.prompts, totalSubmitted: state.prompts.length, state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
