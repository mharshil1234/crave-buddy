"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { LoaderModal } from "./LoaderModal";

export function MoodRoomForm() {
    const router = useRouter();
    const { data: session } = useSession();

    const [moodRoomName, setMoodRoomName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.name && !displayName) {
            setDisplayName(session.user.name.split(" ")[0]);
        }
    }, [session?.user?.name]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!session?.user?.id) {
            toast.error("Please sign in to create a room");
            router.push(`/signin?callbackUrl=${encodeURIComponent("/mood-room/create")}`);
            return;
        }

        if (!moodRoomName.trim() || !displayName.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/mood-room/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    moodRoomName: moodRoomName.trim(),
                    hostId: session.user.id,
                    displayName: displayName.trim(),
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error("Failed to create room");
                return;
            }

            toast.success("Room created successfully!");
            router.push(`/mood-room/${data.room.roomId}`);
        } catch (error) {
            console.error("Error creating room:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center p-6"
            style={{
                background: "radial-gradient(circle at 15% 20%, #ffd6b8, transparent 50%), radial-gradient(circle at 85% 80%, #c8e2ff, transparent 50%), #fff8f3"
            }}
        >
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl mb-24">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                        Create a Mood Room
                    </h1>
                    <p className="mt-2 text-neutral-500">
                        Vote. Crave. Order.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="moodRoomName"
                            className="block text-sm font-semibold text-neutral-700"
                        >
                            Room Name
                        </label>
                        <input
                            id="moodRoomName"
                            type="text"
                            placeholder="e.g. Friday Night Cravings"
                            value={moodRoomName}
                            onChange={(e) => setMoodRoomName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#ff5200] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="displayName"
                            className="block text-sm font-semibold text-neutral-700"
                        >
                            Your Display Name
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            placeholder="How others see you"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#ff5200] focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-[#ff5200] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Creating..." : "Create Room"}
                    </button>
                </form>
            </div>

            <LoaderModal isLoading={loading} />
        </div>
    );
}
