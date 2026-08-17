"use client";

import { Play, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HostControlsProps {
  isHost: boolean;
  onStartSession: () => void;
  onManageRoom?: () => void;
  isLoading?: boolean;
}

export function HostControls({
  isHost,
  onStartSession,
  onManageRoom,
  isLoading = false,
}: HostControlsProps) {
  const router = useRouter();

  if (!isHost) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3 sm:px-6">
        <h2 className="font-semibold text-neutral-900">Host Controls</h2>
      </div>

      <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
        <button
          onClick={onStartSession}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <Play className="h-4 w-4" />
          Start Session
        </button>

        {onManageRoom && (
          <button
            onClick={onManageRoom}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <Settings className="h-4 w-4" />
            Manage Room
          </button>
        )}

      </div>
    </div>
  );
}
