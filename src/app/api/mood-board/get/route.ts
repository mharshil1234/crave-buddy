import { NextResponse, NextRequest } from "next/server";
import { getMoodBoard } from "@/lib/db/mood-board";

export async function GET(req: NextRequest) {

    try {
        const moodBoardId = req.nextUrl.searchParams.get("id") ?? "";
        if (!moodBoardId) return NextResponse.json({ error: "Missing Mood Board Id" }, { status: 400 });

        const moodBoard = await getMoodBoard({ moodBoardId });

        return NextResponse.json(moodBoard);
    }
    catch (error) {
        console.error("Error to get mood board:", error);
        return NextResponse.json({ error: "Failed to to get mood board" }, { status: 500 });
    }
}