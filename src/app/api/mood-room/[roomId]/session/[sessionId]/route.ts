import { getMoodRoomSession } from "@/lib/db/mood-room-session"
import { NextRequest, NextResponse } from "next/server"
import { title } from "process";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string; sessionId: string; }> }
) {
    try {
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

        const session = await getMoodRoomSession({ roomId, sessionId });
        
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