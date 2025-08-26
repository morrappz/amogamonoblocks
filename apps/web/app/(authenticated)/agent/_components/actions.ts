"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateAIResponse = async (prompt: string) => {
  try {
    const response = await generateObject({
      model: openai("gpt-4o"),
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      prompt: prompt,
      schema: z.object({
        response: z.string(),
      }),
      output: "object",
    });
    return response.object.response;
  } catch (error) {
    console.log("error----", error);
  }
};
