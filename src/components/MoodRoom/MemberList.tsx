"use client";

import { Users, UserCheck } from "lucide-react";

interface Member {
  id: string;
  displayName: string;
  userId?: string | null;
  isHost?: boolean;
  joinedAt: Date;
  leftAt?: Date | null;
}

interface MemberListProps {
  members: Member[];
  isHost: boolean;
}

export function MemberList({ members }: MemberListProps) {
  const activemembers = members.filter((m) => !m.leftAt);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6">
        <Users className="h-5 w-5 text-orange-600" />
        <h2 className="font-semibold text-neutral-900">
          Members ({activemembers.length})
        </h2>
      </div>

      <div className="divide-y divide-neutral-100">
        {activemembers.length === 0 ? (
          <div className="px-4 py-8 text-center sm:px-6">
            <Users className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-600">
              No members yet. Share the invite code to get people in!
            </p>
          </div>
        ) : (
          activemembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3 sm:px-6 hover:bg-orange-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-neutral-900">
                    {member.displayName}
                  </p>
                  {member.isHost && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                      <UserCheck className="h-3 w-3" />
                      Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
