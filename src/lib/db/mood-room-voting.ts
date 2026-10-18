import prisma from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { z } from "zod";
import { MAX_CHAT_MESSAGE_LENGTH, type ChatMessage, type SessionScope } from "@/socket/types";

export const sessionScopeSchema = z.object({
    roomId: z.uuid(),
    sessionId: z.uuid(),
});

export class MoodRoomAccessError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
    }
}

export async function getSessionMember({ roomId, sessionId, userId }: SessionScope & { userId: string }) {
    if (!sessionScopeSchema.safeParse({ roomId, sessionId }).success) {
        throw new MoodRoomAccessError("Invalid room or session ID", 400);
    }

    const session = await prisma.moodRoomSession.findFirst({
        where: { id: sessionId, roomId },
        select: {
            status: true,
            room: {
                select: {
                    members: {
                        where: { userId, leftAt: null },
                        orderBy: { joinedAt: "desc" },
                        select: { id: true, userId: true, displayName: true },
                    },
                },
            },
        },
    });

    if (!session) throw new MoodRoomAccessError("Session not found in this room", 404);
    const member = session.room.members[0];
    if (!member) throw new MoodRoomAccessError("Not a member of this room", 403);

    return { member, status: session.status };
}

const messageInclude = {
    member: { select: { displayName: true, userId: true } },
} satisfies Prisma.MoodRoomMessageInclude;

type StoredChatMessage = Prisma.MoodRoomMessageGetPayload<{ include: typeof messageInclude }>;

export function toChatMessage(message: StoredChatMessage): ChatMessage {
    return {
        id: message.id,
        sessionId: message.sessionId,
        type: "chat",
        message: message.content,
        userId: message.member.userId ?? message.memberId,
        username: message.member.displayName,
        createdAt: message.createdAt.toISOString(),
        memberId: message.memberId,
    };
}

export async function saveChatMessage({ sessionId, memberId, content }: {
    sessionId: string;
    memberId: string;
    content: string;
}) {
    const message = z.string().trim().min(1).max(MAX_CHAT_MESSAGE_LENGTH).parse(content);

    return prisma.$transaction(async (transaction) => {
        const session = await transaction.moodRoomSession.findFirst({
            where: {
                id: sessionId,
                status: "ACTIVE",
                room: { members: { some: { id: memberId, leftAt: null } } },
            },
            select: { id: true },
        });

        if (!session) throw new MoodRoomAccessError("Session is closed or membership is no longer active", 403);

        const saved = await transaction.moodRoomMessage.create({
            data: { sessionId, memberId, content: message },
            include: messageInclude,
        });

        return toChatMessage(saved);
    });
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const messages = await prisma.moodRoomMessage.findMany({
        where: { sessionId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 50,
        include: messageInclude,
    });

    return messages.reverse().map(toChatMessage);
}
