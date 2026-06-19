import { getMoodBoard } from "@/lib/mood-board";
import { createMoodBoard } from "@/lib/db/mood-board";
import { NextRequest, NextResponse } from "next/server";
import { useSession } from "@/lib/auth-client";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const isVeg = searchParams.get("isVeg");
    const query = searchParams.get("query");
    const { data: session } = useSession();
    const userId = session?.user?.id || null;

    if (!lat || !lng || !isVeg || !query) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const moodBoard = await getMoodBoard({ lat, lng, query, isVeg });

        const id = await createMoodBoard({ userId, query, isVeg, moodBoard })

        if(!userId) {
            const cookieStore = await cookies();
            const generatedMoodBoards: string[] = JSON.parse(
                cookieStore.get("generatedMoodBoards")?.value ?? "[]"
            );
            generatedMoodBoards.push(id);
            cookieStore.set("generatedMoodBoards", JSON.stringify(generatedMoodBoards.slice(-20)));
        }

        return NextResponse.json(id);
    } catch (error) {
        console.error("Error to create mood board:", error);
        return NextResponse.json({ error: "Failed to to create mood board" }, { status: 500 });
    }
}