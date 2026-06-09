import { supabase } from "../supabase";

export async function createMoodBoard({ userId, query, isVeg, moodBoard }: { userId: string; query: string; isVeg: string; moodBoard: unknown; }) {
    
    const { data, error } = await supabase
    .from("mood_boards")
    .insert({
        user_id: userId,
        query: query,
        is_veg: isVeg === "true",
        mood_board: moodBoard
    })
    .select("id")
    .single();

    if(error) {
        throw new Error(error.message);
    }

    return data.id;
}