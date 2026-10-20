"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Clock, LoaderCircle, Sparkles, Star, Trophy } from "lucide-react";
import { NOMINATION_TIMEOUT_MS, type SessionState } from "@/socket/types";

interface RestaurantVotingPhaseProps {
    state: SessionState;
    memberId: string;
    isHost: boolean;
    connected: boolean;
    pending: boolean;
    onVote: (restaurantId: string) => void;
    onRetry: () => void;
    onClose: (restaurantId: string | undefined, allowPartial: boolean) => void;
}

function MatchingRestaurants({ state, isHost, connected, pending, onRetry }: Pick<RestaurantVotingPhaseProps, "state" | "isHost" | "connected" | "pending" | "onRetry">) {
    const [expired, setExpired] = useState(false);
    useEffect(() => {
        if (state.nominationStatus !== "GENERATING" || !state.nominationStartedAt) return;
        const remaining = new Date(state.nominationStartedAt).getTime() + NOMINATION_TIMEOUT_MS - Date.now();
        const timer = setTimeout(() => setExpired(true), Math.max(0, remaining));
        return () => clearTimeout(timer);
    }, [state.nominationStatus, state.nominationStartedAt]);
    const loading = state.nominationStatus === "GENERATING" && !expired;

    return <section className="rounded-2xl border border-orange-100 bg-white p-7 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">{loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}</div>
        <h2 className="mt-5 text-2xl font-bold text-gray-950">{loading ? "Finding your group’s food match…" : "Let’s find your restaurants."}</h2>
        <p role="status" className="mt-3 text-sm leading-6 text-gray-600">{loading ? "We’re bringing everyone’s cravings together to find 3–4 places worth voting for." : state.nominationError || (expired ? "Matching is taking longer than expected. The host can try again." : "Your cravings are saved. The host can start restaurant matching.")}</p>
        <ul className="mt-5 space-y-2">{state.prompts.map((prompt) => <li key={prompt.memberId} className="rounded-xl bg-orange-50 p-3 text-sm text-gray-700"><span className="font-semibold">{prompt.displayName}:</span> {prompt.prompt}</li>)}</ul>
        {!loading && isHost && <button type="button" onClick={onRetry} disabled={!connected || pending} className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Starting…" : state.nominationStatus === "IDLE" ? "Find Restaurants" : "Try matching again"}</button>}
        {!loading && !isHost && <p className="mt-4 text-sm text-gray-500">Waiting for the host to find restaurants.</p>}
    </section>;
}

export default function RestaurantVotingPhase({ state, memberId, isHost, connected, pending, onVote, onRetry, onClose }: RestaurantVotingPhaseProps) {
    const [tieChoice, setTieChoice] = useState("");
    const [allowPartial, setAllowPartial] = useState(false);
    const totalVotes = Object.values(state.restaurantVotes).reduce((total, vote) => total + vote.count, 0);
    const highestCount = Math.max(0, ...Object.values(state.restaurantVotes).map((vote) => vote.count));
    const leaders = highestCount ? state.restaurantNominees.filter((nominee) => state.restaurantVotes[nominee.restaurantId]?.count === highestCount) : [];
    const winnerId = leaders.length === 1 ? leaders[0].restaurantId : leaders.some((nominee) => nominee.restaurantId === tieChoice) ? tieChoice : undefined;
    const winner = state.restaurantNominees.find((nominee) => nominee.restaurantId === state.selectedRestaurantId);
    const open = state.phase === "RESTAURANT_VOTING" && state.status === "ACTIVE";
    const members = new Map(state.members.map((member) => [member.memberId, member]));

    if (state.nominationStatus !== "READY") {
        return <MatchingRestaurants key={state.nominationStartedAt ?? state.nominationStatus} state={state} isHost={isHost && open} connected={connected} pending={pending} onRetry={onRetry} />;
    }

    return <section className="space-y-5">
        {winner ? <div role="status" className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6 text-center shadow-sm">
            <Trophy size={36} className="mx-auto text-amber-500 motion-safe:animate-bounce" aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-emerald-700">Decision made!</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">The group picked {winner.name}!</h2>
            <p className="mt-2 text-sm text-gray-600">Your restaurant is locked in. Dish selection is next.</p>
        </div> : <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">Round 2 · Restaurants</span>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">Where should we eat?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">These places were matched to your group’s cravings. Pick your favourite; you can switch until the host closes voting.</p>
            <p role="status" aria-live="polite" className="mt-4 text-sm font-semibold text-orange-700">{totalVotes}/{state.members.length} members voted</p>
        </div>}

        <div className="grid gap-4 sm:grid-cols-2">
            {state.restaurantNominees.map((nominee) => {
                const vote = state.restaurantVotes[nominee.restaurantId] ?? { count: 0, memberIds: [] };
                const percentage = totalVotes ? Math.round(vote.count / totalVotes * 100) : 0;
                const selected = vote.memberIds.includes(memberId);
                const won = nominee.restaurantId === state.selectedRestaurantId;
                const leading = open && highestCount > 0 && vote.count === highestCount;
                return <article key={nominee.restaurantId} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${won ? "border-emerald-500 ring-2 ring-emerald-100" : selected ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"}`}>
                    <div className="relative h-36 bg-gray-100">
                        <Image src={nominee.image} alt={nominee.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 350px" />
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-900"><Star size={12} className="text-amber-500" fill="currentColor" />{nominee.rating}</span>
                        {(won || leading) && <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${won ? "bg-emerald-600" : "bg-orange-600"}`}>{won ? "Winner" : leaders.length > 1 ? "Tied lead" : "Leading"}</span>}
                    </div>
                    <div className="space-y-3 p-4">
                        <div><h3 className="font-bold leading-6 text-gray-950">{nominee.name}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{nominee.cuisines.join(" · ")}</p></div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600"><span className="flex items-center gap-1"><Clock size={13} />{nominee.deliveryTime}</span><span>{nominee.costForTwo}</span></div>
                        <div className="rounded-xl bg-orange-50 p-3"><p className="flex items-center gap-1 text-xs font-semibold text-orange-800"><Sparkles size={13} />Why this restaurant</p><p className="mt-1 text-xs leading-5 text-orange-900">{nominee.matchReason}</p></div>
                        <div><div className="mb-2 flex justify-between text-xs text-gray-600"><span>{vote.count} {vote.count === 1 ? "vote" : "votes"}</span><span>{percentage}%</span></div><div role="progressbar" aria-label={`Votes for ${nominee.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full transition-all ${won ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${percentage}%` }} /></div></div>
                        {vote.memberIds.length > 0 && <div className="flex flex-wrap gap-1.5" aria-label="Members voting for this restaurant">{vote.memberIds.map((voterId) => {
                            const name = members.get(voterId)?.displayName ?? "Member";
                            const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                            return <span key={voterId} title={name} aria-label={name} className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-800">{initials}</span>;
                        })}</div>}
                        {open && <button type="button" onClick={() => onVote(nominee.restaurantId)} disabled={!connected || pending || selected} aria-pressed={selected} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "bg-orange-100 text-orange-800" : "bg-orange-600 text-white hover:bg-orange-700"}`}>{selected && <Check size={16} />}{selected ? "Your vote" : pending ? "Please wait…" : "Vote for this restaurant"}</button>}
                    </div>
                </article>;
            })}
        </div>

        {open && isHost && <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            {leaders.length > 1 && <fieldset><legend className="text-sm font-semibold text-gray-900">It’s a tie. Choose one of the leading restaurants.</legend><div className="mt-3 space-y-2">{leaders.map((nominee) => <label key={nominee.restaurantId} className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"><input type="radio" name="restaurant-tie-winner" value={nominee.restaurantId} checked={winnerId === nominee.restaurantId} onChange={() => setTieChoice(nominee.restaurantId)} disabled={pending} className="accent-orange-600" />{nominee.name}</label>)}</div></fieldset>}
            {totalVotes < state.members.length && <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-gray-600"><input type="checkbox" checked={allowPartial} onChange={(event) => setAllowPartial(event.target.checked)} disabled={pending} className="mt-1 accent-orange-600" />Close with the current votes, even if some members haven’t voted.</label>}
            <button type="button" onClick={() => onClose(winnerId, allowPartial)} disabled={!connected || pending || !winnerId || (!allowPartial && totalVotes < state.members.length)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"><Trophy size={18} />{pending ? "Locking in…" : "Close voting & lock restaurant"}</button>
            {!totalVotes && <p className="text-center text-xs text-gray-500">At least one vote is needed to choose a winner.</p>}
        </div>}
        {open && !isHost && <p className="text-center text-sm text-gray-500">The host will close voting and reveal the group’s restaurant.</p>}
    </section>;
}
