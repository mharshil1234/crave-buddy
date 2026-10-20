import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";
import { finalizeSessionThroughSocket } from "@/lib/mood-room-socket-command";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) throw new MoodRoomAccessError("Invalid request origin", 403);
        const scope = await params;
        await getSessionState({ ...scope, userId: session.user.id });
        const result = await finalizeSessionThroughSocket(scope, req.headers.get("cookie") || "");
        if (!result.ok) throw new MoodRoomAccessError(result.error, 409);
        return NextResponse.json({ success: true, state: result.state }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        if (error instanceof MoodRoomAccessError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        console.error("Mood Room finalization failed:", error);
        return NextResponse.json({ success: false, message: "Unable to finalize this order" }, { status: 500 });
    }
}
