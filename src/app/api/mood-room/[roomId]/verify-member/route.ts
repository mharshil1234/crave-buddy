import { auth } from "@/lib/auth";
import { checkRoomMembership } from "@/lib/db/mood-room";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { roomId } = await params;

    const isMember = await checkRoomMembership({
      roomId,
      userId: session.user.id,
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    return NextResponse.json({ isMember: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying room membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
