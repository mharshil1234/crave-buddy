"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { LoaderModal } from "./LoaderModal";

export function JoinMoodRoomForm() {
    const router = useRouter();
    const { data: session } = useSession();

    const [inviteCode, setInviteCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const finalDisplayName = displayName.trim() || session?.user?.name?.split(" ")[0] || "";

        if (!session?.user?.id) {
            toast.error("Please sign in to join a room");
            router.push(`/signin?callbackUrl=${encodeURIComponent("/mood-room/join")}`);
            return;
        }

        if (!inviteCode.trim() || !finalDisplayName) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/mood-room/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inviteCode: inviteCode.trim().toUpperCase(),
                    userId: session.user.id,
                    displayName: finalDisplayName,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || "Failed to join room");
                return;
            }

            toast.success("Joined room successfully!");
            router.push(`/mood-room/${data.room.roomId}`);
        } catch (error) {
            console.error("Error joining room:", error);
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
            <div className="mb-24 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                        Join a Mood Room
                    </h1>
                    <p className="mt-2 text-neutral-500">
                        Enter the code your host shared.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="inviteCode"
                            className="block text-sm font-semibold text-neutral-700"
                        >
                            Invite Code
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            placeholder="e.g. F7K2M9QX"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="mt-1.5 block w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm uppercase tracking-widest outline-none ring-2 ring-transparent transition focus:border-transparent focus:ring-[#ff5200]"
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
                            placeholder={session?.user?.name?.split(" ")[0] || "How others see you"}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-transparent focus:ring-[#ff5200]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#ff5200] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {loading ? "Joining..." : "Join Room"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => router.push("/mood-room/create")}
                    className="mt-5 w-full text-center text-sm font-semibold text-[#ff5200] transition hover:text-orange-700"
                >
                    Need a new room? Create one
                </button>
            </div>

            <LoaderModal isLoading={loading} />
        </div>
    );
}
