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

io.on("connection", (socket) => {

    socket.on("session:join", ({ sessionId }) => {
        socket.join(sessionId);
    });

    socket.on("chat:send", ({ sessionId, message, username }) => {
        io.to(sessionId).emit("chat:message", { 
            id: crypto.randomUUID(),
            message,
            userId: socket.id,
            username,
            createdAt: new Date().toISOString()
        });
    });

});

httpServer.listen(3001, () => {
    console.log("Socket server running on port 3001");
});