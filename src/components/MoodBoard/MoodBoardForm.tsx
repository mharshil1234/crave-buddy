import { Compass } from "lucide-react";
import { MoodPromptForm } from "./MoodPromptForm";

export function MoodBoardForm() {
    return (
        <div className="mood-backdrop flex min-h-dvh items-center justify-center px-4 py-10">
            <div className="card mb-24 w-full max-w-xl p-6 shadow-xl sm:p-8">
                <div className="mb-6 text-center">
                    <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                        <Compass size={24} aria-hidden="true" />
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">What do you feel like?</h1>
                    <p className="mt-2 text-neutral-500">
                        Describe your mood or craving and we&apos;ll build a board of dishes to match.
                    </p>
                </div>
                <MoodPromptForm />
            </div>
        </div>
    );
}
