"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { RoomHeader } from "@/components/MoodRoom/RoomHeader";

export default function MoodRoomSessionPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const sessionId = params.sessionId as string;
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [sessionData, setSessionData] = useState<any | null>(null);
    const [messages, setMessages] = useState<Array<{id: string; sender: "user" | "bot"; text: string}>>([]);
    const [input, setInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!messagesRef.current) return;
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!roomId || !sessionId) return;

        let isMounted = true;

        const fetchSessionData = async () => {
            try {
                const res = await fetch(`/api/mood-room/${roomId}/session/${sessionId}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch session data: ${res.status}`);
                }
                const data = await res.json();
                if (isMounted) {
                    setSessionData(data);
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    setSessionData(null);
                }
            }
        };

        fetchSessionData();

        return () => {
            isMounted = false;
        };
    }, [roomId, sessionId]);

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-semibold text-neutral-700">
                    Please log in to access the mood room session.
                </p>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-semibold text-neutral-700">
                    Loading session data...
                </p>
            </div>
        );
    }

    const { session: moodSession } = sessionData;
    const { room } = moodSession;

    return (
        <div>
            <Header />
            <RoomHeader
                roomName={room.name}
                hostName={room.host.name}
                memberCount={room.members.length}
                maxMembers={room.maxMembers}
                inviteCode={room.inviteCode}
            />
            <div className="p-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                    Session: {moodSession.session.title || "Untitled"}
                </h2>
                <p className="mt-2 text-neutral-700">
                    Session ID: {moodSession.session.id}
                </p>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Chat</h3>
                <div ref={messagesRef} className="border rounded-md h-72 overflow-auto p-3 bg-white">
                    
                </div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 p-4 bg-white/80 backdrop-blur-md border-t">
                <form
                    onSubmit={async (e) => {}}
                    className="flex gap-2 items-center"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-md border px-3 py-2 focus:outline-none"
                    />
                    <button type="submit" className="rounded-md bg-blue-600 text-white px-4 py-2">Send</button>
                </form>
            </div>
        </div>
    );
}