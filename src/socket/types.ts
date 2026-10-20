import type { MoodRoomPhase } from "../../generated/prisma/enums";

export const MAX_CHAT_MESSAGE_LENGTH = 5000;
export const MAX_CRAVING_LENGTH = 1000;
export const NOMINATION_TIMEOUT_MS = 60_000;

export interface SessionScope {
    roomId: string;
    sessionId: string;
}

export interface SessionMember {
    memberId: string;
    userId: string;
    displayName: string;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    type: "chat" | "join" | "leave";
    message: string;
    userId: string;
    username: string;
    createdAt: string;
    memberId: string;
}

export interface SessionPresence {
    sessionId: string;
    count: number;
    members: SessionMember[];
}

export type SocketResult = { ok: true } | { ok: false; error: string };
export type ChatSendResult = { ok: true; message: ChatMessage } | { ok: false; error: string };
export type SocketAck = (result: SocketResult) => void;

export interface SessionPrompt {
    memberId: string;
    displayName: string;
    prompt: string;
}

export interface RestaurantCandidate {
    restaurantId: string;
    name: string;
    image: string;
    cuisines: string[];
    rating: number;
    deliveryTime: string;
    costForTwo: string;
}

export interface RestaurantNominee extends RestaurantCandidate {
    matchReason: string;
}

export type RestaurantVotes = Record<string, { count: number; memberIds: string[] }>;

export interface SessionState {
    sessionId: string;
    phase: MoodRoomPhase;
    status: "ACTIVE" | "ENDED";
    hostId: string;
    updatedAt: string;
    members: SessionMember[];
    prompts: SessionPrompt[];
    restaurantNominees: RestaurantNominee[];
    nominationStatus: "IDLE" | "GENERATING" | "READY" | "FAILED";
    nominationStartedAt: string | null;
    nominationError: string | null;
    restaurantVotes: RestaurantVotes;
    selectedRestaurantId: string | null;
    itemVotes: Record<string, { quantity: number; voters: string[]; quantities: Record<string, number> }>;
    itemVotingLockedAt: string | null;
    result: SessionResultData | null;
}

export type SessionStateResult = { ok: true; state: SessionState } | { ok: false; error: string };

export interface PromptUpdateData extends SessionState {
    totalSubmitted: number;
}

export interface RestaurantVoteUpdateData extends SessionState {
    votes: RestaurantVotes;
}

export interface ItemVoteUpdateData {
    sessionId: string;
    votes: Record<string, { quantity: number; voters: string[]; quantities: Record<string, number> }>;
    state: SessionState;
}

export interface SessionResultData {
    restaurantId: string;
    restaurantName: string;
    restaurantImage: string;
    location: string;
    cuisines: string[];
    rating: number;
    deliveryTime: string;
    items: Array<{ id: string; name: string; price: number; quantity: number; image: string; veg: boolean }>;
    totalAmount: number;
}

export interface SessionPhaseData {
    nominees?: Array<{ restaurantId: string; matchReason: string }>;
    restaurantId?: string;
    result?: SessionResultData;
}

export interface ServerToClientEvents {
    "session:state": (state: SessionState) => void;
    "chat:message": (message: ChatMessage) => void;
    "chat:users": (data: SessionPresence) => void;
    "session:phase-changed": (data: { sessionId: string; phase: MoodRoomPhase; state: SessionState; data?: SessionPhaseData }) => void;
    "session:prompt-update": (data: PromptUpdateData) => void;
    "session:restaurant-vote-update": (data: RestaurantVoteUpdateData) => void;
    "session:item-vote-update": (data: ItemVoteUpdateData) => void;
    "session:finished": (data: { sessionId: string; result: SessionResultData }) => void;
}

export interface ClientToServerEvents {
    "session:join": (data: SessionScope, ack: SocketAck) => void;
    "session:leave": (data: SessionScope, ack?: SocketAck) => void;
    "chat:send": (data: SessionScope & { message: string }, ack: (result: ChatSendResult) => void) => void;
    "session:advance-phase": (data: SessionScope & { phase: MoodRoomPhase; allowPartial?: boolean; restaurantId?: string }, ack: (result: SessionStateResult) => void) => void;
    "session:submit-prompt": (data: SessionScope & { prompt: string }, ack: (result: SessionStateResult) => void) => void;
    "session:nominate-restaurants": (data: SessionScope, ack: (result: SessionStateResult) => void) => void;
    "session:vote-restaurant": (data: SessionScope & { restaurantId: string }, ack: (result: SessionStateResult) => void) => void;
    "session:vote-item": (data: SessionScope & { itemId: string; quantity: number }, ack: (result: SessionStateResult) => void) => void;
    "session:lock-items": (data: SessionScope, ack: (result: SessionStateResult) => void) => void;
    "session:finalize": (data: SessionScope, ack: (result: SessionStateResult) => void) => void;
}
