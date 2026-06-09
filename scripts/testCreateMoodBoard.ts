import "dotenv/config";
import { createMoodBoard } from "@/lib/db/mood-board";

async function createMoodBoardTest() {

    const id = await createMoodBoard({ userId: "1234", query: "Somth+Hot", isVeg: "true", moodBoard: { "1234": ["1234_1"] } });
    console.log(id);
}

createMoodBoardTest();