import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { MoodPromptForm } from "./MoodBoard/MoodPromptForm";

export function HomeHero() {
    return (
        <section className="relative overflow-hidden bg-brand text-white">
            {/* Soft decorative glows */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-orange-300/40 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-red-600/40 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-100">Food that matches your mood</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                        Not sure what to eat? Just tell us how you feel.
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-orange-50/90">
                        Describe your craving and we&apos;ll pull together dishes from nearby restaurants that fit.
                    </p>
                    <div className="mt-8 max-w-2xl">
                        <MoodPromptForm variant="hero" />
                    </div>
                </div>

                <Link
                    href="/mood-room/create"
                    className="group rounded-3xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/15"
                >
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-brand">
                        <Users size={24} aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-xl font-extrabold">Ordering with friends?</h2>
                    <p className="mt-2 text-sm text-orange-50/90">
                        Open a Mood Room, share the invite code, and vote together on a restaurant and dishes.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
                        Start a Mood Room
                        <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </section>
    );
}
