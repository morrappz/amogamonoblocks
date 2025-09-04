import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function executeAIPrompt(prompt: string) {
  const result = await generateText({
    model: google("gemini-2.0-flash"),
    prompt: prompt,
    system:
      "You are a helpful assistant and generate a simple response within 100 words",
  });

  return result.text;
}
