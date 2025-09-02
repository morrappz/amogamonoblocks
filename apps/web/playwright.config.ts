import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000", // Change if needed
    headless: true,
    trace: "on",
  },
});
