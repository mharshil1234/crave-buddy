import { createServer } from "http";
import { randomUUID } from "crypto";
import { Server } from "socket.io";
import { z } from "zod";
import { auth } from "../lib/auth";
import {
    getSessionMember,
    MoodRoomAccessError,
    saveChatMessage,
    sessionScopeSchema,
} from "../lib/db/mood-room-voting";
import {
    MAX_CHAT_MESSAGE_LENGTH,
    type ClientToServerEvents,
    type ServerToClientEvents,
    type SessionMember,
    type SessionScope,
} from "./types";

interface SocketData {
    userId: string;
    scope?: SessionScope;
    member?: SessionMember;
}

const chatSchema = sessionScopeSchema.extend({
    message: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
});

export function createMoodRoomSocketServer() {
    const httpServer = createServer();
    const origins = (process.env.SOCKET_ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
        .split(",").map((origin) => origin.trim()).filter(Boolean);
    const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
        cors: { origin: origins, methods: ["GET", "POST"], credentials: true },
        maxHttpBufferSize: 32_768,
    });
    const sessionUsers = new Map<string, Map<string, SessionMember>>();
    const roomUsers = new Map<string, Map<string, SessionMember>>();
    const sessionChannel = (sessionId: string) => `session:${sessionId}`;

    const emitPresence = (sessionId: string) => {
        const members = [...new Map(
            [...(sessionUsers.get(sessionId)?.values() ?? [])].map((member) => [member.memberId, member])
        ).values()];
        io.to(sessionChannel(sessionId)).emit("chat:users", { sessionId, count: members.length, members });
    };

    io.use(async (socket, next) => {
        try {
            const headers = new Headers();
            headers.set("cookie", socket.request.headers.cookie || "");
            const userSession = await auth.api.getSession({ headers });
            if (!userSession) return next(new Error("Sign in to join session chat"));
            socket.data.userId = userSession.user.id;
            next();
        } catch (error) {
            console.error("Socket authentication failed:", error);
            next(new Error("Unable to authenticate session chat"));
        }
    });

    io.on("connection", (socket) => {
        let queue = Promise.resolve();
        const enqueue = (operation: () => Promise<void>) => {
            queue = queue.then(operation).catch((error: unknown) => {
                console.error("Socket operation failed:", error);
            });
        };

        const leaveSession = async () => {
            const { scope, member } = socket.data;
            if (!scope || !member) return;
            delete socket.data.scope;
            delete socket.data.member;
            await socket.leave(sessionChannel(scope.sessionId));

            const users = sessionUsers.get(scope.sessionId);
            users?.delete(socket.id);
            if (users?.size === 0) sessionUsers.delete(scope.sessionId);
            const roomMembers = roomUsers.get(scope.roomId);
            roomMembers?.delete(socket.id);
            if (roomMembers?.size === 0) roomUsers.delete(scope.roomId);

            if (![...(users?.values() ?? [])].some((user) => user.memberId === member.memberId)) {
                io.to(sessionChannel(scope.sessionId)).emit("chat:message", {
                    id: randomUUID(), sessionId: scope.sessionId, type: "leave",
                    message: `${member.displayName} left the session`, username: member.displayName,
                    userId: member.userId, memberId: member.memberId, createdAt: new Date().toISOString(),
                });
            }
            emitPresence(scope.sessionId);
        };

        const reportError = (error: unknown, ack?: (result: { ok: false; error: string }) => void) => {
            const message = error instanceof MoodRoomAccessError ? error.message : "Unable to complete chat request";
            if (!(error instanceof MoodRoomAccessError)) console.error("Chat request failed:", error);
            if (typeof ack === "function") ack({ ok: false, error: message });
        };

        socket.on("session:join", (payload, ack) => enqueue(async () => {
            try {
                const parsed = sessionScopeSchema.safeParse(payload);
                if (!parsed.success) throw new MoodRoomAccessError("Invalid room or session ID", 400);
                const scope = parsed.data;
                const { member } = await getSessionMember({ ...scope, userId: socket.data.userId });
                if (!socket.connected) return;
                if (socket.data.scope?.sessionId === scope.sessionId) {
                    emitPresence(scope.sessionId);
                    if (typeof ack === "function") ack({ ok: true });
                    return;
                }
                await leaveSession();
                await socket.join(sessionChannel(scope.sessionId));
                const connectedMember = { memberId: member.id, userId: socket.data.userId, displayName: member.displayName };
                const users = sessionUsers.get(scope.sessionId) ?? new Map<string, SessionMember>();
                const alreadyPresent = [...users.values()].some((user) => user.memberId === member.id);
                users.set(socket.id, connectedMember);
                sessionUsers.set(scope.sessionId, users);
                const roomMembers = roomUsers.get(scope.roomId) ?? new Map<string, SessionMember>();
                roomMembers.set(socket.id, connectedMember);
                roomUsers.set(scope.roomId, roomMembers);
                socket.data.scope = scope;
                socket.data.member = connectedMember;

                if (!alreadyPresent) {
                    io.to(sessionChannel(scope.sessionId)).emit("chat:message", {
                        id: randomUUID(), sessionId: scope.sessionId, type: "join",
                        message: `${member.displayName} joined the session`, username: member.displayName,
                        userId: socket.data.userId, memberId: member.id, createdAt: new Date().toISOString(),
                    });
                }
                emitPresence(scope.sessionId);
                if (typeof ack === "function") ack({ ok: true });
            } catch (error) {
                reportError(error, ack);
            }
        }));

        socket.on("session:leave", (payload, ack) => enqueue(async () => {
            try {
                const parsed = sessionScopeSchema.safeParse(payload);
                if (!parsed.success) throw new MoodRoomAccessError("Invalid room or session ID", 400);
                if (socket.data.scope?.sessionId === parsed.data.sessionId && socket.data.scope.roomId === parsed.data.roomId) {
                    await leaveSession();
                }
                if (typeof ack === "function") ack({ ok: true });
            } catch (error) {
                reportError(error, ack);
            }
        }));

        socket.on("chat:send", (payload, ack) => enqueue(async () => {
            try {
                const parsed = chatSchema.safeParse(payload);
                if (!parsed.success) throw new MoodRoomAccessError(`Enter a message between 1 and ${MAX_CHAT_MESSAGE_LENGTH} characters`, 400);
                const { roomId, sessionId, message } = parsed.data;
                if (!socket.connected || socket.data.scope?.sessionId !== sessionId || socket.data.scope.roomId !== roomId) {
                    throw new MoodRoomAccessError("Join this session before sending messages", 403);
                }
                const { member } = await getSessionMember({ roomId, sessionId, userId: socket.data.userId });
                const saved = await saveChatMessage({ sessionId, memberId: member.id, content: message });
                io.to(sessionChannel(sessionId)).emit("chat:message", saved);
                if (typeof ack === "function") ack({ ok: true, message: saved });
            } catch (error) {
                reportError(error, ack);
            }
        }));

        socket.on("disconnect", () => enqueue(leaveSession));
    });

    return { httpServer, io };
}
