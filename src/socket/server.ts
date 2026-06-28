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
    console.log(`Connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Disconnected: ${socket.id}`);
    });
});

httpServer.listen(3001, () => {
    console.log("Socket server running on port 3001");
});