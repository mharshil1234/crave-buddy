import { getMoodBoard } from "@/lib/mood-board";
import { createMoodBoard } from "@/lib/db/mood-board";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const isVeg = searchParams.get("isVeg");
    const query = searchParams.get("query");

    if (!lat || !lng || !isVeg || !query) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const moodBoard = await getMoodBoard({ lat, lng, query, isVeg });

        const id = await createMoodBoard({ userId: "1234", query, isVeg, moodBoard })

        return NextResponse.json(id);
    } catch (error) {
        console.error("Error to create mood board:", error);
        return NextResponse.json({ error: "Failed to to create mood board" }, { status: 500 });
    }
}