"use client";

import { Clock, ChevronRight, CircleDot, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  title?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  status: "ACTIVE" | "ENDED";
  phase: string;
  restaurantName?: string | null;
  endedEarly?: boolean;
}

interface PastSessionsProps {
  sessions: Session[];
  roomId: string;
}

export function PastSessions({ sessions, roomId }: PastSessionsProps) {
  const router = useRouter();
  const currentSessions = sessions
    .filter((session) => session.status === "ACTIVE")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  const pastSessions = sessions
    .filter((s) => s.status === "ENDED")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const handleViewSession = (sessionId: string) => {
    router.push(`/mood-room/${roomId}/session/${sessionId}`);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-emerald-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-neutral-900">Current Sessions ({currentSessions.length})</h2>
          </div>
          {currentSessions.length > 0 && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />LIVE</span>}
        </div>
        {currentSessions.length === 0 ? (
          <div className="px-4 py-6 text-center sm:px-6">
            <p className="text-sm text-neutral-600">No session is running right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {currentSessions.map((session) => (
              <button key={session.id} onClick={() => handleViewSession(session.id)} className="w-full px-4 py-3 text-left transition-colors hover:bg-emerald-50/60 sm:px-6" type="button">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">{session.title || "Untitled Session"}</p>
                    <p className="mt-1 text-xs text-neutral-500">{phaseLabel(session.phase)} · Started {new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">Join session</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6">
        <Clock className="h-5 w-5 text-orange-600" />
        <h2 className="font-semibold text-neutral-900">
          Past Sessions ({pastSessions.length})
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {pastSessions.length === 0 ? (
          <div className="px-4 py-8 text-center sm:px-6">
            <Zap className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-600">
              Completed sessions will appear here.
            </p>
          </div>
        ) : (
          pastSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleViewSession(session.id)}
              className="w-full text-left transition-colors hover:bg-orange-50/50 active:bg-orange-100/30 px-4 py-3 sm:px-6"
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-900">
                    {session.title || "Untitled Session"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(session.startedAt).toLocaleDateString()} at{" "}
                    {new Date(session.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {session.restaurantName && <p className="mt-1 truncate text-xs font-medium text-orange-700">{session.restaurantName}</p>}
                  {session.endedEarly && <p className="mt-1 text-xs font-medium text-neutral-500">Ended early · no order finalized</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>
      </section>
    </div>
  );
}

function phaseLabel(phase: string) {
  const labels: Record<string, string> = {
    LOBBY: "Lobby",
    PROMPT_COLLECTION: "Collecting cravings",
    RESTAURANT_VOTING: "Choosing a restaurant",
    ITEM_VOTING: "Choosing dishes",
  };
  return labels[phase] ?? "In progress";
}
