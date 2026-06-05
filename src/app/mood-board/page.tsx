"use client";

import { useEffect } from "react"
import { testGeminiAction } from "./actions";

export default function MoodBoard() {

    const testGemini = async () => {
        const response = await testGeminiAction();
        console.log("Gemini Response:", response);
    };

    useEffect(() => {
        testGemini();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold">Your Mood Board</h1>
            <p className="mt-2 text-gray-600">This is where your saved restaurants will appear.</p>
        </div>
    )
}