import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { joinRoom } from "@/lib/db/mood-room";

const joinRoomSchema = z.object({
    inviteCode: z.string().trim().min(1).max(12),
    displayName: z.string().trim().min(1).max(50),
});

const CLIENT_ERRORS = [
    "Invalid invite code",
    "Invite code expired",
    "Mood room is not active",
    "Mood room is full",
];

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const parsed = joinRoomSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ success: false, message: "Missing or invalid fields" }, { status: 400 });
        }

        const room = await joinRoom({ ...parsed.data, userId: session.user.id });

        return NextResponse.json({ success: true, room }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && CLIENT_ERRORS.includes(error.message)) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        console.error("Error joining mood room:", error);
        return NextResponse.json({ success: false, message: "Failed to join mood room" }, { status: 500 });
    }
}
