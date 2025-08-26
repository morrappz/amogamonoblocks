import { Mastra } from "@mastra/core/mastra";
import { ECommerceAnalyticsAgent, weatherAgent } from "./agents";

export const mastra = new Mastra({
  agents: { weatherAgent, ECommerceAnalyticsAgent },
  // storage: new LibSQLStore({
  //   // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
  //   url: ":memory:",
  // }),
  // logger: createLogger({
  //   name: 'Mastra',
  //   level: 'info',
  // }),
});
