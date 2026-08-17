import { startRoomSession } from "@/lib/db/mood-room";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;
        const { hostId, title } = await req.json();

        if (!roomId || !hostId || !title) {
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

        const session = await startRoomSession({
            roomId,
            hostId,
            title,
        });

        return NextResponse.json(
            {
                success: true,
                session,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("Error starting mood room session:", error);

        if (
            error instanceof Error &&
            [
                "Mood room not found",
                "Only the host can start a session",
                "Mood room is not active",
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
