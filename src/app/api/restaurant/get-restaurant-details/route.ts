import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    try {

    const searchParams = req.nextUrl.searchParams;

    const restaurantId = searchParams.get("id");

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const swiggyUrl = `https://fakerestaurantapi.runasp.net/api/Restaurant/4`;

    const response = await fetch(`${encodeURIComponent(swiggyUrl)}`, {
        method: "GET",
        headers: {
            "accept": "*/*",
             "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const text = await response.text();
        console.log("Swiggy response error:", response.status, text);
        return NextResponse.json(
            { error: "Swiggy fetch failed", status: response.status, body: text },
            { status: 502 }
        );
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
    } catch(err) {
        console.log("Error: ", err);
        return Response.json({ error: "Failed to fetch restaurant details" }, { status: 500 });
    }  
}