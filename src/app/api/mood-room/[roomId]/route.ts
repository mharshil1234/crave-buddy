import { getRoom } from "@/lib/db/mood-room";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;

        if (!roomId) {
            return NextResponse.json(
                { error: "Missing room id" },
                { status: 400 }
            );
        }

        const room = await getRoom({ roomId });

        return NextResponse.json(room);
    } catch (error) {
        console.error("Error fetching mood room:", error);

        if (error instanceof Error && error.message === "Mood room not found") {
            return NextResponse.json(
                { error: "Mood room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch mood room" },
            { status: 500 }
        );
    }
}
