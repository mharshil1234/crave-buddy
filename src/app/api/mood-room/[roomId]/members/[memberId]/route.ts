import { auth } from "@/lib/auth";
import { removeRoomMember } from "@/lib/db/mood-room";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string; memberId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { roomId, memberId } = await params;
        await removeRoomMember({ roomId, memberId, hostId: session.user.id });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to remove room member";
        const status = message === "Mood room not found" || message === "Active room member not found" ? 404
            : message === "Only the host can remove room members" || message === "The host cannot remove themselves" ? 403
                : 500;
        if (status === 500) console.error("Error removing mood room member:", error);
        return NextResponse.json({ error: message }, { status });
    }
}
