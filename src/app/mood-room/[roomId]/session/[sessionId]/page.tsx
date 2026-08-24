"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
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
        </div>
    );
}