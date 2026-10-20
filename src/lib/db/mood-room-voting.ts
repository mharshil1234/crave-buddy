import prisma from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { z } from "zod";
import { MAX_CHAT_MESSAGE_LENGTH, MAX_CRAVING_LENGTH, NOMINATION_TIMEOUT_MS, type ChatMessage, type RestaurantNominee, type RestaurantVotes, type SessionScope, type SessionState } from "@/socket/types";
import { getGroupRestaurantCandidates, restaurantNomineeSchema, validateGroupNominations } from "@/lib/mood-room";

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
    restaurantVotes: {
        where: { member: { leftAt: null } },
        select: { memberId: true, restaurantId: true },
    },
} satisfies Prisma.MoodRoomSessionInclude;

type StoredSessionState = Prisma.MoodRoomSessionGetPayload<{ include: typeof stateInclude }>;

function tallyRestaurantVotes(session: StoredSessionState): RestaurantVotes {
    const nominees = z.array(restaurantNomineeSchema).parse(session.restaurantNominees);
    const votes: RestaurantVotes = Object.fromEntries(nominees.map((nominee) => [nominee.restaurantId, { count: 0, memberIds: [] }]));
    session.restaurantVotes.forEach((vote) => {
        if (votes[vote.restaurantId]) {
            votes[vote.restaurantId].count++;
            votes[vote.restaurantId].memberIds.push(vote.memberId);
        }
    });
    return votes;
}

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
        restaurantNominees: z.array(restaurantNomineeSchema).parse(session.restaurantNominees),
        nominationStatus: session.nominationStatus,
        nominationStartedAt: session.nominationStartedAt?.toISOString() ?? null,
        nominationError: session.nominationError,
        restaurantVotes: tallyRestaurantVotes(session),
        selectedRestaurantId: session.selectedRestaurantId,
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

export async function advanceSessionPhase({ roomId, sessionId, userId, phase, allowPartial = false, restaurantId }: SessionScope & {
    userId: string;
    phase: "PROMPT_COLLECTION" | "RESTAURANT_VOTING" | "ITEM_VOTING";
    allowPartial?: boolean;
    restaurantId?: string;
}) {
    if (phase === "ITEM_VOTING") return closeRestaurantVoting({ roomId, sessionId, userId, restaurantId, allowPartial });
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
        await transaction.moodRoomSession.update({ where: { id: sessionId }, data: {
            phase,
            ...(phase === "RESTAURANT_VOTING" ? { nominationStatus: "GENERATING", nominationStartedAt: new Date(), nominationError: null } : {}),
        } });
    });
}

export async function startRestaurantNomination({ roomId, sessionId, userId }: SessionScope & { userId: string }) {
    return mutateSession(sessionId, async (transaction, session) => {
        if (session.roomId !== roomId) throw new MoodRoomAccessError("Session not found in this room", 404);
        if (session.room.hostId !== userId || !session.room.members.some((member) => member.userId === userId)) {
            throw new MoodRoomAccessError("Only the host can find restaurants", 403);
        }
        if (session.phase !== "RESTAURANT_VOTING") throw new MoodRoomAccessError("Restaurant voting is not open", 409);
        if (!session.prompts.length) throw new MoodRoomAccessError("At least one craving is required", 409);
        if (session.nominationStatus === "READY") throw new MoodRoomAccessError("The group already has restaurant nominees", 409);
        if (session.nominationStatus === "GENERATING" && session.nominationStartedAt && Date.now() - session.nominationStartedAt.getTime() < NOMINATION_TIMEOUT_MS) {
            throw new MoodRoomAccessError("Restaurant matching is already in progress", 409);
        }
        await transaction.moodRoomSession.update({ where: { id: sessionId }, data: {
            nominationStatus: "GENERATING", nominationStartedAt: new Date(), nominationError: null,
        } });
    });
}

export async function completeRestaurantNomination({ sessionId, startedAt, nominees, error }: {
    sessionId: string;
    startedAt: string;
    nominees?: RestaurantNominee[];
    error?: string;
}) {
    const validated = error ? [] : validateGroupNominations(nominees, getGroupRestaurantCandidates());
    return mutateSession(sessionId, async (transaction, session) => {
        if (session.phase !== "RESTAURANT_VOTING" || session.nominationStatus !== "GENERATING" || session.nominationStartedAt?.toISOString() !== startedAt) {
            throw new MoodRoomAccessError("Restaurant matching has been superseded", 409);
        }
        await transaction.moodRoomSession.update({ where: { id: sessionId }, data: {
            restaurantNominees: validated.map((nominee) => ({ ...nominee })),
            nominationStatus: error ? "FAILED" : "READY",
            nominationError: error ? error.slice(0, 300) : null,
        } });
    });
}

export async function upsertRestaurantVote({ sessionId, memberId, restaurantId }: { sessionId: string; memberId: string; restaurantId: string }) {
    return mutateSession(sessionId, async (transaction, session) => {
        if (!session.room.members.some((member) => member.id === memberId)) throw new MoodRoomAccessError("Not a member of this room", 403);
        if (session.phase !== "RESTAURANT_VOTING" || session.nominationStatus !== "READY") {
            throw new MoodRoomAccessError("Restaurant voting is not open", 409);
        }
        const nominees = z.array(restaurantNomineeSchema).parse(session.restaurantNominees);
        if (!nominees.some((nominee) => nominee.restaurantId === restaurantId)) throw new MoodRoomAccessError("Choose one of the nominated restaurants", 400);
        await transaction.moodRoomRestaurantVote.upsert({
            where: { sessionId_memberId: { sessionId, memberId } },
            create: { sessionId, memberId, restaurantId },
            update: { restaurantId },
        });
    });
}

export async function getRestaurantVoteTally(scope: SessionScope & { userId: string }) {
    return (await getSessionState(scope)).restaurantVotes;
}

export async function closeRestaurantVoting({ roomId, sessionId, userId, restaurantId, allowPartial = false }: SessionScope & {
    userId: string;
    restaurantId?: string;
    allowPartial?: boolean;
}) {
    return mutateSession(sessionId, async (transaction, session) => {
        if (session.roomId !== roomId) throw new MoodRoomAccessError("Session not found in this room", 404);
        if (session.room.hostId !== userId || !session.room.members.some((member) => member.userId === userId)) {
            throw new MoodRoomAccessError("Only the host can close restaurant voting", 403);
        }
        if (session.phase !== "RESTAURANT_VOTING" || session.nominationStatus !== "READY") throw new MoodRoomAccessError("Restaurant voting is not open", 409);
        const votes = tallyRestaurantVotes(session);
        const totalVotes = Object.values(votes).reduce((total, vote) => total + vote.count, 0);
        if (!totalVotes) throw new MoodRoomAccessError("At least one restaurant vote is required", 409);
        if (!allowPartial && totalVotes < session.room.members.length) throw new MoodRoomAccessError("Wait for everyone or choose to close with the current votes", 409);
        const highestCount = Math.max(...Object.values(votes).map((vote) => vote.count));
        const leaders = Object.keys(votes).filter((candidateId) => votes[candidateId].count === highestCount);
        const winner = restaurantId ?? (leaders.length === 1 ? leaders[0] : undefined);
        if (!winner || !leaders.includes(winner)) throw new MoodRoomAccessError("Choose a winner from the tied leading restaurants", 409);
        await transaction.moodRoomSession.update({ where: { id: sessionId }, data: { phase: "ITEM_VOTING", selectedRestaurantId: winner } });
    });
}
