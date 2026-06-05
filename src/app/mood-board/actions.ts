"use server";

import { testAI } from "@/lib/ai";
export async function testGeminiAction() {
    const response = await testAI();
    return response;
}