import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, SessionScope, SessionStateResult } from "@/socket/types";
import { MoodRoomAccessError } from "@/lib/db/mood-room-voting";

export async function submitPromptThroughSocket(scope: SessionScope, prompt: string, cookie: string) {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        { autoConnect: false, reconnection: false, forceNew: true, transports: ["websocket"], extraHeaders: { cookie } },
    );
    try {
        return await new Promise<SessionStateResult>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new MoodRoomAccessError("The craving service is unavailable. Please try again.", 503));
            }, 10_000);
            const finish = (result?: SessionStateResult) => {
                clearTimeout(timeout);
                if (result) resolve(result);
                else reject(new MoodRoomAccessError("The craving service is unavailable. Please try again.", 503));
            };
            socket.once("connect_error", () => finish());
            socket.once("connect", () => {
                socket.timeout(8000).emit("session:submit-prompt", { ...scope, prompt }, (error: Error | null, result: SessionStateResult) => {
                    finish(error ? undefined : result);
                });
            });
            socket.connect();
        });
    } finally {
        socket.removeAllListeners();
        socket.disconnect();
    }
}
