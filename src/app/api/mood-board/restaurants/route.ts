import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMoodBoard, isMoodBoardId } from "@/lib/db/mood-board";
import { hydrateMoodBoard } from "@/lib/mood-board";

const storedBoardSchema = z.record(z.string(), z.array(z.string()));

export async function GET(req: NextRequest) {
    try {
        const moodBoardId = req.nextUrl.searchParams.get("id") ?? "";
        const lat = req.nextUrl.searchParams.get("lat") ?? "0";
        const lng = req.nextUrl.searchParams.get("lng") ?? "0";

        if (!isMoodBoardId(moodBoardId)) return NextResponse.json({ error: "Invalid Mood Board Id" }, { status: 400 });

        const moodBoard = await getMoodBoard({ moodBoardId });
        if (!moodBoard) return NextResponse.json({ error: "Mood Board not found" }, { status: 404 });

        const stored = storedBoardSchema.safeParse(moodBoard.mood_board);
        const restaurants = stored.success ? await hydrateMoodBoard({ lat, lng, moodBoard: stored.data }) : [];

        return NextResponse.json({ restaurants });
    } catch (error) {
        console.error("Error loading mood board restaurants:", error);
        return NextResponse.json({ error: "Failed to load mood board restaurants" }, { status: 500 });
    }
}
