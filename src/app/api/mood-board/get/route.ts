import { NextResponse, NextRequest } from "next/server";
import { getMoodBoard, isMoodBoardId } from "@/lib/db/mood-board";

export async function GET(req: NextRequest) {

    try {
        const moodBoardId = req.nextUrl.searchParams.get("id") ?? "";
        if (!isMoodBoardId(moodBoardId)) return NextResponse.json({ error: "Invalid Mood Board Id" }, { status: 400 });

        const moodBoard = await getMoodBoard({ moodBoardId });
        if (!moodBoard) return NextResponse.json({ error: "Mood Board not found" }, { status: 404 });

        return NextResponse.json(moodBoard);
    }
    catch (error) {
        console.error("Error to get mood board:", error);
        return NextResponse.json({ error: "Failed to get mood board" }, { status: 500 });
    }
}
