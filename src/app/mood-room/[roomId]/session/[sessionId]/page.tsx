"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { RoomHeader } from "@/components/MoodRoom/RoomHeader";
import ChatBox from "@/components/MoodRoomSession/ChatBox";

export default function MoodRoomSessionPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const sessionId = params.sessionId as string;
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [sessionData, setSessionData] = useState<any | null>(null);
    const [messages, setMessages] = useState<Array<{id: string; sender: "user" | "bot"; text: string}>>([]);
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
                    Loading session data...
                </p>
            </div>
        );
    }

    const { session: moodSession } = sessionData;
    const { room } = moodSession;

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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <ChatBox sessionId={sessionId} username={session.user.name} />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Session Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Current User</p>
                                    <p className="text-lg font-semibold text-blue-600">{session.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Members</p>
                                    <p className="text-lg font-semibold text-gray-900">{room.members.length} / {room.maxMembers}</p>
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Members</p>
                                    <div className="space-y-2">
                                        {room.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-gray-700">{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}