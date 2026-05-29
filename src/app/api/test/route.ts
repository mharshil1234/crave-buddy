import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
    await redis.set("test", "Hello");
    const value = await redis.get("test");
    return NextResponse.json({ value });
}