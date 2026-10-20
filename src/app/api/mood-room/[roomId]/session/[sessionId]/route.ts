import { getMoodRoomSession } from "@/lib/db/mood-room-session"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth";
import { getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string; sessionId: string; }> }
) {
    try {
        const userSession = await auth.api.getSession({ headers: req.headers });
        if (!userSession) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { roomId, sessionId } = await params;

        if (!roomId || !sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields",
                },
                {
                    status: 400,
                }
            );
        }

        const state = await getSessionState({ roomId, sessionId, userId: userSession.user.id });
        const session = await getMoodRoomSession({ roomId, sessionId });
        
        return NextResponse.json(
            {
                success: true,
                session,
                state,
            },
            {
                status: 200,
                headers: { "Cache-Control": "private, no-store" },
            }
        );

    } catch (error) {
        if (error instanceof MoodRoomAccessError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }

        console.error("Error fetching mood room session:", error);

        if (
            error instanceof Error &&
            [
                "Mood room not found",
                "Session not found",
            ].includes(error.message)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: error.message === "Mood room not found" ? 404 : 403,
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            {
                status: 500,
            }
        );

    }
}
