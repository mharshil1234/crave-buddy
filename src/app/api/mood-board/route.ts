import { getMoodBoard } from "@/lib/mood-board";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const isVeg = searchParams.get("isVeg");
    const query = searchParams.get("query");

    if (!lat || !lng || !isVeg || !query) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const restaurants = await getMoodBoard({ lat, lng, query, isVeg });
        return NextResponse.json(restaurants);
    } catch (error) {
        console.error("Error fetching mood restaurants:", error);
        return NextResponse.json({ error: "Failed to fetch mood restaurants" }, { status: 500 });
    }
}