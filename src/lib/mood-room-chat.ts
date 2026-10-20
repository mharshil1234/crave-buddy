import type { ChatMessage } from "@/socket/types";

export function mergeChatMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const messages = new Map(current.map((message) => [message.id, message]));
    incoming.forEach((message) => messages.set(message.id, message));
    return [...messages.values()].sort((first, second) =>
        first.createdAt.localeCompare(second.createdAt) || first.id.localeCompare(second.id)
    );
}
