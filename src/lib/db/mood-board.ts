import prisma from "@/lib/prisma";

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
        },
        select: {
            id: true,
        }
    });

    if (userId) {
        await prisma.saved_mood_boards.create({
            data: {
                user_id: userId,
                mood_board_id: result.id,
            }
        });
    }

    return result.id;
}

export async function getMoodBoard({
    moodBoardId,
}: {
    moodBoardId: string;
}) {
    const result = await prisma.mood_boards.findUnique({
        where: {
            id: moodBoardId,
        },
    });

    if (!result) {
        throw new Error("Mood board not found");
    }

    return result;
}