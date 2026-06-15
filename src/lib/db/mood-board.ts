import { Prisma } from "../../../generated/prisma/browser";
import { prisma } from "../prisma";

export async function createMoodBoard({ userId, query, isVeg, moodBoard }: { userId: string; query: string; isVeg: string; moodBoard: Prisma.InputJsonValue; }) {

    const data = await prisma.mood_boards.create({
        data: {
            user_id: userId,
            query,
            is_veg: isVeg === "true",
            mood_board: moodBoard,
        },
        select: {
            id: true,
        },
    });

    return data.id;
}

export async function getMoodBoard({ moodBoardId }: { moodBoardId: string; }) {

    const data = await prisma.mood_boards.findUnique({
        where: {
            id: moodBoardId,
        },
    });

    if (!data) {
        throw new Error("Mood board not found");
    }

    return data;
}