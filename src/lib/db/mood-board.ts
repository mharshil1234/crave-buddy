import { supabaseAdmin } from "../supabase";

export async function createMoodBoard({ userId, query, isVeg, moodBoard }: { userId: string; query: string; isVeg: string; moodBoard: unknown; }) {
    
    const { data, error } = await supabaseAdmin
    .from("mood_boards")
    .insert({
        user_id: userId,
        query: query,
        is_veg: isVeg === "true",
        mood_board: moodBoard
    })
    .select("id")
    .single();

    if(error) throw new Error(error.message);

    return data.id;
}

export async function getMoodBoard({ moodBoardId }: { moodBoardId: string; }) {

    const { data, error } = await supabaseAdmin
    .from("mood_boards")
    .select("*")
    .eq("id", moodBoardId)
    .single()

    if(error) throw new Error(error.message);

    return data;
}