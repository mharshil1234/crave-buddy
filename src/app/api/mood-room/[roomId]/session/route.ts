import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { startRoomSession } from "@/lib/db/mood-room";

const startSessionSchema = z.object({
    title: z.string().trim().min(1).max(100),
});

const CLIENT_ERRORS: Record<string, number> = {
    "Mood room not found": 404,
    "Only the host can start a session": 403,
    "Mood room is not active": 403,
};

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { roomId } = await params;
        if (!z.uuid().safeParse(roomId).success) {
            return NextResponse.json({ success: false, message: "Invalid room id" }, { status: 400 });
        }

        const parsed = startSessionSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ success: false, message: "Missing or invalid fields" }, { status: 400 });
        }

        const roomSession = await startRoomSession({
            roomId,
            hostId: session.user.id,
            title: parsed.data.title,
        });

        return NextResponse.json({ success: true, session: roomSession }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message in CLIENT_ERRORS) {
            return NextResponse.json({ success: false, message: error.message }, { status: CLIENT_ERRORS[error.message] });
        }

        console.error("Error starting mood room session:", error);
        return NextResponse.json({ success: false, message: "Failed to start session" }, { status: 500 });
    }
}
