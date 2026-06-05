import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function testAI() {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "Say hello",
  });

  return text;
}