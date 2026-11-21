import prisma from "@/lib/prisma";
import { z } from "zod";

export function isMoodBoardId(value: unknown): value is string {
    return z.uuid().safeParse(value).success;
}

export async function createMoodBoard({
    userId,
    query,
    isVeg,
    moodBoard,
}: {
    userId: string | null;
    query: string;
    isVeg: string;
    moodBoard: Record<string, string[]>;
}) {
    const result = await prisma.mood_boards.create({
        data: {
            creator_id: userId,
            query,
            is_veg: isVeg === "true",
            mood_board: moodBoard,
            ...(userId ? { saved_by: { create: { user_id: userId } } } : {}),
        },
        select: {
            id: true,
        }
    });

    return result.id;
}

/** Returns the mood board, or null when the id is malformed or doesn't exist. */
export async function getMoodBoard({
    moodBoardId,
}: {
    moodBoardId: string;
}) {
    if (!isMoodBoardId(moodBoardId)) return null;

    return prisma.mood_boards.findUnique({
        where: {
            id: moodBoardId,
        },
    });
}
