import { useState, useEffect } from "react";

export function MoodBoardDisplay({id}: {id: string}) {

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
        <div>
            {}
        </div>
    )
}