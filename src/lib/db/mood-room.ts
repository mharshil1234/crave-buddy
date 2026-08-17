import prisma from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { customAlphabet } from "nanoid";
import type {
    createMoodRoomProps,
    createMoodRoomInviteProps,
    createMoodRoomMemberProps,
    createRoomProps,
    joinRoomProps,
    startRoomSessionProps,
} from "@/types/mood-room";

type DB = typeof prisma | Prisma.TransactionClient;

const generateInviteCode = customAlphabet(
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    8
);

export async function createMoodRoom(
    db: DB,
    { moodRoomName, hostId }: createMoodRoomProps
) {
    const room = await db.moodRoom.create({
        data: {
            name: moodRoomName,
            hostId,
        },
        select: {
            id: true,
        },
    });

    return room.id;
}

export async function createMoodRoomInvite(
    db: DB,
    { roomId }: createMoodRoomInviteProps
) {
    while (true) {
        const code = generateInviteCode();

        try {
            const invite = await db.moodRoomInvite.create({
                data: {
                    roomId,
                    code,
                },
                select: {
                    id: true,
                    code: true,
                },
            });

            return invite;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                continue;
            }

            throw error;
        }
    }
}

export async function createMoodRoomMember(
    db: DB,
    {
        roomId,
        userId,
        displayName,
        inviteId,
    }: createMoodRoomMemberProps
) {
    return db.moodRoomMember.create({
        data: {
            roomId,
            userId,
            displayName,
            inviteId,
        },
    });
}

export async function createRoom({
    moodRoomName,
    hostId,
    displayName,
}: createRoomProps) {
    return prisma.$transaction(async (tx) => {
        const roomId = await createMoodRoom(tx, {
            moodRoomName,
            hostId,
        });

        const invite = await createMoodRoomInvite(tx, {
            roomId,
        });

        await createMoodRoomMember(tx, {
            roomId,
            userId: hostId,
            displayName,
            inviteId: null,
        });

        return {
            roomId,
            inviteCode: invite.code,
        };
    });
}

export async function getRoom({ roomId }: { roomId: string }) {
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

    if (!room) {
        throw new Error("Mood room not found");
    }

    return {
        id: room.id,
        name: room.name,
        hostId: room.hostId,
        host: room.host,
        maxMembers: room.maxMembers,
        inviteCode: room.invites[0]?.code,
        members: room.members.map((member) => ({
            ...member,
            isHost: member.userId === room.hostId,
        })),
        sessions: room.sessions,
    };
}

export async function joinRoom({
    inviteCode,
    userId,
    displayName,
}: joinRoomProps) {
    const code = inviteCode.trim().toUpperCase();

    const invite = await prisma.moodRoomInvite.findUnique({
        where: {
            code,
        },
        select: {
            id: true,
            expiresAt: true,
            revokedAt: true,
            room: {
                select: {
                    id: true,
                    maxMembers: true,
                    status: true,
                    members: {
                        where: {
                            leftAt: null,
                        },
                        select: {
                            id: true,
                            userId: true,
                        },
                    },
                },
            },
        },
    });

    if (!invite) {
        throw new Error("Invalid invite code");
    }

    if (invite.revokedAt || (invite.expiresAt && invite.expiresAt <= new Date())) {
        throw new Error("Invite code expired");
    }

    if (invite.room.status !== "ACTIVE") {
        throw new Error("Mood room is not active");
    }

    const existingMember = invite.room.members.find(
        (member) => member.userId === userId
    );

    if (existingMember) {
        await prisma.moodRoomMember.update({
            where: {
                id: existingMember.id,
            },
            data: {
                displayName,
            },
        });

        return {
            roomId: invite.room.id,
        };
    }

    if (invite.room.members.length >= invite.room.maxMembers) {
        throw new Error("Mood room is full");
    }

    await prisma.moodRoomMember.create({
        data: {
            roomId: invite.room.id,
            userId,
            displayName,
            inviteId: invite.id,
        },
    });

    await prisma.moodRoom.update({
        where: {
            id: invite.room.id,
        },
        data: {
            lastActivityAt: new Date(),
        },
    });

    return {
        roomId: invite.room.id,
    };
}

export async function startRoomSession({
    roomId,
    hostId,
    title,
}: startRoomSessionProps) {
    const room = await prisma.moodRoom.findUnique({
        where: {
            id: roomId,
        },
        select: {
            id: true,
            hostId: true,
            status: true,
        },
    });

    if (!room) {
        throw new Error("Mood room not found");
    }

    if (room.hostId !== hostId) {
        throw new Error("Only the host can start a session");
    }

    if (room.status !== "ACTIVE") {
        throw new Error("Mood room is not active");
    }

    const session = await prisma.moodRoomSession.create({
        data: {
            roomId,
            title: title.trim() || null,
        },
        select: {
            id: true,
        },
    });

    await prisma.moodRoom.update({
        where: {
            id: roomId,
        },
        data: {
            lastActivityAt: new Date(),
        },
    });

    return {
        sessionId: session.id,
    };
}
