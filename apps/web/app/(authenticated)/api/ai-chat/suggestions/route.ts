import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCbROdy5OR4F1pT6anpxbagyABn2vbeqHE",
});

export async function POST(req: Request) {
  const contextData = await req.json();

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `
        You are an intelligent data assistant. You will be given an array of objects, each containing:
            - a SQL query used to retrieve the data
            - the actual data rows returned from the query
            The structure looks like this:
            [
            {
                label: "SQL QUERY HERE",
                data: [
                { column1: value, column2: value, ... },
                ...
                ]
            },
            ...
            ]
            Use this context to do the following:
            1. Analyze each dataset and understand what the query is doing.
            2. Use the data + the SQL to understand the schema and meaning of each dataset.
            3. Suggest natural language **follow-up questions** or **insights** a user might ask based on the data.
            4. Suggest **visualization prompts**, including:
            - Recommended chart types (bar, line, pie, scatter, etc.)
            - What should be on the X and Y axis for each chart
            - Why the chart is relevant to the data

            **Important Notes:**
            - Only use the provided data and SQL queries to make suggestions.
            - The user may not be technical, so make the suggested prompts easy to understand.
            - Focus on **insightful**, **actionable**, or **interesting** queries that could be asked about the data.
            - Prefer aggregation-based suggestions if the data allows (e.g., totals, trends, comparisons).

            Return only a **valid JSON array of strings**. Do not include numbers or additional formatting. Do not include any explanations or markdown.

            Example output:
            [
            "What is the total number of orders?",
            "Who are the top customers by payment amount?",
            "Show me a chart of order count over time.",
            "What is the average order value?",
            "How many orders were placed in the last 30 days?"
            ]

            Now, use the data below to generate:
            - 5 natural language follow-up questions or prompts
            - 3 chart suggestions (with type, X axis, Y axis, and what insight it gives)

            Here is the data context:
            {contextData}

        `,
      prompt: JSON.stringify(contextData),
    });

    // Parse the response as JSON
    let suggestions;
    try {
      suggestions = JSON.parse(text).map((string: string) =>
        string.trim().replace(/^"|"$/g, "")
      );
    } catch {
      // If parsing fails, try to extract an array from the text
      const match = text.match(/\[(.*)\]/);
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
