import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "No data provided for analysis" },
        { status: 400 }
      );
    }

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4-turbo-preview",
    });

    const analysisTemplate = `You are a helpful AI assistant that suggests  ONLY data-analysis related follow-up questions a user might ask based on the provided conversation history.
- Provide 10 concise, relevant follow-up questions.
- Each suggestion should be a complete question a user could ask.
- IMPORTANT: Respond ONLY with a JSON array of strings in the format: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
- Do not add any other text, explanation, or formatting.
- Here is the data provided:
{data}
Generate suggestions strictly based on this data.`;

    const prompt = PromptTemplate.fromTemplate(analysisTemplate);
    const chain = prompt.pipe(model);

    const result = await chain.invoke({
      data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    });

    let content = String(result.content || "").trim();

    // Remove code fences if present
    content = content.replace(/```json\s*([\s\S]*?)\s*```/i, "$1").trim();
    content = content.replace(/```([\s\S]*?)```/g, "$1").trim();

    let suggestions: string[] = [];

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        suggestions = parsed;
      }
    } catch {
      // Fallback: extract first JSON array in string
      const match = content.match(/\[([\s\S]*?)\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            suggestions = parsed;
          }
        } catch {
          suggestions = [];
        }
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in analyze-data API:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}
