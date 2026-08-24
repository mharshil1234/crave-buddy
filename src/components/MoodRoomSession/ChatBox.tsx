"use client";

import { useRef, useState } from "react";

export default function ChatBox() {
    const [input, setInput] = useState("");
    const messagesRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Chat</h3>
                <div ref={messagesRef} className="border rounded-md h-72 overflow-auto p-3 bg-white"></div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 p-4 bg-white/80 backdrop-blur-md border-t">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
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