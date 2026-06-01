import { NextRequest, NextResponse } from "next/server";
import { getRestaurants } from "@/lib/restaurant";

export async function GET(req: NextRequest) {

    try {

        const lat: string = req.nextUrl.searchParams.get("lat") ?? "0";
        const lng: string = req.nextUrl.searchParams.get("lng") ?? "0";

        const RestaurantsData = await getRestaurants({
            lat,
            lng
        });

        return NextResponse.json(RestaurantsData);
    
    } catch (error) {

        console.error("Error fetching Restaurants:", error);
        return NextResponse.json(
            { error: "Failed to fetch Restaurants", details: error },
            { status: 502 }
        );
    }
}