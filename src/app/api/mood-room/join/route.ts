import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/lib/db/mood-room";
import type { joinRoomProps } from "@/types/mood-room";

export async function POST(req: NextRequest) {
    try {
        const body: joinRoomProps = await req.json();
        const { inviteCode, userId, displayName } = body;

        if (!inviteCode || !userId || !displayName) {
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

        const room = await joinRoom({
            inviteCode,
            userId,
            displayName,
        });

        return NextResponse.json(
            {
                success: true,
                room,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error joining mood room:", error);

        if (
            error instanceof Error &&
            [
                "Invalid invite code",
                "Invite code expired",
                "Mood room is not active",
                "Mood room is full",
            ].includes(error.message)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 400,
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
