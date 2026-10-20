"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { MAX_CRAVING_LENGTH, type SessionState } from "@/socket/types";

interface PromptCollectionPhaseProps {
    state: SessionState;
    memberId: string;
    isHost: boolean;
    connected: boolean;
    pending: boolean;
    onlineMemberIds: Set<string>;
    onSubmit: (prompt: string) => Promise<boolean>;
    onProceed: (allowPartial: boolean) => void;
}

const moodChips = ["Spicy & bold", "Warm comfort food", "Healthy & fresh", "Late night sweet tooth"];

export default function PromptCollectionPhase({ state, memberId, isHost, connected, pending, onlineMemberIds, onSubmit, onProceed }: PromptCollectionPhaseProps) {
    const [draft, setDraft] = useState<string | null>(null);
    const [allowPartial, setAllowPartial] = useState(false);
    const ownPrompt = state.prompts.find((prompt) => prompt.memberId === memberId);
    const value = draft ?? ownPrompt?.prompt ?? "";
    const allReady = state.prompts.length >= state.members.length;
    const submitted = new Map(state.prompts.map((prompt) => [prompt.memberId, prompt]));

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">Round 1 · Cravings</span>
                <h2 className="mt-2 text-2xl font-bold text-gray-950">What are you craving?</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">Tell us about flavours, cuisines, dietary needs, or your budget. Everyone’s cravings help shape the group’s choices.</p>
                <form className="mt-5 space-y-4" onSubmit={async (event) => {
                    event.preventDefault();
                    if (await onSubmit(value.trim())) setDraft(null);
                }}>
                    <label htmlFor="craving-prompt" className="block text-sm font-medium text-gray-800">Your craving</label>
                    <textarea id="craving-prompt" value={value} onChange={(event) => setDraft(event.target.value)} maxLength={MAX_CRAVING_LENGTH} rows={4} disabled={pending || !connected} placeholder="Something spicy, a vegetarian option, and maybe a little dessert…" className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60" />
                    <div className="flex flex-wrap gap-2">
                        {moodChips.map((chip) => <button key={chip} type="button" aria-pressed={value === chip} disabled={pending || !connected} onClick={() => setDraft(chip)} className={`rounded-full border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${value === chip ? "border-orange-500 bg-orange-100 text-orange-800" : "border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50"}`}>{chip}</button>)}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-gray-400">{value.length}/{MAX_CRAVING_LENGTH}</span>
                        <button type="submit" disabled={!connected || pending || !value.trim() || value.trim() === ownPrompt?.prompt} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Saving…" : ownPrompt ? "Update craving" : "Share my craving"}</button>
                    </div>
                    {ownPrompt && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700"><Check size={16} />Your craving is saved. You can edit it until the host moves on.</p>}
                </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">Everyone’s cravings</h3><span role="status" aria-live="polite" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{state.prompts.length}/{state.members.length} members ready</span></div>
                <div role="progressbar" aria-label="Craving submissions" aria-valuenow={state.prompts.length} aria-valuemin={0} aria-valuemax={state.members.length} className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${state.members.length ? state.prompts.length / state.members.length * 100 : 0}%` }} /></div>
                <ul className="mt-5 space-y-3">
                    {state.members.map((member) => {
                        const prompt = submitted.get(member.memberId);
                        return <li key={member.memberId} className={`rounded-xl border p-4 ${prompt ? "border-emerald-100 bg-emerald-50/40" : "border-gray-100"}`}>
                            <div className="flex items-center justify-between gap-3"><p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800"><span className={`h-2 w-2 shrink-0 rounded-full ${onlineMemberIds.has(member.memberId) ? "bg-emerald-500" : "bg-gray-300"}`} /><span className="truncate">{member.displayName}{member.memberId === memberId ? " (You)" : ""}</span></p>{prompt ? <Check size={17} className="shrink-0 text-emerald-600" aria-label="Submitted" /> : <Clock size={17} className="shrink-0 text-gray-400" aria-label="Waiting" />}</div>
                            <p className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 ${prompt ? "text-gray-700" : "text-gray-400"}`}>{prompt?.prompt || "Getting their craving ready…"}</p>
                        </li>;
                    })}
                </ul>
                {isHost ? <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                    {!allReady && <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-gray-600"><input type="checkbox" checked={allowPartial} onChange={(event) => setAllowPartial(event.target.checked)} disabled={pending} className="mt-1 accent-orange-600" />Continue with the submitted cravings, even if some members aren’t ready.</label>}
                    <button type="button" onClick={() => onProceed(allowPartial)} disabled={!connected || pending || state.prompts.length === 0 || (!allReady && !allowPartial)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Please wait…" : "Find Restaurants"}</button>
                    {state.prompts.length === 0 && <p className="text-center text-xs text-gray-500">At least one craving is needed to continue.</p>}
                </div> : <p className="mt-5 text-center text-sm text-gray-500">The host will continue when the group is ready.</p>}
            </div>
        </section>
    );
}
