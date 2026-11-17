import { getMoodBoard } from "@/lib/mood-board";
import { createMoodBoard } from "@/lib/db/mood-board";
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { EmptyRecommendationError } from "@/lib/recommender/validate";

const MOOD_BOARD_LIMIT = 10;
const MOOD_BOARD_WINDOW_SECONDS = 10 * 60;

const moodBoardParamsSchema = z.object({
    lat: z.string().min(1),
    lng: z.string().min(1),
    isVeg: z.enum(["true", "false"]),
    query: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const parsed = moodBoardParamsSchema.safeParse({
        lat: searchParams.get("lat"),
        lng: searchParams.get("lng"),
        isVeg: searchParams.get("isVeg"),
        query: searchParams.get("query"),
    });

    if (!parsed.success) {
        return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }
    const { lat, lng, isVeg, query } = parsed.data;

    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });
    const userId = session?.user?.id || null;

    const limit = await rateLimit(
        `mood-board:${userId ?? `ip:${clientIp(requestHeaders)}`}`,
        MOOD_BOARD_LIMIT,
        MOOD_BOARD_WINDOW_SECONDS,
    );
    if (!limit.allowed) {
        return NextResponse.json(
            { error: "You're generating mood boards too quickly. Please try again in a few minutes." },
            { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
        );
    }

    try {
        const moodBoard = await getMoodBoard({ lat, lng, query, isVeg });

        const id = await createMoodBoard({ userId, query, isVeg, moodBoard })

        if (!userId) {
            const cookieStore = await cookies();
            const generatedMoodBoards: string[] = JSON.parse(cookieStore.get("generatedMoodBoards")?.value ?? "[]");
            generatedMoodBoards.push(id);
            cookieStore.set("generatedMoodBoards", JSON.stringify(generatedMoodBoards.slice(-20)));
        }

        return NextResponse.json({ id });
    } catch (error) {
        if (error instanceof EmptyRecommendationError) {
            return NextResponse.json(
                { error: "We couldn't find dishes for that craving. Try describing it differently." },
                { status: 502 },
            );
        }
        console.error("Error to create mood board:", error);
        return NextResponse.json({ error: "Failed to create mood board" }, { status: 500 });
    }
}
