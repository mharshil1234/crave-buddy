import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/socket/types";

export type MoodRoomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): MoodRoomSocket {
    return io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        autoConnect: false,
        withCredentials: true,
    });
}
