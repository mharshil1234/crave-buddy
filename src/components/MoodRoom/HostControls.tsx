"use client";

import { Play, Settings, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

interface HostControlsProps {
  isHost: boolean;
  onStartSession: (sessionName: string) => void;
  onManageRoom?: () => void;
  isLoading?: boolean;
}

export function HostControls({
  isHost,
  onStartSession,
  onManageRoom,
  isLoading = false,
}: HostControlsProps) {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");

  if (!isHost) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSessionName = sessionName.trim();

    if (!trimmedSessionName) return;

    onStartSession(trimmedSessionName);
    setIsStartModalOpen(false);
    setSessionName("");
  };

  return (
    <>
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-3 sm:px-6">
          <h2 className="font-semibold text-neutral-900">Host Controls</h2>
        </div>

        <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
          <button
            onClick={() => setIsStartModalOpen(true)}
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

      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h3 className="font-semibold text-neutral-900">Start Session</h3>
              <button
                type="button"
                aria-label="Close start session dialog"
                onClick={() => setIsStartModalOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="sessionName"
                  className="block text-sm font-semibold text-neutral-700"
                >
                  Session Name
                </label>
                <input
                  id="sessionName"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Saturday dinner"
                  autoFocus
                  className="mt-1.5 block w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:border-transparent focus:ring-orange-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !sessionName.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 active:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {isLoading ? "Starting..." : "Start Session"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
