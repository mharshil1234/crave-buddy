import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkRoomMembership, getRoom } from "@/lib/db/mood-room";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { roomId } = await params;
        if (!z.uuid().safeParse(roomId).success) {
            return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
        }

        if (!(await checkRoomMembership({ roomId, userId: session.user.id }))) {
            return NextResponse.json({ error: "Not a member of this room" }, { status: 403 });
        }

        const room = await getRoom({ roomId });

        return NextResponse.json(room, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        if (error instanceof Error && error.message === "Mood room not found") {
            return NextResponse.json({ error: "Mood room not found" }, { status: 404 });
        }

        console.error("Error fetching mood room:", error);
        return NextResponse.json({ error: "Failed to fetch mood room" }, { status: 500 });
    }
}
