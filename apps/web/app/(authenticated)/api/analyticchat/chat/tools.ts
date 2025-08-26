import { z } from "zod";

// Define the tools for the AI
export const tools = {
  getDatabaseSchema: {
    description:
      "Gets all table and column data within the public schema in the Postgres database.",
    parameters: z.object({}),
  },
  executeSql: {
    description:
      "Executes Postgres SQL against the user's database. Perform joins automatically. Always add limits for safety.",
    parameters: z.object({
      sql: z.string().describe("The SQL query to execute"),
    }),
  },
  generateChart: {
    description: `
      Generates a chart using Chart.js for a given SQL query.
      - Label both axises
      - Plugins are not available
      - Use a variety of neon colors by default (rather than the same color for all)
      `,
    parameters: z.object({
      config: z
        .object({
          type: z.string().describe("The type of chart (bar, line, etc.)"),
          data: z.any().describe("The data for the chart"),
          options: z.any().describe("The options for the chart"),
        })
        .describe("The Chart.js configuration object"),
    }),
  },
  generateSuggestions: {
    description: "Generates relevant follow-up questions based on the conversation context and database schema",
    parameters: z.object({
      suggestions: z.array(z.string()).describe("Array of suggested follow-up questions"),
    }),
  },
};
