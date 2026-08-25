"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type Message = {
    id: string;
    message: string;
    userId: string;
    username: string;
    createdAt: string;
    type?: "chat" | "join" | "leave";
};

export default function ChatBox({ sessionId, username }: { sessionId: string; username: string }) {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const messagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleNewMessage = (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("chat:message", handleNewMessage);
        socket.emit("session:join", { sessionId, username });

        return () => {
            socket.off("chat:message", handleNewMessage);
        };
    }, [sessionId, username]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (input.trim() === "") return;
        socket.emit("chat:send", { sessionId, message: input, username });
        setInput("");
    }

    return (
        <div className="flex flex-col">
            <div>
                <h3 className="text-lg font-semibold mb-3">Chat</h3>
                <div ref={messagesRef} className="border rounded-lg h-96 overflow-auto p-4 bg-gradient-to-br from-gray-50 to-white space-y-3">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isSystemMessage = message.type === "join" || message.type === "leave";
                            if (isSystemMessage) {
                                return (
                                    <div key={message.id} className="flex justify-center">
                                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                            message.type === "join"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                            {message.message}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={message.id} className="mb-3">
                                    <div className="flex items-baseline gap-2">
                                        <strong className="text-blue-600 font-semibold">{message.username}</strong>
                                        <span className="text-xs text-gray-500">
                                            {new Date(message.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mt-1">{message.message}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg">
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
                        className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">Send</button>
                </form>
            </div>
        </div>
    );
}