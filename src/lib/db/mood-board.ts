import { pool } from "../db";

export async function createMoodBoard({
    userId,
    query,
    isVeg,
    moodBoard,
}: {
    userId: string;
    query: string;
    isVeg: string;
    moodBoard: any;
}) {
    const result = await pool.query(
        `
        INSERT INTO mood_boards (
            user_id,
            query,
            is_veg,
            mood_board
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
            userId,
            query,
            isVeg === "true",
            JSON.stringify(moodBoard),
        ]
    );

    return result.rows[0].id;
}

export async function getMoodBoard({
    moodBoardId,
}: {
    moodBoardId: string;
}) {
    const result = await pool.query(
        `
        SELECT *
        FROM mood_boards
        WHERE id = $1
        `,
        [moodBoardId]
    );

    if (result.rows.length === 0) {
        throw new Error("Mood board not found");
    }

    return result.rows[0];
}