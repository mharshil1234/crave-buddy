"use client";

import { useState } from "react";
import { LoaderModal } from "./LoaderModal";

export function MoodBoardForm() {

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [restaurants, setRestaurants] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/mood-board?lat=0&lng=0&query=${encodeURIComponent(query)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            setRestaurants(data);
        } catch (error) {
            console.error("Error fetching mood restaurants: ", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="p-4 flex justify-center items-center min-h-screen"
            style={{
                background: "radial-gradient(circle at 15% 20%, #ffd6b8, transparent 50%), radial-gradient(circle at 85% 80%, #c8e2ff, transparent 50%), #fff8f3"
            }}
        >
            <div className="shadow-lg rounded-lg p-8 w-200 flex justify-center items-center flex-col gap-4 bg-white mb-50">
                <h1 className="font-bold text-2xl">What do you feel like?</h1>
                <form
                    className="flex flex-col gap-4 justify-center"
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        placeholder="e.g. something spicy"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-100 h-10 text-xl p-5 rounded-md text-center border border-black focus:outline-none focus:ring-2 focus:ring-[#ff5200] focus:border-0"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                        />
                        <label>Veg Only</label>
                    </div>
                    <button type="submit">Generate</button>

                    {<LoaderModal isLoading={loading} />}
                </form>
            </div>
        </div>
    )
}