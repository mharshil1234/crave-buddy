"use client";

import { Users, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RoomHeaderProps {
  roomName: string;
  hostName: string;
  memberCount: number;
  maxMembers: number;
  inviteCode?: string;
}

export function RoomHeader({
  roomName,
  hostName,
  memberCount,
  maxMembers,
  inviteCode,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy invite code");
    }
  };

  return (
    <div className="border-b border-orange-300/25 bg-gradient-to-br from-orange-50 to-orange-100/50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold text-neutral-900 sm:text-4xl">
              {roomName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Hosted by <span className="font-semibold">{hostName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-semibold text-neutral-900">
                {memberCount} / {maxMembers}
              </span>
            </div>

            {inviteCode && (
              <button
                onClick={copyInviteCode}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 active:bg-orange-800"
                type="button"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {inviteCode}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
