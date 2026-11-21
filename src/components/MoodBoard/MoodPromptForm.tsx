"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoaderModal } from "./LoaderModal";

const SUGGESTIONS = ["Something spicy", "Comfort food", "Light & healthy", "Late-night snack"];

type MoodPromptFormProps = {
    /** "hero" sits on the orange home banner; "card" sits inside a white card. */
    variant?: "card" | "hero";
};

export function MoodPromptForm({ variant = "card" }: MoodPromptFormProps) {
    const router = useRouter();
    const inputId = useId();

    const [query, setQuery] = useState("");
    const [isVeg, setIsVeg] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) {
            toast.error("Tell us what you're in the mood for");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(
                `/api/mood-board/create?lat=0&lng=0&isVeg=${isVeg}&query=${encodeURIComponent(query.trim())}`,
                { method: "POST", headers: { "Content-Type": "application/json" } },
            );
            const data = (await response.json()) as { id?: string; error?: string };

            if (!response.ok || !data.id) {
                toast.error(data.error ?? "Failed to create Mood Board");
                return;
            }

            router.push(`/mood-board/${data.id}`);
        } catch (error) {
            console.error("Error fetching mood board: ", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const onHero = variant === "hero";

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <label htmlFor={inputId} className="sr-only">
                What do you feel like eating?
            </label>
            <div className={`flex flex-col gap-2 sm:flex-row ${onHero ? "rounded-2xl bg-white p-2 shadow-xl shadow-orange-950/20" : ""}`}>
                <input
                    id={inputId}
                    type="text"
                    maxLength={200}
                    placeholder="e.g. something spicy and cheesy"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={onHero ? "min-w-0 flex-1 rounded-xl px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-400" : "input-field flex-1 text-base"}
                />
                <button type="submit" disabled={loading} className="btn btn-primary shrink-0">
                    <Sparkles size={16} aria-hidden="true" />
                    {loading ? "Thinking..." : "Find food"}
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <label
                    className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition has-[:focus-visible]:ring-2 ${onHero
                        ? isVeg
                            ? "bg-white text-green-700 has-[:focus-visible]:ring-white"
                            : "bg-white/15 text-white hover:bg-white/25 has-[:focus-visible]:ring-white"
                        : isVeg
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200 has-[:focus-visible]:ring-green-500"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 has-[:focus-visible]:ring-brand"
                        }`}
                >
                    <input
                        type="checkbox"
                        checked={isVeg}
                        onChange={(e) => setIsVeg(e.target.checked)}
                        className="sr-only"
                    />
                    <Leaf size={14} aria-hidden="true" className={isVeg ? "fill-green-600 text-green-600" : ""} />
                    Veg only
                </label>

                {SUGGESTIONS.map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition ${onHero
                            ? "bg-white/10 text-orange-50 ring-1 ring-white/25 hover:bg-white/20"
                            : "bg-brand-soft text-brand-ink hover:bg-orange-100"
                            }`}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            <LoaderModal isLoading={loading} />
        </form>
    );
}
