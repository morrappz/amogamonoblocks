import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCbROdy5OR4F1pT6anpxbagyABn2vbeqHE",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `
      You are a helpful assistant that suggests follow-up questions based on a conversation history.
      Your task is to generate 3-5 relevant follow-up questions that the user might want to ask next.
      The questions should be directly related to the conversation context and help the user explore the data further.
      Return ONLY the questions as a JSON array of strings, with no additional text or explanation.
      IF you mention a couloumn name or detiled information to get make sure its exists.
      Example: ["How many tasks are overdue?", "What's the distribution of tasks by priority?", "Who has the most assigned tasks?"]
      `,
      prompt: JSON.stringify(messages),
    });

    // Parse the response as JSON
    let suggestions;
    try {
      suggestions = JSON.parse(text);
    } catch {
      // If parsing fails, try to extract an array from the text
      const match = text.match(/\[(.*)\]/s);
      if (match) {
        try {
          suggestions = JSON.parse(`[${match[1]}]`);
        } catch {
          // If that fails too, split by newlines or commas
          suggestions = text
            .split(/[\n,]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s.includes("?"))
            .slice(0, 5);
        }
      } else {
        // Last resort: split by newlines or commas
        suggestions = text
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.includes("?"))
          .slice(0, 5);
      }
    }

    // Ensure we have an array of strings
    if (!Array.isArray(suggestions)) {
      suggestions = [];
    }

    return Response.json({ suggestions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return Response.json(
      {
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
