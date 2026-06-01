import { NextRequest, NextResponse } from "next/server";
import { getCartDetails } from "@/lib/cart";

export async function GET() {
    try {
        const { result: cartDetails } = await getCartDetails();

        return NextResponse.json(
            { cartDetails },
            { status: 200 }
        );
    }
    catch(error) {
        console.error("Error fetching cart details:", error);
        return NextResponse.json(
            { status: "error", message: "Failed to retrieve cart details" },
            { status: 500 }
        );
    }
}