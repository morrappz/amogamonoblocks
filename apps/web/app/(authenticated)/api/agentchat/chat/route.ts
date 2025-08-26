import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { generateChart, generateSuggestions } from "@/src/mastra/tools";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { MastraMCPServerDefinition, MCPClient } from "@mastra/mcp";
import { v4 as uuidv4 } from "uuid";

// const google = createGoogleGenerativeAI({
//   apiKey: "AIzaSyA5Hgm8Y1Zc40U6XyekCki573ABDNftchc",
// });

const MCP_SERVER_URLS: Record<string, string> = {
  woocommerce: "https://automate.morr.biz/mcp/woo-mcp/sse",
  // woocommerce: "https://automate.morr.biz/mcp/woocommerce-mcp/sse",
  shopify: "https://automate.morr.biz/mcp/shopify-mcp/sse",
  // postgresql: "https://automate.morr.biz/mcp/postgres-mcp/sse",
};

export async function POST(req: Request) {
  let userMcp: MCPClient | undefined;
  try {
    const session = await auth();
    const { messages, assistantIdentifier } = await req.json();

    if (!session?.user?.user_catalog_id) {
      throw new Error("didnt find user sesssion");
    }

    const { data, error } = await postgrest
      .from("form_setup")
      .select("form_id, data_connection_json, db_connection_json")
      .eq("form_id", assistantIdentifier)
      .single();

    // alsso chck that data.data_connection_json should have at last on configiration, it same as const config
    if (error || !data) {
      throw new Error(
        error?.message || "can not load connections for this agent"
      );
    }
    if (
      !Array.isArray(data.data_connection_json) ||
      data.data_connection_json.length === 0
    ) {
      throw new Error("No data connections configured for this agent.");
    }
    const config = [...data.data_connection_json];

    // const config = [
    //   {
    //     id: "woostore",
    //     type: "woocommerce",
    //     auth: {
    //       mparam_ck: "ck_a68b0e405e2fc9f028f4c983ab66064b741bec7e",
    //       mparam_cs: "cs_9be6487459850c3af0a541e58f413924c69a9689",
    //     },
    //     config: {
    //       mparam_url: "https://demo.offr.my/wp-json/wc/v3",
    //     },
    //   },
    // ];

    const servers: Record<string, MastraMCPServerDefinition> = {};

    for (const conn of config) {
      const url = MCP_SERVER_URLS[conn.type];
      if (!url) continue;
      servers[conn.id] = {
        url: new URL(url),
        enableServerLogs: true,
        // requestInit: {
        //   headers: {
        //     ...conn.auth,
        //     ...conn.config,
        //   },
        // },
      };
    }

    const userMcp = new MCPClient({
      id: "mcp-client-" + String(session?.user?.user_catalog_id),
      servers: {
        ...servers,
      },
    });

    const allTools = await userMcp.getTools();

    function withExtraParams(tool) {
      return {
        ...tool,
        // inputSchema: inputSchema,
        async execute({
          context,
          runtimeContext,
        }: {
          context: unknown;
          runtimeContext?: RuntimeContext | null;
        }) {
          let newContext = { ...context };
          const extraParams = {};

          const toolPrefix = tool.id?.split("_")[0];
          const matchedConfig = config.find((c) => c.id === toolPrefix);
          if (matchedConfig && matchedConfig.auth) {
            Object.assign(extraParams, matchedConfig.auth);
          }
          if (matchedConfig && matchedConfig.config) {
            Object.assign(extraParams, matchedConfig.config);
          }

          if (context && typeof context.input === "string") {
            try {
              const parsedInput = JSON.parse(context.input);
              const mergedInput = { ...parsedInput, ...extraParams };
              newContext.input = JSON.stringify(mergedInput);
            } catch {}
          } else if (context && typeof context === "object" && !context.input) {
            newContext = { ...context, ...extraParams };
          }
          console.log(
            "contextt,,,,inputinput : ",
            context,
            "  , new: ",
            newContext,
            "tool.id",
            tool.id
          );

          return tool.execute({
            context: newContext,
            ...runtimeContext,
          });
        },
      };
    }

    const wrappedTools = Object.fromEntries(
      Object.entries(allTools).map(([name, tool]) => [
        name,
        withExtraParams(tool),
      ])
    );

    const agent = new Agent({
      name: "E-commerce Analytics Agent",
      instructions: `
          You are a highly proficient AI E-commerce Analytics Specialist. Your primary function is to provide data-driven insights and actionable intelligence to help users understand and optimize their e-commerce operations. You are an expert in analyzing sales, stock, customer behavior, and overall business performance.
    
          Your Core Directives:
    
          1.  **Analytical Excellence:**
              *   Thoroughly analyze user queries to understand the underlying information need.
              *   Leverage available tools (WooCommerce API tools, PostgreSQL queries in the future) to retrieve precise and relevant data.
              *   Synthesize data into clear, concise, and insightful analyses. Focus on trends, patterns, anomalies, key performance indicators (KPIs), and potential areas for strategic improvement.
    
          2.  **Prioritize Visual Insights (Charts):**
              *   Whenever data lends itself to visualization, **you MUST prioritize generating a chart** using the 'generateChart' tool. Charts are the preferred method for conveying complex data and trends.
              *   When a chart is generated, **you MUST provide a concise, professional narrative** immediately following or alongside the chart. This narrative should:
                  *   Clearly explain what the chart represents.
                  *   Highlight key takeaways, significant trends, or important data points visible in the chart.
                  *   Relate the chart's findings directly to the user's query or the analytical context.
              *   If a chart is not feasible or appropriate for the specific data (e.g., a single data point, qualitative information), presenting data in a well-structured table (which 'generateChart' can also do if only data is passed) is acceptable, accompanied by a similar analytical narrative.
    
          3.  **Professional and Direct Communication:**
              *   **Maintain a strictly professional and direct tone.**
              *   **DO NOT use conversational fillers** such as "I will now fetch the data...", "Let me analyze this for you...", "Okay, I'm going to...", or "Here is the chart I generated...".
              *   Proceed directly to presenting the analysis, data, charts, and insights. Assume the user expects immediate, expert-level information.
              *   Your responses should be factual, data-backed, and objective.
    
          4.  **Proactive Guidance (Suggestions):**
              *   After successfully providing an analysis, report, or answering a query, **you MUST silently generate 2-3 relevant follow-up questions** or areas for further exploration.
              *   These suggestions should be contextually relevant to the current discussion and aim to guide the user towards deeper insights or related analytical paths.
              *   **Invoke the 'generateSuggestions' tool with these suggestions.**
              *   **CRITICAL: These generated suggestions are for internal system use ONLY. DO NOT include them in your textual response to the user. They must ONLY be passed to the 'generateSuggestions' function.**
              *   only pass the Suggestions to the 'generateSuggestions' function DO NOT WRITE IT IN RESPONSE.
    
          5.  **Tool Usage Specifics:**
    
              *   **'generateChart' Tool:**
                  *   When generating charts, ensure both X and Y axes are clearly and meaningfully labeled.
                  *   Utilize a variety of distinct, professional colors (e.g., a palette of contrasting neon or business-appropriate colors) for chart elements to enhance readability and distinction. Avoid using the same color for all data series unless specifically appropriate.
                  *   Remember that chart plugins are not available; work within the core capabilities.
                  *   The 'generateChart' tool will display both the chart and a table of the underlying data. Your narrative should focus on interpreting the chart primarily.
    
              *   **WooCommerce API Tools:**
                  *   Utilize the suite of WooCommerce API tools (e.g., "List WooCommerce Products", "Retrieve WooCommerce Sales Report", "Get WooCommerce Customer by ID") to fetch necessary data. Select the most appropriate tool(s) for the query.
                  *   Be mindful of parameters (e.g., date ranges for reports, 'per_page' for lists, 'order', 'orderby' ) to retrieve data efficiently.
                  *   Make sure to pass all reaquired params.
                  *   This are built on top of some WooCommerce V3 API "not all". so make sure to pass correct prams. if you can not get an information based on this tools just answer that i cant, do not give me incorect data.
                  *   make sure that you have the required data before anwser, if no make other requet until you get the rigth data.
                  *   any pram start with 'mparam' pass "dataofnp" on it.
                  *   you may be linked to multi stores so you can know the stroe from tool first word "storename_toolname"
                  
              *   **Shopify API Tools:**
                  *   Utilize the suite of Shopify API tools (e.g., "List Shopify Products", "Retrieve Shopify Orders", "Get Shopify Customer by ID") to fetch necessary data. Select the most appropriate tool(s) for the query.
                  *   Be mindful of parameters (e.g., date ranges for reports, 'limit' for lists, 'status' for orders, 'sort_key') to retrieve data efficiently.
                  *   Make sure to pass all required params as defined by the tool's schema.
                  *   These tools are built on top of Shopify's API (GraphQL). If you cannot get information based on these tools, just answer that you can't, do not give incorrect data.
                  *   Make sure that you have the required data before answering; if not, make other requests until you get the right data.
                  *   You may be linked to multiple Shopify stores. The tool name will often be prefixed with the store identifier (e.g., "shopifystore_listOrders"). Use this to understand context.
                  *   Authentication and base configuration parameters (like store URL or access tokens, often prefixed with 'mparam_') are typically handled by the system; focus on the data-retrieval parameters specific to your query.
    
          6.  **Data Interpretation and Context:**
              *   Always interpret data within the context of the user's business and their specific questions.
              *   If data is insufficient or a query is ambiguous, politely state the limitation or ask for specific clarification to provide the most accurate analysis. Do not speculate without a data basis.
    
          Your goal is to be an indispensable analytical partner, transforming raw data into clear understanding and strategic direction for the user.
    
          **IMPORTANT** : if you cant get an information based on tools that you have , just answer that you cant dont give me wrong informations.
    `,
      // model: google("gemini-2.5-flash-preview-05-20"),
      model: openai("gpt-4o"),
      tools: { generateChart, generateSuggestions, ...wrappedTools },
    });

    // const filteredTools = Object.fromEntries(
    //   Object.entries(allTools).filter(
    //     ([toolName]) => toolName !== "myServer_news"
    //   )
    // );

    const result = await agent.stream(messages, {
      experimental_generateMessageId: () => uuidv4(),
    });

    // for (const chunk in result.fullStream) {
    //   console.log("chunk", chunk);
    // }

    return result.toDataStreamResponse({
      getErrorMessage(error) {
        return `An error occurred while processing your request. ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`;
      },
    });
  } catch (error) {
    console.error({ error });
    return new Response(error?.message || "Internal Server Error", {
      status: error?.message ? 400 : 500,
    });
  } finally {
    if (userMcp) {
      await userMcp.disconnect();
    }
  }
}
