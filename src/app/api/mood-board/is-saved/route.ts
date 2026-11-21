import { auth } from "@/lib/auth";
import { isMoodBoardId } from "@/lib/db/mood-board";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const id = request.nextUrl.searchParams.get("id");

    if (!isMoodBoardId(id)) {
        return NextResponse.json(
            { error: "Valid Mood Board ID is required" },
            { status: 400 }
        )
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json(
            { isSaved: false }
        );
    }

    try {
        const savedMoodBoard = await prisma.saved_mood_boards.findUnique({
            where: {
                user_id_mood_board_id: {
                    user_id: session.user.id,
                    mood_board_id: id
                }
            }
        });

        return NextResponse.json(
            { isSaved: !!savedMoodBoard }
        );
    } catch (error) {
        console.error("Error checking saved mood board:", error);
        return NextResponse.json({ error: "Failed to check saved mood board" }, { status: 500 });
    }
}
