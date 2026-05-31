import { NextRequest, NextResponse } from "next/server";
import { getRestaurantByid } from "@/lib/restaurant";

export async function GET(req: NextRequest) {

    const data = await getRestaurantByid({
        lat: 0,
        lng: 0,
        restaurantId: req.nextUrl.searchParams.get("restaurantId") || ""
    });

    return NextResponse.json({ data });
}