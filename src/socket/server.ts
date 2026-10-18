import "dotenv/config";
import { createMoodRoomSocketServer } from "./events";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to persist Mood Room chat");
}

const { httpServer } = createMoodRoomSocketServer();
const port = Number(process.env.SOCKET_PORT || process.env.PORT || 3001);

httpServer.listen(port, () => {
    console.log(`Socket server running on port ${port}`);
});
