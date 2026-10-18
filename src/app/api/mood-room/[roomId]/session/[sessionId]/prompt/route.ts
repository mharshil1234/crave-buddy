import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cravingSchema, getSessionState, MoodRoomAccessError } from "@/lib/db/mood-room-voting";
import { submitPromptThroughSocket } from "@/lib/mood-room-socket-command";

type Context = { params: Promise<{ roomId: string; sessionId: string }> };

function errorResponse(error: unknown) {
    if (error instanceof MoodRoomAccessError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Craving request failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load or save cravings" }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const state = await getSessionState({ ...await params, userId: session.user.id });
        return NextResponse.json({ success: true, prompts: state.prompts, totalSubmitted: state.prompts.length, state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) throw new MoodRoomAccessError("Unauthorized", 401);
        const origin = req.headers.get("origin");
        if (origin && origin !== req.nextUrl.origin) throw new MoodRoomAccessError("Invalid request origin", 403);
        const scope = await params;
        await getSessionState({ ...scope, userId: session.user.id });
        const body: unknown = await req.json().catch(() => null);
        const prompt = cravingSchema.safeParse(body && typeof body === "object" && "prompt" in body ? body.prompt : null);
        if (!prompt.success) throw new MoodRoomAccessError("Enter a craving between 1 and 1000 characters", 400);
        const result = await submitPromptThroughSocket(scope, prompt.data, req.headers.get("cookie") || "");
        if (!result.ok) throw new MoodRoomAccessError(result.error, 409);
        return NextResponse.json({ success: true, prompts: result.state.prompts, state: result.state }, {
            headers: { "Cache-Control": "private, no-store" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
