import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  HttpResponseOutputParser,
  StructuredOutputParser,
} from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const selectedLanguage = body.language;
    const aiModel = body?.aiModel;

    if (!aiModel || aiModel === null) {
      return NextResponse.json(
        { error: "AI model not provided" },
        { status: 400 }
      );
    }
    const provider = aiModel?.provider;
    let providerModel;

    if (["google", "openai"].includes(provider)) {
      providerModel = aiModel?.model;
    }

    const TEMPLATE = `
        You are a helpful assistant that can provide responses in multiple formats:

        1. **For regular text/conversation**: Return plain text or markdown
        2. **For tabular data**: Return markdown tables
        3. **For visual data that would be better as charts**: Return JSON with chart data

        ## Response Format Guidelines:

        ### For Regular Text:
        Respond with plain text or markdown.

        ### For Tables (Custom Rendering):
        When the user asks for a table or when data is best represented as a table (but not chart-worthy), return JSON in the following format:

        {{
          "content": "Here is the table you requested.",
          "table": {{
            "headers": ["Column 1", "Column 2", "Column 3"],
            "rows": [
              ["Data 1", "Data 2", "Data 3"],
              ["Data 4", "Data 5", "Data 6"]
            ]
          }}
        }}


        ### For Charts Only:
        When the user specifically asks for charts or when data is better visualized as a chart, return JSON:

        {{
          "content": "Here is a chart showing the data you requested.",
          "chart": {{
            "type": "pie-chart",
            "title": "Chart Title",
            "labels": ["Label1", "Label2", "Label3"],
            "data": [30, 25, 45],
          }}
        }}

        ### For Analytic Card Only:
        When the user specifically asks for data in analytic card, return JSON:

        When the user asks for analytics, respond using the following format:

        {{
          "content": "Here is your analytics card:",
          "analyticCard": {{
            "title": "Some title",
            "description": "Optional summary",
            "tabs": {{
              "table": {{
                "headers": ["Col1", "Col2"],
                "rows": [["A", "100"], ["B", "200"]]
          }},
              "chart": {{
                "type": "bar-chart",
                "xAxis": "Col1",
                "yAxis": "Col2",
                "data": [
                  {{ "label": "A", "value": 100 }},
                  {{ "label": "B", "value": 200 }}
                ]
          }}
          }}
          }}
          }}

        ### For Analytic Card With File Download API Only:
        When the user specifically asks for data in analytic card with file download api, return JSON:

        When the user asks for analytic card with file download api, respond using the following format:

        And also generate a valid story based on data and generate chart type and provide x and y axis, to render chart

        {{
        "analyticCardWithFileApi": {{
          "table": {{
            "title": "Some title",
            "description": "Optional summary",
            "data": {{
              "headers": ["Col1", "Col2"],
              "rows": [
                ["A", "100"],
                ["B", "200"]
              ]
          }}
          }},
          "chart": {{
            "title": "Some title",
            "description": "Optional summary",
            "chartData": {{
              "type": "bar-chart",
              "xAxis": "Col1",
              "yAxis": "Col2",
              "data": [
                {{ "label": "A", "value": 100 }},
                {{ "label": "B", "value": 200 }}
              ]
          }}
          }},
          "story": {{
            "title": "Some title",
            "description": "Optional summary",
            "data": [
              "Row A has a value of 100.",
              "Row B has a value of 200."
            ]
          }}
          }}
          }}



        **Chart types available**: "bar-chart", "line-chart", "pie-chart", "doughnut-chart", "radar-chart", "polar-area-chart"

        ## Decision Making:
        - Use **plain text/markdown** for: explanations, conversations, lists, tables
        - Use **JSON charts** only when: user explicitly asks for charts, or when data visualization would be significantly more helpful than a table

        ## Strict Rule for Consistent Data:
        Always ensure the chart output exactly matches the following JSON structure:

        "chart": {{
          "title": "Some title",
          "description": "Optional summary",
          "chartData": {{
            "type": "bar-chart",
            "xAxis": "Col1",
            "yAxis": "Col2",
            "data": [
              {{ "label": "A", "value": 100 }},
              {{ "label": "B", "value": 200 }}
            ]
          }}
          }}

        ## always give the chart data in x and y axis as above structure, dont give label and data

        Conversation so far:
        {chat_history}

        User: {input}
        (Note: respond in {language} language.)
`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    /**
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */

    const modelsMap = {
      openai: new ChatOpenAI({
        temperature: 0.8,
        model: providerModel,
        apiKey: aiModel?.key,
      }),
      google: new ChatGoogleGenerativeAI({
        temperature: 0.8,
        model: providerModel,
        apiKey: aiModel?.key,
      }),
      grok: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
      }),
      mistral: new ChatMistralAI({
        model: "mistral-large-latest",
        temperature: 0,
      }),
      claude: new ChatAnthropic({
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
      }),
      deepseek: new ChatDeepSeek({
        model: "deepseek-reasoner",
        temperature: 0,
      }),
    };

    const model = modelsMap[provider];
    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
      language: selectedLanguage,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
