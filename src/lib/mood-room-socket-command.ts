import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, SessionScope, SessionStateResult } from "@/socket/types";
import { MoodRoomAccessError } from "@/lib/db/mood-room-voting";

type SessionSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type CommandCallback = (error: Error | null, result: SessionStateResult) => void;

async function runSessionCommand(cookie: string, send: (socket: SessionSocket, callback: CommandCallback) => void) {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        { autoConnect: false, reconnection: false, forceNew: true, transports: ["websocket"], extraHeaders: { cookie } },
    );
    try {
        return await new Promise<SessionStateResult>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new MoodRoomAccessError("The session service is unavailable. Please try again.", 503));
            }, 10_000);
            const finish = (result?: SessionStateResult) => {
                clearTimeout(timeout);
                if (result) resolve(result);
                else reject(new MoodRoomAccessError("The session service is unavailable. Please try again.", 503));
            };
            socket.once("connect_error", () => finish());
            socket.once("connect", () => {
                send(socket, (error, result) => {
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

export async function submitPromptThroughSocket(scope: SessionScope, prompt: string, cookie: string) {
    return runSessionCommand(cookie, (socket, callback) => {
        socket.timeout(8000).emit("session:submit-prompt", { ...scope, prompt }, callback);
    });
}

export async function voteRestaurantThroughSocket(scope: SessionScope, restaurantId: string, cookie: string) {
    return runSessionCommand(cookie, (socket, callback) => {
        socket.timeout(8000).emit("session:vote-restaurant", { ...scope, restaurantId }, callback);
    });
}

export async function voteItemThroughSocket(scope: SessionScope, itemId: string, quantity: number, cookie: string) {
    return runSessionCommand(cookie, (socket, callback) => {
        socket.timeout(8000).emit("session:vote-item", { ...scope, itemId, quantity }, callback);
    });
}

export async function lockItemsThroughSocket(scope: SessionScope, cookie: string) {
    return runSessionCommand(cookie, (socket, callback) => {
        socket.timeout(8000).emit("session:lock-items", scope, callback);
    });
}

export async function finalizeSessionThroughSocket(scope: SessionScope, cookie: string) {
    return runSessionCommand(cookie, (socket, callback) => {
        socket.timeout(8000).emit("session:finalize", scope, callback);
    });
}
