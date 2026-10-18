import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/socket/types";

export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    return io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        autoConnect: false,
        withCredentials: true,
    });
}
