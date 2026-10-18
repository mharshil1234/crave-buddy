"use client";

import { useCallback, useEffect, useState } from "react";
import { createSocket } from "@/lib/socket";
import type { PromptUpdateData, ServerToClientEvents, SessionPresence, SessionState, SessionStateResult, SocketResult } from "@/socket/types";
import ChatBox from "./ChatBox";
import LobbyPhase from "./LobbyPhase";
import PromptCollectionPhase from "./PromptCollectionPhase";

interface SessionPhaseManagerProps {
    roomId: string;
    initialState: SessionState;
    currentUserId: string;
    memberId: string;
}

export default function SessionPhaseManager({ roomId, initialState, currentUserId, memberId }: SessionPhaseManagerProps) {
    const [socket] = useState(() => createSocket());
    const [state, setState] = useState(initialState);
    const [presence, setPresence] = useState<SessionPresence>({ sessionId: initialState.sessionId, count: 0, members: [] });
    const [connected, setConnected] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const advancePhase = (phase: "PROMPT_COLLECTION" | "RESTAURANT_VOTING", allowPartial = false) => {
        if (!connected || pending) return;
        setPending(true);
        setError(null);
        socket.timeout(10_000).emit("session:advance-phase", { roomId, sessionId, phase, allowPartial }, (cause: Error | null, result: SessionStateResult) => {
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

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="min-w-0 space-y-4">
                {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                {state.phase === "LOBBY" ? <LobbyPhase members={state.members} onlineMemberIds={onlineMemberIds} hostId={state.hostId} currentUserId={currentUserId} connected={writable} pending={pending} onStart={() => advancePhase("PROMPT_COLLECTION")} />
                    : state.phase === "PROMPT_COLLECTION" ? <PromptCollectionPhase state={state} memberId={memberId} isHost={isHost} connected={writable} pending={pending} onlineMemberIds={onlineMemberIds} onSubmit={submitPrompt} onProceed={(allowPartial) => advancePhase("RESTAURANT_VOTING", allowPartial)} />
                        : <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-7 shadow-sm"><span className="text-xs font-semibold uppercase tracking-widest text-orange-600">{state.status === "ENDED" ? "Session ended" : "Cravings collected"}</span><h2 className="text-2xl font-bold text-gray-950">{state.phase === "RESTAURANT_VOTING" ? "Your group’s cravings are ready." : "Your group session"}</h2><p className="text-sm leading-6 text-gray-600">{state.phase === "RESTAURANT_VOTING" ? "Restaurant suggestions aren’t available yet. Your group’s cravings are saved below." : "Your saved cravings and conversation are available here."}</p><ul className="space-y-3">{state.prompts.map((prompt) => <li key={prompt.memberId} className="rounded-xl bg-orange-50 p-4"><p className="text-sm font-semibold text-gray-900">{prompt.displayName}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">{prompt.prompt}</p></li>)}</ul></section>}
            </div>
            <details open className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
                <summary className="cursor-pointer px-2 pb-3 pt-1 text-sm font-semibold text-gray-700">Session conversation</summary>
                <ChatBox sessionId={sessionId} roomId={roomId} memberId={memberId} memberCount={state.members.length} activeUsers={presence.count} socket={socket} connected={connected} readOnly={state.status === "ENDED"} />
            </details>
        </div>
    );
}
