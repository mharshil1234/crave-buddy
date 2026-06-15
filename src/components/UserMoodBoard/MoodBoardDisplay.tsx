import { useState, useEffect } from "react";
import { TitleCard } from "./TitleCard";
import { RestaurantsList } from "./RestaurantsList";

type MoodBoard = {
    query: string;
    created_at: string;
    is_veg: boolean;
    mood_board: Record<string, string[]>;
};

export function MoodBoardDisplay({ id }: { id: string }) {

    const [moodBoard, setmoodBoard] = useState<MoodBoard | null>(null);

    useEffect(() => {
        async function getMoodBoard() {
            try {
                const response = await fetch(`/api/mood-board/get?id=${id}`);
                const moodBoardData = await response.json() as MoodBoard;
                setmoodBoard(moodBoardData);
            }
            catch (error) {
                console.log(error);
            }
        }
        getMoodBoard();
    }, [id]);

    return (
        <div
            className="flex min-h-screen w-full flex-col items-center p-4"
            style={{
                background: "radial-gradient(circle at 15% 20%, #ffd6b8, transparent 50%), radial-gradient(circle at 85% 80%, #c8e2ff, transparent 50%), #fff8f3"
            }}
        >
            {moodBoard && (
                <TitleCard
                    userQuery={moodBoard.query}
                    createdAt={moodBoard.created_at}
                    isVeg={moodBoard.is_veg}
                />
            )}
            <RestaurantsList mood_board={moodBoard?.mood_board} />
        </div>
    )
}
