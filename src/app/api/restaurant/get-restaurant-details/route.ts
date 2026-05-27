import { NextRequest, NextResponse } from "next/server";
import RestaurantData from "../../../../../data/restaurantMenu.json" with { type: "json" };

export async function GET(req: NextRequest) {

    const searchParams = req.nextUrl.searchParams;

    const restaurantId = searchParams.get("id");

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!restaurantId) {
        return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    const data = (RestaurantData as Record<string, any>)[restaurantId];

    if(!data) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
}