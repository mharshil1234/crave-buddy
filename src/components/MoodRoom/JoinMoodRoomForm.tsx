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
        <div className="mood-backdrop flex min-h-dvh items-center justify-center p-6">
            <div className="mb-24 w-full max-w-md card p-8 shadow-xl">
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
                            className="input-field mt-1.5 uppercase tracking-widest"
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
                            className="input-field mt-1.5"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? "Joining..." : "Join Room"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => router.push("/mood-room/create")}
                    className="mt-5 w-full text-center text-sm font-semibold text-brand transition hover:text-brand-hover"
                >
                    Need a new room? Create one
                </button>
            </div>

            <LoaderModal isLoading={loading} />
        </div>
    );
}
