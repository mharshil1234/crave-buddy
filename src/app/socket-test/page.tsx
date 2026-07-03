"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketTest() {
    useEffect(() => {
        const socket = io("http://localhost:3001");

        socket.on("user-joined", (user) => {
            console.log("Joined:", user.id);
        });

        socket.on("disconnect", () => {
            console.log("Bro left");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Socket Test</h1>
            <p>Open the browser console and your socket server terminal.</p>
        </div>
    );
}