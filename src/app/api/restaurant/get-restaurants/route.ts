import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {

    try {

        const searchParams = req.nextUrl.searchParams;
        
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");

        const response = await pool.query(
            `
            SELECT * FROM RESTAURANTS
            LIMIT 20
            `
        );

        return NextResponse.json(response.rows);
    
    } catch (error) {

        console.error("Error fetching Restaurants:", error);
        return NextResponse.json(
            { error: "Failed to fetch Restaurants", details: error },
            { status: 502 }
        );
    }
}