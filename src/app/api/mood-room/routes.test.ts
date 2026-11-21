import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getSession = vi.fn();
const db = vi.hoisted(() => ({ createRoom: vi.fn(), joinRoom: vi.fn(), checkRoomMembership: vi.fn(), getRoom: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: (...args: unknown[]) => getSession(...args) } } }));
vi.mock("@/lib/db/mood-room", () => db);

import { POST as createRoute } from "./create/route";
import { POST as joinRoute } from "./join/route";
import { GET as getRoomRoute } from "./[roomId]/route";

const ROOM_ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const post = (path: string, body: unknown) =>
    new NextRequest(`http://localhost${path}`, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
const getRoom = (roomId: string) => getRoomRoute(new NextRequest(`http://localhost/api/mood-room/${roomId}`), { params: Promise.resolve({ roomId }) });

beforeEach(() => vi.clearAllMocks());

describe("mood room routes without a session", () => {
    beforeEach(() => getSession.mockResolvedValue(null));

    it("create returns 401 and never touches the DB", async () => {
        const res = await createRoute(post("/api/mood-room/create", { moodRoomName: "Lunch", displayName: "Me", hostId: "spoofed" }));
        expect(res.status).toBe(401);
        expect(db.createRoom).not.toHaveBeenCalled();
    });

    it("join returns 401", async () => {
        const res = await joinRoute(post("/api/mood-room/join", { inviteCode: "ABC123", displayName: "Me" }));
        expect(res.status).toBe(401);
        expect(db.joinRoom).not.toHaveBeenCalled();
    });

    it("room details return 401", async () => {
        expect((await getRoom(ROOM_ID)).status).toBe(401);
    });
});

describe("mood room routes with a session", () => {
    beforeEach(() => getSession.mockResolvedValue({ user: { id: "user-1" } }));

    it("create uses the session user as host, not the body", async () => {
        db.createRoom.mockResolvedValue({ id: ROOM_ID });
        const res = await createRoute(post("/api/mood-room/create", { moodRoomName: "Lunch", displayName: "Me", hostId: "spoofed" }));
        expect(res.status).toBe(201);
        expect(db.createRoom).toHaveBeenCalledWith({ moodRoomName: "Lunch", displayName: "Me", hostId: "user-1" });
    });

    it("room details return 400 for a bad id and 403 for non-members", async () => {
        expect((await getRoom("not-a-uuid")).status).toBe(400);
        db.checkRoomMembership.mockResolvedValue(false);
        expect((await getRoom(ROOM_ID)).status).toBe(403);
        expect(db.getRoom).not.toHaveBeenCalled();
    });

    it("room details return the room for members", async () => {
        db.checkRoomMembership.mockResolvedValue(true);
        db.getRoom.mockResolvedValue({ id: ROOM_ID });
        const res = await getRoom(ROOM_ID);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: ROOM_ID });
    });
});
