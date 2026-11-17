import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createRoom } from "@/lib/db/mood-room";

const createRoomSchema = z.object({
    moodRoomName: z.string().trim().min(1).max(100),
    displayName: z.string().trim().min(1).max(50),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const parsed = createRoomSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ success: false, message: "Missing or invalid fields" }, { status: 400 });
        }

        const room = await createRoom({ ...parsed.data, hostId: session.user.id });

        return NextResponse.json({ success: true, room }, { status: 201 });
    } catch (error) {
        console.error("Error creating mood room:", error);
        return NextResponse.json({ success: false, message: "Failed to create mood room" }, { status: 500 });
    }
}
