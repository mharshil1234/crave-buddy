"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RoomHeader } from "@/components/MoodRoom/RoomHeader";
import { MemberList } from "@/components/MoodRoom/MemberList";
import { HostControls } from "@/components/MoodRoom/HostControls";
import { PastSessions } from "@/components/MoodRoom/PastSessions";
import { LoaderModal } from "@/components/MoodRoom/LoaderModal";

type MoodRoomData = {
  id: string;
  name: string;
  hostId: string;
  host: {
    id: string;
    name: string;
  };
  maxMembers: number;
  inviteCode?: string;
  members: {
    id: string;
    displayName: string;
    userId?: string | null;
    isHost?: boolean;
    joinedAt: Date;
    leftAt?: Date | null;
  }[];
  sessions: {
    id: string;
    title?: string | null;
    startedAt: Date;
    endedAt?: Date | null;
    status: "ACTIVE" | "ENDED";
    phase: string;
  }[];
};

export default function MoodRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [roomData, setRoomData] = useState<MoodRoomData | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const fetchRoomData = async () => {
      try {
        const res = await fetch(`/api/mood-room/${roomId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch room data: ${res.status}`);
        }

        const data = await res.json();
        if (isMounted) {
          setRoomData(data);
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    fetchRoomData();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const isHost = roomData?.hostId === session?.user?.id;

  const handleStartSession = async (sessionName: string) => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/mood-room/${roomId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: session.user.id,
          title: sessionName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/mood-room/${roomId}/session/${data.session.sessionId}`);
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!roomData) {
    return <LoaderModal isLoading={true} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <RoomHeader
        roomName={roomData.name}
        hostName={roomData.host?.name || "Unknown"}
        memberCount={roomData.members?.length || 0}
        maxMembers={roomData.maxMembers || 8}
        inviteCode={roomData.inviteCode}
      />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <MemberList
                members={roomData.members || []}
                isHost={isHost}
              />

              <HostControls
                isHost={isHost}
                onStartSession={handleStartSession}
                isLoading={isLoading}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PastSessions
                sessions={roomData.sessions || []}
                roomId={roomId}
              />
            </div>
          </div>
        </div>
      </main>

      {/* <LoaderModal isLoading={isLoading} /> */}
    </div>
  );
}
