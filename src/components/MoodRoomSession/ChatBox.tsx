"use client";

import { useEffect, useRef, useState } from "react";
import { createSocket } from "@/lib/socket";
import { mergeChatMessages } from "@/lib/mood-room-chat";
import { MAX_CHAT_MESSAGE_LENGTH, type ChatMessage, type ChatSendResult, type SessionPresence, type SocketResult } from "@/socket/types";
import { MessageCircle, SendHorizonal } from "lucide-react";

interface ChatBoxProps {
    sessionId: string;
    roomId: string;
    memberCount: number;
    memberId: string;
    readOnly?: boolean;
}

export default function ChatBox({ sessionId, roomId, memberCount, memberId, readOnly = false }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [activeUsers, setActiveUsers] = useState(0);
    const [connected, setConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);

    const messagesRef = useRef<HTMLDivElement | null>(null);
    const trimmedInput = input.trim();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";
    };

    useEffect(() => {
        const socket = createSocket();
        const controller = new AbortController();
        socketRef.current = socket;

        async function fetchMessages() {
            try {
                const res = await fetch(`/api/mood-room/${roomId}/session/${sessionId}/messages`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Unable to load chat history. Reconnect to try again.");
                const data: { messages: ChatMessage[] } = await res.json();
                if (!controller.signal.aborted) {
                    setMessages((current) => mergeChatMessages(current, data.messages));
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError(cause instanceof Error ? cause.message : "Unable to load chat history");
                }
            }
        }

        const joinSession = () => {
            socket.timeout(10_000).emit("session:join", { roomId, sessionId }, (cause: Error | null, result: SocketResult) => {
                if (controller.signal.aborted) return;
                if (cause || !result?.ok) {
                    setConnected(false);
                    setError(result && !result.ok ? result.error : "Unable to join session chat");
                    return;
                }
                setConnected(true);
                setError(null);
                void fetchMessages();
            });
        };
        const handleNewMessage = (message: ChatMessage) => {
            if (message.sessionId === sessionId) {
                setMessages((current) => mergeChatMessages(current, [message]));
            }
        };
        const handleUsers = (presence: SessionPresence) => {
            if (presence.sessionId === sessionId) setActiveUsers(presence.count);
        };

        socket.on("connect", joinSession);
        socket.on("disconnect", () => {
            setConnected(false);
            setActiveUsers(0);
        });
        socket.on("connect_error", (cause) => {
            setConnected(false);
            setError(cause.message);
        });
        socket.on("chat:message", handleNewMessage);
        socket.on("chat:users", handleUsers);
        socket.connect();

        return () => {
            controller.abort();
            if (socket.connected) socket.emit("session:leave", { roomId, sessionId });
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId, sessionId]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        const socket = socketRef.current;
        if (!socket || !connected || !trimmedInput || sending || readOnly) return;
        setSending(true);
        setError(null);
        socket.timeout(10_000).emit("chat:send", { roomId, sessionId, message: trimmedInput }, (cause: Error | null, result: ChatSendResult) => {
            if (socketRef.current !== socket) return;
            setSending(false);
            if (cause || !result?.ok) {
                setError(result && !result.ok ? result.error : "Message could not be confirmed. Reconnect before retrying.");
                return;
            }
            setMessages((current) => mergeChatMessages(current, [result.message]));
            setInput("");
        });
    };

    return (
        <div className="flex h-[32rem] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                        <MessageCircle size={20} aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-950">Session Chat</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`}></div>
                    <span className="text-sm text-gray-600">{connected ? `${activeUsers}/${memberCount} active` : "Connecting..."}</span>
                </div>
            </div>

            <div className="min-h-0 flex-1">
                <div ref={messagesRef} className="no-scrollbar h-full overflow-y-auto bg-slate-50 px-4 py-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="max-w-xs text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm ring-1 ring-gray-200">
                                    <MessageCircle size={22} aria-hidden="true" />
                                </div>
                                <p className="font-medium text-gray-900">No messages yet</p>
                                <p className="mt-1 text-sm text-gray-500">Start the session chat with a craving, vote, or dinner plan.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => {
                                const isSystemMessage = message.type === "join" || message.type === "leave";
                                const isCurrentUser = message.memberId === memberId;
                                const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });

                                if (isSystemMessage) {
                                    return (
                                        <div key={message.id} className="flex justify-center">
                                            <div className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ${
                                                message.type === "join"
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                    : "bg-rose-50 text-rose-700 ring-rose-100"
                                            }`}>
                                                {message.message}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={message.id} className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                                        {!isCurrentUser && (
                                            <div className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
                                                {getInitials(message.username)}
                                            </div>
                                        )}
                                        <div className={`max-w-[78%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                                            <div className={`mb-1 flex items-center gap-2 text-xs ${isCurrentUser ? "justify-end text-gray-500" : "text-gray-500"}`}>
                                                <span className="font-medium text-gray-700">{isCurrentUser ? "You" : message.username}</span>
                                                <span>{timestamp}</span>
                                            </div>
                                            <p className={`rounded-lg px-4 py-2.5 text-sm leading-6 shadow-sm ${
                                                isCurrentUser
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-800 ring-1 ring-gray-200"
                                            }`}>
                                                {message.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-100 bg-white p-3">
                {error && <p role="alert" className="mb-2 text-sm text-red-600">{error}</p>}
                {readOnly && <p className="mb-2 text-sm text-gray-500">This session has ended. Chat is read-only.</p>}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxLength={MAX_CHAT_MESSAGE_LENGTH}
                        disabled={readOnly || sending}
                        aria-label="Chat message"
                        placeholder="Type a message..."
                        className="min-w-0 flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                        type="submit"
                        disabled={!trimmedInput || !connected || sending || readOnly}
                        aria-label="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 cursor-pointer"
                    >
                        <SendHorizonal size={18} aria-hidden="true" />
                    </button>
                </form>
            </div>
        </div>
    );
}
