import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/db/mood-room";
import type { createRoomProps } from "@/types/mood-room";

export async function POST(req: NextRequest) {
    try {
        const body: createRoomProps = await req.json();

        const { moodRoomName, hostId, displayName } = body;

        if (!moodRoomName || !hostId || !displayName) {
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

        const room = await createRoom({
            moodRoomName,
            hostId,
            displayName,
        });

        return NextResponse.json(
            {
                success: true,
                room,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("Error creating mood room:", error);

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