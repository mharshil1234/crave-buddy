import { useState, useEffect } from "react";
import { TitleCard } from "./TitleCard";

export function MoodBoardDisplay({ id }: { id: string }) {

    const [moodBoard, setmoodBoard] = useState<any>(null);

    useEffect(() => {
        async function getMoodBoard() {
            try {
                const response = await fetch(`/api/mood-board/get?id=${id}`);
                const moodBoardData = await response.json();
                console.log(moodBoardData);
                setmoodBoard(moodBoardData);
            }
            catch (error) {
                console.log(error);
            }
        }
        getMoodBoard();
    }, []);

    return (
        <div
            className="p-4 flex justify-center items-start min-h-screen"
            style={{
                background: "radial-gradient(circle at 15% 20%, #ffd6b8, transparent 50%), radial-gradient(circle at 85% 80%, #c8e2ff, transparent 50%), #fff8f3"
            }}
        >
            <TitleCard userQuery={moodBoard?.query} createdAt={moodBoard?.created_at} />
        </div>
    )
}