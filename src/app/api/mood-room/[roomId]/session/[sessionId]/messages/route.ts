import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChatHistory, getSessionMember, MoodRoomAccessError } from "@/lib/db/mood-room-voting";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string; sessionId: string }> }
) {
    try {
        const userSession = await auth.api.getSession({ headers: req.headers });
        if (!userSession) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { roomId, sessionId } = await params;
        await getSessionMember({ roomId, sessionId, userId: userSession.user.id });
        const messages = await getChatHistory(sessionId);

        return NextResponse.json({ success: true, messages }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        if (error instanceof MoodRoomAccessError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        console.error("Error fetching chat messages:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
    }
}
