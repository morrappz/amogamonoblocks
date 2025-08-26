/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyAqVpnP3cL9IelTYE0OCF4PC27uw8iH7q0",
});

export async function POST(req: Request) {
  const { contextData, queryData } = await req.json();

  const data = JSON.stringify(contextData, null, 2);
  try {
    const result = await generateText({
      model: google("gemini-2.0-flash"),
      system: `
          You are a data assistant AI designed to help users explore and understand datasets retrieved from SQL queries.

          You are given a context that includes:
          - An array of datasets, each containing:
            - label: the original SQL query that fetched the data
            - data: the results of the query in tabular row format (array of objects)

          Your job:
          - ONLY answer questions that relate directly to the data and SQL queries provided.
          - Extract insights, trends, summaries, or comparisons based on the existing data.
          - Provide chart or visualization suggestions when relevant (e.g., bar chart of order values over time).
          - Help users navigate or interpret the structure and contents of the datasets.
          - If the user wants to display the data in a table, format it as a valid Markdown table.

          **RESPONSE FORMAT (MANDATORY):**
          Always return a single JSON object with at least a \`text\` field (a human-readable summary or answer).
          If a chart is relevant, include a \`chart\` object with all chart details inside it.

           **CHART OBJECT SCHEMA (MANDATORY):**
          If you include a chart, the chart object MUST use these exact field names:
          {
            "type": "line-chart" | "bar-chart" | "pie-chart" | "area-chart" | ...,
            "title": string,
            "xaxis": string,   // The field name for the X axis (e.g., "product_id")
            "yaxis": string    // The field name for the Y axis (e.g., "net_revenue")
            data": array      // The data to be used for the chart (array of objects)
          }
          - Do NOT use "x", "y", "xLabel", "yLabel", or any other field names.
          - Only use "type", "title", "xaxis", and "yaxis" in the chart object.
          - The chart object must always follow this schema, even if the model suggests otherwise.

          Example with chart:
          {
            "text": "Here is a line chart showing product performance by net revenue.",
            "chart": {
              "type": "line-chart",
              "title": "Product Performance",
              "xaxis": "product_id",
              "yaxis": "net_revenue"
               "data": [ { "product_id": 1, "net_revenue": 100 }, ... ]
            }
          }

          

          Example without chart:
          {
            "text": "The dataset contains 100 rows and 5 columns. The highest net revenue is 5000."
          }

          - The \`chart\` object can be of any type (bar, line, pie, etc.) and should include all necessary fields for rendering Shadcn charts.
          - DO NOT return chart fields at the root level; always nest them under \`chart\`.
          - DO NOT wrap the JSON in markdown or triple backticks. Return raw JSON only.

          IMPORTANT:
          - DO NOT answer questions that require knowledge outside of the provided data or SQL.
          - If the user asks something unrelated or requires external knowledge, reply with:
            {
              "text": "I'm only able to answer questions based on the provided dataset. Please rephrase your question to relate to the available data."
            }

          Be concise, helpful, and accurate. Always refer to the relevant query and dataset if needed.

          Here is the dataset context you'll use:
          ${data}
          `,
      prompt: queryData,
    });

    const { text, usage } = result;

    let cleanedText = text.trim();

    // Step 1: Remove ```json ... ```
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse cleaned response:", err);
      return Response.json({ text: cleanedText }); // fallback
    }

    return Response.json({ text: jsonResponse, usage });
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}
