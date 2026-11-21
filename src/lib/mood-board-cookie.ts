/** Cookie that remembers boards generated while signed out, so they can be claimed after sign-in. */
export const GENERATED_MOOD_BOARDS_COOKIE = "generatedMoodBoards";
const MAX_REMEMBERED_BOARDS = 20;

/** Parses the cookie value, returning [] for anything missing or malformed. */
export function readGeneratedMoodBoards(value: string | undefined): string[] {
    try {
        const parsed: unknown = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
        return [];
    }
}

/** Appends a board id, keeping only the most recent ones. */
export function appendGeneratedMoodBoard(value: string | undefined, id: string): string {
    return JSON.stringify([...readGeneratedMoodBoards(value), id].slice(-MAX_REMEMBERED_BOARDS));
}
