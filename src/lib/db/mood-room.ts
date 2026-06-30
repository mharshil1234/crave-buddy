import prisma from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { customAlphabet } from "nanoid";
import type {
    createMoodRoomProps,
    createMoodRoomInviteProps,
    createMoodRoomMemberProps,
    createRoomProps,
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