"use client";

import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RoomHeader } from "@/components/MoodRoom/RoomHeader";
import ChatBox from "@/components/MoodRoomSession/ChatBox";
import type { getMoodRoomSession } from "@/lib/db/mood-room-session";

type SessionData = { session: Awaited<ReturnType<typeof getMoodRoomSession>> };

export default function MoodRoomSessionPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const sessionId = params.sessionId as string;
    const { data: session } = useSession();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMember, setIsMember] = useState<boolean | null>(null);

    useEffect(() => {
        if (!roomId || !session?.user?.id) return;

        let isMounted = true;

        const verifyMembership = async () => {
            try {
                const res = await fetch(`/api/mood-room/${roomId}/verify-member`);
                if (isMounted) {
                    setIsMember(res.ok);
                }
            } catch (error) {
                console.error("Error verifying membership:", error);
                if (isMounted) {
                    setIsMember(false);
                }
            }
        };

        verifyMembership();

        return () => {
            isMounted = false;
        };
    }, [roomId, session?.user?.id]);

    useEffect(() => {
        if (!roomId || !sessionId || isMember !== true) return;

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
                    setError(null);
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    setSessionData(null);
                    setError("Unable to load this session. Please refresh to try again.");
                }
            }
        };

        fetchSessionData();

        return () => {
            isMounted = false;
        };
    }, [roomId, sessionId, isMember]);

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-semibold text-neutral-700">
                    Please log in to access the mood room session.
                </p>
            </div>
        );
    }

    if (isMember === false) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-semibold text-neutral-700">
                    You&apos;re not a member of this mood room.
                </p>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-semibold text-neutral-700">
                    {error || "Loading session data..."}
                </p>
            </div>
        );
    }

    const { session: moodSession } = sessionData;
    const { room } = moodSession;
    const currentMember = room.members.find((member) => member.userId === session.user.id && !member.leftAt);

    if (!currentMember) {
        return <p className="p-6">Your membership is no longer active.</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Header />
            <RoomHeader
                roomName={room.name}
                hostName={room.host.name}
                memberCount={room.members.length}
                maxMembers={room.maxMembers}
                inviteCode={room.inviteCode}
            />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {moodSession.session.title || "Untitled Session"}
                        </h2>
                        <p className="text-gray-600">
                            Session ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{moodSession.session.id}</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <ChatBox
                        key={sessionId}
                        sessionId={sessionId}
                        roomId={roomId}
                        memberCount={room.members.length}
                        memberId={currentMember.id}
                        readOnly={moodSession.session.status === "ENDED"}
                    />
                </div>
            </div>
        </div>
    );
}
