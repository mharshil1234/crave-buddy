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
    const restaurantCount = moodBoard ? Object.keys(moodBoard.mood_board).length : 0;
    const dishCount = moodBoard
        ? Object.values(moodBoard.mood_board).reduce((total, items) => total + items.length, 0)
        : 0;

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
            className="flex min-h-screen w-full flex-col items-center bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_44%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8"
        >
            <div className="flex w-full max-w-5xl flex-col gap-5">
                {moodBoard ? (
                    <TitleCard
                        userQuery={moodBoard.query}
                        createdAt={moodBoard.created_at}
                        isVeg={moodBoard.is_veg}
                        restaurantCount={restaurantCount}
                        dishCount={dishCount}
                    />
                ) : (
                    <div className="mt-2 h-48 w-full animate-pulse rounded-2xl border border-orange-100 bg-white/80 shadow-sm" />
                )}
                <RestaurantsList mood_board={moodBoard?.mood_board} />
            </div>
        </div>
    )
}
