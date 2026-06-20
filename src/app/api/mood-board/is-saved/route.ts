import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Mood Board ID is required" },
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

    const savedMoodBoard = await prisma.saved_mood_boards.findUnique({
        where: {
            user_id_mood_board_id: {
                user_id: session.user.id,
                mood_board_id: id
            }
        }
    });

    const isSaved = !!savedMoodBoard;

    return NextResponse.json(
        { isSaved }
    );
}