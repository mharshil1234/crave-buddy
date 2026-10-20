"use client";

import { useState } from "react";
import { UserRoundX, Users, UserCheck } from "lucide-react";

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
  roomId: string;
  currentUserId: string;
  onMemberRemoved: () => void;
}

export function MemberList({ members, isHost, roomId, currentUserId, onMemberRemoved }: MemberListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const activemembers = members.filter((m) => !m.leftAt);

  const removeMember = async (member: Member) => {
    setRemovingId(member.id);
    setError(null);
    try {
      const response = await fetch(`/api/mood-room/${roomId}/members/${member.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to remove member");
      setMemberToRemove(null);
      onMemberRemoved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6">
        <Users className="h-5 w-5 text-orange-600" />
        <h2 className="font-semibold text-neutral-900">
          Members ({activemembers.length})
        </h2>
      </div>

      {error && <p role="alert" className="px-4 pt-3 text-sm text-red-700 sm:px-6">{error}</p>}

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
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-orange-50/50 sm:px-6"
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
              {isHost && member.userId !== currentUserId && <button
                type="button"
                onClick={() => setMemberToRemove(member)}
                disabled={removingId !== null}
                aria-label={`Remove ${member.displayName} from Mood Room`}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserRoundX size={15} aria-hidden="true" />
                {removingId === member.id ? "Removing…" : "Remove"}
              </button>}
            </div>
          ))
        )}
      </div>
      {memberToRemove && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="presentation">
        <section role="alertdialog" aria-modal="true" aria-labelledby="remove-member-title" className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-xl">
          <h3 id="remove-member-title" className="text-base font-semibold text-neutral-900">Remove member?</h3>
          <p className="mt-2 text-sm text-neutral-600">Remove {memberToRemove.displayName} from this Mood Room?</p>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => { setMemberToRemove(null); setError(null); }} disabled={removingId !== null} className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed">Cancel</button>
            <button type="button" onClick={() => void removeMember(memberToRemove)} disabled={removingId !== null} className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{removingId === memberToRemove.id ? "Removing…" : "Remove"}</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
