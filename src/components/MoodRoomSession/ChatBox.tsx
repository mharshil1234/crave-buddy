"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type Message = {
    id: string;
    message: string;
    userId: string;
    username: string;
    createdAt: string;
};

export default function ChatBox({ sessionId, username }: { sessionId: string; username: string }) {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const messagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        console.log(username);
        
        socket.emit("session:join", { sessionId });

        const handleNewMessage = (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("chat:message", handleNewMessage);

        return () => {
            socket.off("chat:message", handleNewMessage);
        };

    }), [sessionId];

    const handleSendMessage = () => {
        if (input.trim() === "") return;
        socket.emit("chat:send", { sessionId, message: input, username });
        setInput("");
    }

    return (
        <>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Chat</h3>
                <div ref={messagesRef} className="border rounded-md h-72 overflow-auto p-3 bg-white">
                    <div>
                        {messages.map((message) => (
                            <div key={message.id} className="mb-2">
                                <strong className="text-blue-600">{message.username}:</strong>
                                <span className="ml-2">{message.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 p-4 bg-white/80 backdrop-blur-md border-t">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2 items-center"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-md border px-3 py-2 focus:outline-none"
                    />
                    <button type="submit" className="rounded-md bg-blue-600 text-white px-4 py-2">Send</button>
                </form>
            </div>
        </>
    );
}