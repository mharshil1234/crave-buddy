import { NextRequest, NextResponse } from "next/server";
import { getRestaurantByid } from "@/lib/restaurant";

export async function GET(req: NextRequest) {

    try {

        const restaurantId = req.nextUrl.searchParams.get("id");
        const lat: string = req.nextUrl.searchParams.get("lat") ?? "0";
        const lng: string = req.nextUrl.searchParams.get("lng") ?? "0";

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
        }

        const { data } = await getRestaurantByid({
            lat,
            lng,
            restaurantId
        });

        return NextResponse.json({ data });
    } catch (err) {
        console.log("Error: ", err);
        return NextResponse.json({ error: "Failed to fetch restaurant details" }, { status: 500 });
    }

}