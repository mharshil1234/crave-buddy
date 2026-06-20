import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    const { id } = await request.json();

    const moodBoard = await prisma.mood_boards.findUnique({
        where: {
            id: id
        }
    });

    if (!moodBoard) {
        return NextResponse.json(
            { error: "Mood Board Not Found!" },
            { status: 404 }
        );
    }

    const cookieStore = await cookies();

    const generatedMoodBoards = JSON.parse(cookieStore.get("generatedMoodBoards")?.value || "[]");

    const canClaim = !moodBoard.creator_id && generatedMoodBoards.includes(moodBoard.id);

    if (canClaim) {
        await prisma.mood_boards.update({
            where: {
                id: id,
            },
            data: {
                creator_id: session.user.id
            }
        })
    }

    await prisma.saved_mood_boards.upsert({
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
    });

    return NextResponse.json({ success: true });
}