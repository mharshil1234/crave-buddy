"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Clock, LockKeyhole, Minus, Plus, Star } from "lucide-react";
import type { MenuItem } from "@/types/restaurant";
import type { SessionState } from "@/socket/types";

type RestaurantMenu = {
    name: string;
    restaurantImg: string;
    location: string;
    cuisines: string[];
    rating: number;
    priceForTwo: number;
    deliveryTime: string;
    menu: MenuItem[];
};

interface ItemVotingPhaseProps {
    roomId: string;
    state: SessionState;
    memberId: string;
    isHost: boolean;
    connected: boolean;
    pending: boolean;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onLock: () => void;
    onFinalize: () => void;
}

export default function ItemVotingPhase({ roomId, state, memberId, isHost, connected, pending, onQuantityChange, onLock, onFinalize }: ItemVotingPhaseProps) {
    const [restaurant, setRestaurant] = useState<RestaurantMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const locked = Boolean(state.itemVotingLockedAt) || state.status === "ENDED";

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch(`/api/mood-room/${roomId}/session/${state.sessionId}/vote/item`, { signal: controller.signal, cache: "no-store" })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || "Could not load the restaurant menu");
                setRestaurant(data.restaurant as RestaurantMenu);
                setLoadError(null);
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Could not load the restaurant menu");
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [roomId, state.sessionId, state.selectedRestaurantId]);

    const categories = useMemo(() => {
        const grouped = new Map<string, MenuItem[]>();
        for (const item of restaurant?.menu ?? []) grouped.set(item.category || "Menu", [...(grouped.get(item.category || "Menu") ?? []), item]);
        return [...grouped.entries()];
    }, [restaurant]);

    const tray = (restaurant?.menu ?? []).flatMap((item) => {
        const tally = state.itemVotes[item.id];
        return tally?.quantity ? [{ item, tally }] : [];
    });
    const total = tray.reduce((sum, { item, tally }) => sum + item.price * tally.quantity, 0);
    const hasItems = tray.length > 0;

    if (loading) return <section role="status" className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">Loading the winning restaurant’s menu…</section>;
    if (loadError || !restaurant) return <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError || "The restaurant menu is unavailable."}</section>;

    return <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="relative h-40 bg-orange-50">
                <Image src={restaurant.restaurantImg.startsWith("http") ? restaurant.restaurantImg : `https://media-assets.swiggy.com/swiggy/image/upload/${restaurant.restaurantImg}`} alt={restaurant.name} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider">The group picked</span>
                    <h2 className="mt-1 text-2xl font-bold">{restaurant.name}</h2>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1"><Star size={15} className="text-amber-500" fill="currentColor" />{restaurant.rating}</span>
                <span className="inline-flex items-center gap-1"><Clock size={15} />{restaurant.deliveryTime}</span>
                <span>{restaurant.cuisines.join(" · ")}</span>
            </div>
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
                {categories.map(([category, items]) => <section key={category} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">{category}</h3>
                    <div className="divide-y divide-gray-100">{items.map((item) => {
                        const tally = state.itemVotes[item.id];
                        const ownQuantity = tally?.quantities[memberId] ?? 0;
                        return <article key={item.id} className="flex items-center justify-between gap-4 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                    <Image src={item.img.startsWith("https://media-assets.swiggy.com/") ? item.img : "/restaurant.jpeg"} alt="" fill sizes="80px" className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                <div className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 border-2 ${item.veg ? "border-green-600" : "border-red-600"}`}><span className={`m-auto block h-1.5 w-1.5 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} /></span><h4 className="font-semibold text-gray-900">{item.name}</h4></div>
                                <p className="mt-1 text-sm font-semibold text-gray-700">₹{item.price}</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.description}</p>
                                {tally?.quantity ? <p className="mt-2 text-xs text-orange-700">Group tray: {tally.quantity} · {tally.voters.length} {tally.voters.length === 1 ? "member" : "members"}</p> : null}
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 p-1">
                                <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onQuantityChange(item.id, Math.max(0, ownQuantity - 1))} disabled={locked || !connected || pending || ownQuantity === 0} className="rounded p-1 text-orange-700 hover:bg-orange-50 disabled:opacity-40"><Minus size={16} /></button>
                                <span aria-label={`Your quantity: ${ownQuantity}`} className="min-w-5 text-center text-sm font-semibold">{ownQuantity}</span>
                                <button type="button" aria-label={`Add one ${item.name}`} onClick={() => onQuantityChange(item.id, Math.min(20, ownQuantity + 1))} disabled={locked || !connected || pending || ownQuantity >= 20} className="rounded p-1 text-orange-700 hover:bg-orange-50 disabled:opacity-40"><Plus size={16} /></button>
                            </div>
                        </article>;
                    })}</div>
                </section>)}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-6">
                <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-950">Group tray</h3><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">{tray.length} dishes</span></div>
                    <p className="mt-1 text-xs text-gray-500">Shared picks from everyone in the session</p>
                    {tray.length ? <ul className="mt-4 divide-y divide-gray-100">{tray.map(({ item, tally }) => <li key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium text-gray-800">{item.name}</span><span className="mt-1 block text-xs text-gray-500">{tally.quantity} × ₹{item.price} · {tally.voters.length} {tally.voters.length === 1 ? "member" : "members"}</span></span><span className="shrink-0 font-semibold">₹{item.price * tally.quantity}</span></li>)}</ul> : <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">The tray is empty. Add a dish to get started.</p>}
                    <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 font-bold text-gray-950"><span>Estimated subtotal</span><span>₹{total}</span></div>
                    {locked ? <p role="status" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><Check size={17} />Order locked by the host</p>
                        : isHost ? <button type="button" onClick={onLock} disabled={!connected || pending || !hasItems} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"><LockKeyhole size={16} />{pending ? "Locking tray…" : "Lock in order"}</button>
                            : <p className="mt-4 text-center text-xs text-gray-500">The host can lock the order when the group is ready.</p>}
                    {locked && isHost && state.status === "ACTIVE" && <button type="button" onClick={onFinalize} disabled={!connected || pending} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Finalizing…" : "Finalize group order"}</button>}
                </section>
            </aside>
        </div>
    </div>;
}
