import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getMoodBoard, isMoodBoardId } from "@/lib/db/mood-board";
import { GENERATED_MOOD_BOARDS_COOKIE, readGeneratedMoodBoards } from "@/lib/mood-board-cookie";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body: unknown = await request.json().catch(() => null);
    const id = body && typeof body === "object" && "id" in body ? body.id : null;

    if (!isMoodBoardId(id)) {
        return NextResponse.json(
            { error: "Valid Mood Board ID is required" },
            { status: 400 }
        );
    }

    try {
        const moodBoard = await getMoodBoard({ moodBoardId: id });

        if (!moodBoard) {
            return NextResponse.json(
                { error: "Mood Board Not Found!" },
                { status: 404 }
            );
        }

        const cookieStore = await cookies();
        const generatedMoodBoards = readGeneratedMoodBoards(cookieStore.get(GENERATED_MOOD_BOARDS_COOKIE)?.value);
        const canClaim = !moodBoard.creator_id && generatedMoodBoards.includes(moodBoard.id);

        await prisma.$transaction([
            ...(canClaim ? [prisma.mood_boards.update({
                where: { id },
                data: { creator_id: session.user.id },
            })] : []),
            prisma.saved_mood_boards.upsert({
                where: {
                    user_id_mood_board_id: {
                        user_id: session.user.id,
                        mood_board_id: id
                    }
                },
                create: {
                    user_id: session.user.id,
                    mood_board_id: id
                },
                update: {}
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving mood board:", error);
        return NextResponse.json({ error: "Failed to save mood board" }, { status: 500 });
    }
}
