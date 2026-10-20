import prisma from "@/lib/prisma"

export async function getMoodRoomSession({ roomId, sessionId }: { roomId: string; sessionId: string }) {

    const room = await prisma.moodRoom.findUnique({
        where: {
            id: roomId,
        },
        select: {
            id: true,
            name: true,
            hostId: true,
            maxMembers: true,
            host: {
                select: {
                    id: true,
                    name: true,
                },
            },
            invites: {
                where: {
                    revokedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
                select: {
                    code: true,
                },
            },
            members: {
                where: { leftAt: null },
                orderBy: {
                    joinedAt: "asc",
                },
                select: {
                    id: true,
                    userId: true,
                    displayName: true,
                    joinedAt: true,
                    leftAt: true,
                },
            },
            sessions: {
                orderBy: {
                    startedAt: "desc",
                },
                select: {
                    id: true,
                    title: true,
                    startedAt: true,
                    endedAt: true,
                    status: true,
                    phase: true,
                },
            },
        },
    });

    if(!room) throw new Error("Mood room not found");

    const session = await prisma.moodRoomSession.findFirst({
        where: {
            id: sessionId,
            roomId,
        },
        select: {
            id: true,
            title: true,
            status: true,
            phase: true,
            startedAt: true,
            endedAt: true,
        },
    });

    if(!session) throw new Error("Session not found");

    return {
        room: { ...room, inviteCode: room.invites[0]?.code },
        session
    };

}
