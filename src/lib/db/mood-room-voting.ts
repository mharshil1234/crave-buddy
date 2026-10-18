import prisma from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { z } from "zod";
import { MAX_CHAT_MESSAGE_LENGTH, MAX_CRAVING_LENGTH, type ChatMessage, type SessionScope, type SessionState } from "@/socket/types";

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

export const cravingSchema = z.string().trim().min(1).max(MAX_CRAVING_LENGTH);

const stateInclude = {
    room: {
        select: {
            hostId: true,
            members: {
                where: { leftAt: null },
                orderBy: { joinedAt: "asc" as const },
                select: { id: true, userId: true, displayName: true },
            },
        },
    },
    prompts: {
        where: { member: { leftAt: null } },
        orderBy: { createdAt: "asc" as const },
        include: { member: { select: { displayName: true } } },
    },
} satisfies Prisma.MoodRoomSessionInclude;

type StoredSessionState = Prisma.MoodRoomSessionGetPayload<{ include: typeof stateInclude }>;

function toSessionState(session: StoredSessionState): SessionState {
    return {
        sessionId: session.id,
        phase: session.phase,
        status: session.status,
        hostId: session.room.hostId,
        updatedAt: session.updatedAt.toISOString(),
        members: session.room.members.map((member) => ({
            memberId: member.id,
            userId: member.userId ?? member.id,
            displayName: member.displayName,
        })),
        prompts: session.prompts.map((prompt) => ({
            memberId: prompt.memberId,
            displayName: prompt.member.displayName,
            prompt: prompt.prompt,
        })),
    };
}

export async function getSessionState({ roomId, sessionId, userId }: SessionScope & { userId: string }) {
    if (!sessionScopeSchema.safeParse({ roomId, sessionId }).success) {
        throw new MoodRoomAccessError("Invalid room or session ID", 400);
    }
    return prisma.$transaction(async (transaction) => {
        const session = await transaction.moodRoomSession.findFirst({
            where: { id: sessionId, roomId },
            include: stateInclude,
        });
        if (!session) throw new MoodRoomAccessError("Session not found in this room", 404);
        if (!session.room.members.some((member) => member.userId === userId)) {
            throw new MoodRoomAccessError("Not a member of this room", 403);
        }
        return toSessionState(session);
    }, { isolationLevel: "RepeatableRead" });
}

export async function getSessionPrompts(scope: SessionScope & { userId: string }) {
    return (await getSessionState(scope)).prompts;
}

async function mutateSession(sessionId: string, mutate: (transaction: Prisma.TransactionClient, session: StoredSessionState) => Promise<void>) {
    if (!z.uuid().safeParse(sessionId).success) throw new MoodRoomAccessError("Invalid session ID", 400);
    return prisma.$transaction(async (transaction) => {
        await transaction.$queryRaw`SELECT id FROM mood_room_sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;
        const session = await transaction.moodRoomSession.findUnique({ where: { id: sessionId }, include: stateInclude });
        if (!session) throw new MoodRoomAccessError("Session not found", 404);
        if (session.status !== "ACTIVE") throw new MoodRoomAccessError("This session has ended", 409);
        await mutate(transaction, session);
        const updated = await transaction.moodRoomSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date(Math.max(Date.now(), session.updatedAt.getTime() + 1)) },
            include: stateInclude,
        });
        return toSessionState(updated);
    });
}

export async function upsertPrompt({ sessionId, memberId, prompt }: { sessionId: string; memberId: string; prompt: string }) {
    const parsed = cravingSchema.safeParse(prompt);
    if (!parsed.success) throw new MoodRoomAccessError(`Enter a craving between 1 and ${MAX_CRAVING_LENGTH} characters`, 400);
    return mutateSession(sessionId, async (transaction, session) => {
        if (!session.room.members.some((member) => member.id === memberId)) {
            throw new MoodRoomAccessError("Not a member of this room", 403);
        }
        if (session.phase !== "PROMPT_COLLECTION") throw new MoodRoomAccessError("Craving collection is not open", 409);
        await transaction.moodRoomPrompt.upsert({
            where: { sessionId_memberId: { sessionId, memberId } },
            create: { sessionId, memberId, prompt: parsed.data },
            update: { prompt: parsed.data },
        });
    });
}

export async function advanceSessionPhase({ roomId, sessionId, userId, phase, allowPartial = false }: SessionScope & {
    userId: string;
    phase: "PROMPT_COLLECTION" | "RESTAURANT_VOTING";
    allowPartial?: boolean;
}) {
    return mutateSession(sessionId, async (transaction, session) => {
        if (session.roomId !== roomId) throw new MoodRoomAccessError("Session not found in this room", 404);
        if (session.room.hostId !== userId || !session.room.members.some((member) => member.userId === userId)) {
            throw new MoodRoomAccessError("Only the host can move the session forward", 403);
        }
        const expected = phase === "PROMPT_COLLECTION" ? "LOBBY" : "PROMPT_COLLECTION";
        if (session.phase !== expected) throw new MoodRoomAccessError("The session has already moved to another phase", 409);
        if (phase === "RESTAURANT_VOTING") {
            if (session.prompts.length === 0) throw new MoodRoomAccessError("At least one member must submit a craving", 409);
            if (!allowPartial && session.prompts.length < session.room.members.length) {
                throw new MoodRoomAccessError("Wait for everyone or choose to continue with the submitted cravings", 409);
            }
        }
        await transaction.moodRoomSession.update({ where: { id: sessionId }, data: { phase } });
    });
}
