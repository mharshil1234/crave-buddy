import { Play, Users } from "lucide-react";
import type { SessionMember } from "@/socket/types";

interface LobbyPhaseProps {
    members: SessionMember[];
    onlineMemberIds: Set<string>;
    hostId: string;
    currentUserId: string;
    connected: boolean;
    pending: boolean;
    onStart: () => void;
}

const steps = [
    ["Cravings", "Tell the group what sounds good."],
    ["Vote Restaurant", "Find a place everyone can enjoy."],
    ["Pick Dishes", "Build your shared order together."],
    ["Done!", "Take the agreed order to your cart."],
];

export default function LobbyPhase({ members, onlineMemberIds, hostId, currentUserId, connected, pending, onStart }: LobbyPhaseProps) {
    const isHost = hostId === currentUserId;

    return (
        <section className="space-y-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
            <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">Your table is gathering</span>
                <h2 className="mt-2 text-2xl font-bold text-gray-950">Good food starts with everyone.</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">Share your cravings, make a group decision, and skip the endless “what should we eat?”</p>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
                {steps.map(([title, description], index) => (
                    <li key={title} className="flex gap-3 rounded-xl bg-orange-50 p-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">{index + 1}</span>
                        <div><p className="font-semibold text-gray-900">{title}</p><p className="mt-1 text-xs leading-5 text-gray-600">{description}</p></div>
                    </li>
                ))}
            </ol>

            <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Users size={18} /> At the table <span className="text-sm font-normal text-gray-500">({onlineMemberIds.size}/{members.length} online)</span></h3>
                <ul className="space-y-2">
                    {members.map((member) => {
                        const online = onlineMemberIds.has(member.memberId);
                        return (
                            <li key={member.memberId} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
                                <div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900">{member.displayName} {member.userId === currentUserId && <span className="font-normal text-gray-500">(You)</span>}</p>{member.userId === hostId && <span className="text-xs text-orange-600">Host</span>}</div>
                                <span className={`flex shrink-0 items-center gap-2 text-xs ${online ? "text-emerald-700" : "text-gray-400"}`}><span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-gray-300"}`} />{online ? "Online" : "Offline"}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {isHost ? (
                <button type="button" onClick={onStart} disabled={!connected || pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"><Play size={18} />{pending ? "Starting…" : "Start Cravings Round"}</button>
            ) : (
                <p className="rounded-xl bg-blue-50 px-4 py-4 text-center text-sm leading-6 text-blue-800">Waiting for host to start the session… Get your cravings ready!</p>
            )}
        </section>
    );
}
