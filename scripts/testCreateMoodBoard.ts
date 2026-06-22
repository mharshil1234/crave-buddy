import "dotenv/config";
import { createMoodBoard, getMoodBoard } from "@/lib/db/mood-board";

async function createMoodBoardTest() {

    const id = await createMoodBoard({ userId: "1234", query: "Somth+Hot", isVeg: "true", moodBoard: { "1234": ["1234_1"] } });
    console.log(id);
}

async function getMoodBoardTest() {
    const data = await getMoodBoard({ moodBoardId: "0766ab90-ca75-478d-ab69-bc92909157b6" });
    console.log(data);
}

createMoodBoardTest();
getMoodBoardTest();