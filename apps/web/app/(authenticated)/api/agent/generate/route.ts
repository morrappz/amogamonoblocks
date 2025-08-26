/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "edge";

// Types
interface CardData {
  value: number | string;
  label: string;
}

interface ChartEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ChartData {
  data: ChartEntry[];
  label: string;
}

interface BoardContextData {
  cardDataForAI?: Record<string, CardData>;
  chartsData?: Record<string, ChartData>;
}

interface RequestBody {
  prompt: string;
  fileUrl?: string;
  audioUrl?: string;
  boardContextData?: BoardContextData;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCardData(cards: Record<string, CardData>): string {
  return Object.entries(cards)
    .map(
      ([key, { value, label }]) =>
        `- ${capitalize(key)}: ${value} (Query: ${label})`
    )
    .join("\n");
}

function formatChartData(charts: Record<string, ChartData>): string {
  return Object.entries(charts)
    .filter(([_, chart]) => Array.isArray(chart.data) && chart.data.length > 0)
    .map(([chartType, chart]) => {
      const { data, label } = chart;
      const chartHeader = `${capitalize(chartType)} (Query: ${label}):`;
      const points = data.map((item) => {
        const labelKey = Object.keys(item).find(
          (k) => k !== "value" && k !== "label"
        );
        const valueKey = Object.keys(item).find(
          (k) => k !== labelKey && k !== "label"
        );
        return `- ${labelKey ? item[labelKey] : "Unknown"}: ${
          valueKey ? item[valueKey] : "Unknown"
        }`;
      });
      return `${chartHeader}\n${points.join("\n")}`;
    })
    .join("\n\n");
}

function buildSystemPrompt(boardContextData: BoardContextData): string {
  const cardSection = boardContextData.cardDataForAI
    ? formatCardData(boardContextData.cardDataForAI)
    : "No card data available.";

  const chartSection = boardContextData.chartsData
    ? formatChartData(boardContextData.chartsData)
    : "No chart data available.";

  return `You are a business data assistant that answers questions strictly based on the provided board data. Do not assume or invent any data.

Cards Summary:
${cardSection}

Charts Summary:
${chartSection}

Guidelines:
- Answer only based on the provided data.
- Reference SQL labels if relevant to the explanation.
- If the question can't be answered from the data, respond with:
  "I'm sorry, that information is not available in the board data."
- Do not tell users to check the chart. Always give a direct answer.`;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { prompt, fileUrl, audioUrl, boardContextData } = body;

    let userContent = prompt;
    let systemContent = "";

    if (boardContextData && Object.keys(boardContextData).length > 0) {
      systemContent = buildSystemPrompt(boardContextData);
    } else {
      systemContent = `You are a helpful assistant, but no board data was provided.\nIf the user asks a data question, respond with:\n\"I'm sorry, I don't have any board data to work with right now. Please provide board data for accurate answers.\"`;
    }

    if (fileUrl) {
      userContent += `\n\nThe user has shared a file available at: ${fileUrl}`;
    }

    if (audioUrl) {
      userContent += `\n\nThe user has shared an audio file available at: ${audioUrl}`;
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
          ],
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text();
      return new Response(err, { status: openaiResponse.status });
    }

    return new Response(openaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return new Response("Error fetching from OpenAI", { status: 500 });
  }
}
