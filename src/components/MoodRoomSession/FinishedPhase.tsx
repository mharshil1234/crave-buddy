"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import type { SessionResultData } from "@/socket/types";

export default function FinishedPhase({ roomId, sessionId, result, isHost }: { roomId: string; sessionId: string; result: SessionResultData | null; isHost: boolean }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addToCart = async () => {
        setPending(true);
        setError(null);
        try {
            const response = await fetch(`/api/mood-room/${roomId}/session/${sessionId}/cart`, { method: "POST" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not add this order to your cart");
            toast.success("Group order added to your cart");
            router.push("/cart");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not add this order to your cart");
        } finally {
            setPending(false);
        }
    };

    if (!result) return <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">The saved order summary is unavailable. Refresh this session to try again.</section>;

    return <section className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-7 text-center shadow-sm">
            <Sparkles size={34} className="mx-auto text-orange-500 motion-safe:animate-pulse" aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Mood Room order complete</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">Decision reached!</h2>
            <p className="mt-2 text-sm text-gray-600">Your group’s order is ready to add to your personal cart.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-44 bg-gray-100">
                <Image src={result.restaurantImage} alt={result.restaurantName} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 text-white">
                    <p className="flex items-center gap-1 text-sm"><Star size={15} fill="currentColor" className="text-amber-300" />{result.rating} · {result.deliveryTime}</p>
                    <h3 className="mt-1 text-2xl font-bold">{result.restaurantName}</h3>
                </div>
            </div>
            <div className="p-5 sm:p-7">
                <p className="text-sm text-gray-500">{result.cuisines.join(" · ")} · {result.location}</p>
                <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-gray-700">Group order receipt</h4>
                <ul className="mt-2 divide-y divide-gray-100">{result.items.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                    <span className="min-w-0"><span className="block font-semibold text-gray-900">{item.name}</span><span className="mt-1 block text-xs text-gray-500">{item.quantity} × ₹{item.price}</span></span>
                    <span className="shrink-0 font-semibold text-gray-900">₹{item.quantity * item.price}</span>
                </li>)}</ul>
                <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-950"><span>Estimated total</span><span>₹{result.totalAmount}</span></div>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="button" onClick={addToCart} disabled={pending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><ShoppingCart size={18} />{pending ? "Adding order…" : "Add to My Cart"}</button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500"><Check size={14} />Adds the agreed quantities to your personal cart.</p>
                {isHost && <button type="button" onClick={() => router.push(`/mood-room/${roomId}`)} className="mt-4 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">Start another session</button>}
            </div>
        </div>
    </section>;
}
