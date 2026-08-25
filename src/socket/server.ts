import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

const sessionUsers = new Map<string, Map<string, string>>();

io.on("connection", (socket) => {

    socket.on("session:join", ({ sessionId, username }) => {
        socket.join(sessionId);

        if (!sessionUsers.has(sessionId)) {
            sessionUsers.set(sessionId, new Map());
        }
        const users = sessionUsers.get(sessionId)!;
        const displayName = username || "A user";

        if (!users.has(socket.id)) {
            users.set(socket.id, displayName);
            io.to(sessionId).emit("chat:message", {
                id: crypto.randomUUID(),
                type: "join",
                message: `${displayName} joined the session`,
                username: displayName,
                userId: socket.id,
                createdAt: new Date().toISOString()
            });
            io.to(sessionId).emit("chat:users", { count: users.size });
        }
    });

    socket.on("chat:send", ({ sessionId, message, username }) => {
        io.to(sessionId).emit("chat:message", {
            id: crypto.randomUUID(),
            type: "chat",
            message,
            userId: socket.id,
            username,
            createdAt: new Date().toISOString()
        });
    });

    socket.on("disconnect", () => {
        sessionUsers.forEach((users, sessionId) => {
            if (users.has(socket.id)) {
                const username = users.get(socket.id) || "A user";
                users.delete(socket.id);
                io.to(sessionId).emit("chat:message", {
                    id: crypto.randomUUID(),
                    type: "leave",
                    message: `${username} left the session`,
                    username,
                    userId: socket.id,
                    createdAt: new Date().toISOString()
                });
                if (users.size === 0) {
                    sessionUsers.delete(sessionId);
                } else {
                    io.to(sessionId).emit("chat:users", { count: users.size });
                }
            }
        });
    });

});

httpServer.listen(3001, () => {
    console.log("Socket server running on port 3001");
});