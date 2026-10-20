"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, CircleDot, Users, Wifi, WifiOff } from "lucide-react";
import { createSocket } from "@/lib/socket";
import type { PromptUpdateData, ServerToClientEvents, SessionPresence, SessionState, SessionStateResult, SocketResult } from "@/socket/types";
import ChatBox from "./ChatBox";
import LobbyPhase from "./LobbyPhase";
import PromptCollectionPhase from "./PromptCollectionPhase";
import RestaurantVotingPhase from "./RestaurantVotingPhase";
import ItemVotingPhase from "./ItemVotingPhase";
import FinishedPhase from "./FinishedPhase";

interface SessionPhaseManagerProps {
    roomId: string;
    roomName: string;
    sessionTitle: string;
    initialState: SessionState;
    currentUserId: string;
    memberId: string;
}

export default function SessionPhaseManager({ roomId, roomName, sessionTitle, initialState, currentUserId, memberId }: SessionPhaseManagerProps) {
    const [socket] = useState(() => createSocket());
    const [state, setState] = useState(initialState);
    const [presence, setPresence] = useState<SessionPresence>({ sessionId: initialState.sessionId, count: 0, members: [] });
    const [connected, setConnected] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEndConfirmation, setShowEndConfirmation] = useState(false);
    const sessionId = initialState.sessionId;
    const isHost = state.hostId === currentUserId;
    const onlineMemberIds = new Set(presence.members.map((member) => member.memberId));

    const applyState = useCallback((next: SessionState) => {
        if (next.sessionId !== sessionId) return;
        setState((current) => Date.parse(next.updatedAt) >= Date.parse(current.updatedAt) ? next : current);
    }, [sessionId]);

    useEffect(() => {
        const controller = new AbortController();
        const join = () => {
            socket.timeout(10_000).emit("session:join", { roomId, sessionId }, (cause: Error | null, result: SocketResult) => {
                if (controller.signal.aborted) return;
                if (cause || !result?.ok) {
                    setConnected(false);
                    setError(result && !result.ok ? result.error : "Unable to join this session");
                    return;
                }
                setConnected(true);
                setError(null);
            });
        };
        const disconnected = () => {
            setConnected(false);
            setPresence({ sessionId, count: 0, members: [] });
        };
        const connectionError = (cause: Error) => {
            setConnected(false);
            setError(cause.message === "xhr poll error" ? "Unable to connect to the session. Please check the socket server and try again." : cause.message);
        };
        const updatePresence = (next: SessionPresence) => {
            if (next.sessionId === sessionId) setPresence(next);
        };
        const phaseChanged: ServerToClientEvents["session:phase-changed"] = (next) => applyState(next.state);
        const promptsChanged = (next: PromptUpdateData) => applyState(next);
        socket.on("connect", join);
        socket.on("disconnect", disconnected);
        socket.on("connect_error", connectionError);
        socket.on("chat:users", updatePresence);
        socket.on("session:state", applyState);
        socket.on("session:phase-changed", phaseChanged);
        socket.on("session:prompt-update", promptsChanged);
        socket.on("session:restaurant-vote-update", applyState);
        const itemVotesChanged: ServerToClientEvents["session:item-vote-update"] = (next) => applyState(next.state);
        socket.on("session:item-vote-update", itemVotesChanged);
        socket.connect();
        return () => {
            controller.abort();
            if (socket.connected) socket.emit("session:leave", { roomId, sessionId });
            socket.off("connect", join);
            socket.off("disconnect", disconnected);
            socket.off("connect_error", connectionError);
            socket.off("chat:users", updatePresence);
            socket.off("session:state", applyState);
            socket.off("session:phase-changed", phaseChanged);
            socket.off("session:prompt-update", promptsChanged);
            socket.off("session:restaurant-vote-update", applyState);
            socket.off("session:item-vote-update", itemVotesChanged);
            socket.disconnect();
        };
    }, [socket, roomId, sessionId, applyState]);

    const finishAction = (cause: Error | null, result: SessionStateResult) => {
        setPending(false);
        if (cause || !result?.ok) {
            setError(result && !result.ok ? result.error : "The request could not be confirmed. Please try again.");
            return false;
        }
        applyState(result.state);
        return true;
    };

    const advancePhase = (phase: "PROMPT_COLLECTION" | "RESTAURANT_VOTING" | "ITEM_VOTING", allowPartial = false, restaurantId?: string) => {
        if (!connected || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:advance-phase", { roomId, sessionId, phase, allowPartial, restaurantId }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const submitPrompt = async (prompt: string) => {
        if (!connected || pending) return false;
        setPending(true);
        setError(null);
        return new Promise<boolean>((resolve) => {
            socket.timeout(10_000).emit("session:submit-prompt", { roomId, sessionId, prompt }, (cause: Error | null, result: SessionStateResult) => {
                resolve(finishAction(cause, result));
            });
        });
    };

    const writable = connected && state.status === "ACTIVE";

    const voteRestaurant = (restaurantId: string) => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:vote-restaurant", { roomId, sessionId, restaurantId }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const retryMatching = () => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:nominate-restaurants", { roomId, sessionId }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const voteItem = (itemId: string, quantity: number) => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:vote-item", { roomId, sessionId, itemId, quantity }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const lockItems = () => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:lock-items", { roomId, sessionId }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const finalizeOrder = () => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:finalize", { roomId, sessionId }, (cause: Error | null, result: SessionStateResult) => {
            finishAction(cause, result);
        });
    };

    const endSessionEarly = () => {
        if (!writable || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:end-early", { roomId, sessionId }, (cause: Error | null, result: SessionStateResult) => {
            setShowEndConfirmation(false);
            finishAction(cause, result);
        });
    };


    return (
        <div>
            <header className="mb-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <Link href={`/mood-room/${roomId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition hover:text-orange-900">
                    <ArrowLeft size={16} aria-hidden="true" />Back to {roomName}
                </Link>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Mood Room session</p>
                        <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">{sessionTitle}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700">
                            {state.status === "ENDED" ? <CircleCheck size={15} className={state.result ? "text-emerald-600" : "text-neutral-500"} /> : <CircleDot size={15} className="text-emerald-600" />}
                            {state.status === "ENDED" ? state.result ? "Order complete" : "Ended early" : phaseTitle(state.phase)}
                        </span>
                        {state.status === "ACTIVE" && <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${connected ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}{connected ? "Live" : "Reconnecting"}
                        </span>}
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800"><Users size={14} />{state.members.length} {state.members.length === 1 ? "member" : "members"}</span>
                    </div>
                </div>
            </header>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)] lg:gap-6">
            <div className="min-w-0 space-y-4">
                {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                {isHost && state.status === "ACTIVE" && <div className="flex justify-end"><button type="button" onClick={() => setShowEndConfirmation(true)} disabled={!connected || pending} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">End session</button></div>}
                {state.phase === "LOBBY" ? <LobbyPhase members={state.members} onlineMemberIds={onlineMemberIds} hostId={state.hostId} currentUserId={currentUserId} connected={writable} pending={pending} onStart={() => advancePhase("PROMPT_COLLECTION")} />
                    : state.phase === "PROMPT_COLLECTION" ? <PromptCollectionPhase state={state} memberId={memberId} isHost={isHost} connected={writable} pending={pending} onlineMemberIds={onlineMemberIds} onSubmit={submitPrompt} onProceed={(allowPartial) => advancePhase("RESTAURANT_VOTING", allowPartial)} />
                        : state.phase === "RESTAURANT_VOTING" ? <RestaurantVotingPhase state={state} memberId={memberId} isHost={isHost} connected={writable} pending={pending} onVote={voteRestaurant} onRetry={retryMatching} onClose={(restaurantId, allowPartial) => advancePhase("ITEM_VOTING", allowPartial, restaurantId)} />
                            : state.phase === "ITEM_VOTING" ? <ItemVotingPhase roomId={roomId} state={state} memberId={memberId} isHost={isHost} connected={writable} pending={pending} onQuantityChange={voteItem} onLock={lockItems} onFinalize={finalizeOrder} />
                                : <FinishedPhase roomId={roomId} sessionId={sessionId} result={state.result} isHost={isHost} />}
            </div>
            <details open className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
                <summary className="cursor-pointer px-2 pb-3 pt-1 text-sm font-semibold text-gray-700">Session conversation</summary>
                <ChatBox sessionId={sessionId} roomId={roomId} memberId={memberId} memberCount={state.members.length} activeUsers={presence.count} socket={socket} connected={connected} readOnly={state.status === "ENDED"} />
            </details>
            {showEndConfirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
                <section role="alertdialog" aria-modal="true" aria-labelledby="end-session-title" aria-describedby="end-session-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <h2 id="end-session-title" className="text-lg font-bold text-gray-950">End this session?</h2>
                    <p id="end-session-description" className="mt-2 text-sm leading-6 text-gray-600">This ends the session for everyone immediately. Any current votes remain saved, but no final order will be created.</p>
                    <div className="mt-5 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowEndConfirmation(false)} disabled={pending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Keep session open</button>
                        <button type="button" onClick={endSessionEarly} disabled={pending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{pending ? "Ending…" : "End for everyone"}</button>
                    </div>
                </section>
            </div>}
            </div>
        </div>
    );
}

function phaseTitle(phase: SessionState["phase"]) {
    const titles: Record<SessionState["phase"], string> = {
        LOBBY: "Waiting in lobby",
        PROMPT_COLLECTION: "Collecting cravings",
        RESTAURANT_VOTING: "Voting on restaurants",
        ITEM_VOTING: "Building the group order",
        FINISHED: "Finished",
    };
    return titles[phase];
}
