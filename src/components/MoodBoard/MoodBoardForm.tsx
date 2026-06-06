"use client";

import { useState } from "react";
import { LoaderModal } from "./LoaderModal";

export function MoodBoardForm() {

    const [query, setQuery] = useState("");
    const [isVeg, setIsVeg] = useState(false);
    const [loading, setLoading] = useState(false);

    const [restaurants, setRestaurants] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/mood-board?lat=0&lng=0&isVeg=${isVeg}&query=${encodeURIComponent(query)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
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
            <div className="shadow-xl rounded-4xl p-8 w-150 flex justify-center items-center flex-col gap-4 bg-white mb-50">
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
                        className="w-100 h-10 text-xl p-5 rounded-xl text-center border border-black focus:outline-none ring-2 ring-transparent focus:ring-[#ff5200] focus:border-transparent"
                    />
                    <div className="flex items-center gap-2 justify-center mt-2">
                        {!isVeg && (
                            <div
                                className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-xl hover:cursor-pointer"
                                onClick={() => setIsVeg(!isVeg)}
                            >
                                <div className="h-4.5 w-4.5 border rounded-full" />
                                <label className="leading-none text-lg font-bold">Veg Only</label>
                            </div>
                        )}
                        {isVeg && (
                            <div
                                className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-xl hover:cursor-pointer"
                                onClick={() => setIsVeg(!isVeg)}
                            >
                                
                                <label className="leading-none font-bold text-green-500 text-lg hover:cursor-pointer">Veg Only</label>
                            </div>
                        )}

                    </div>
                    <div className="flex items-center justify-center mt-2">
                        <button
                            type="submit"
                            className="border p-3 text-xl rounded-xl border-[#ff5200] text-[#ff5200] ring-2 ring-transparent hover:ring-[#ff5200] hover:border-transparent hover:cursor-pointer"
                        >
                            Generate
                        </button>
                    </div>
                    {<LoaderModal isLoading={loading} />}
                </form>
            </div >
        </div >
    )
}