"use server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generateAIStory = async (aiPrompt: string, pugStory: string) => {
  try {
    // Create a dynamic system prompt based on user-provided aiPrompt
    const systemPrompt = `
      You are tasked with generating a detailed and engaging story based on the provided input story (pugStory) and user-entered prompt (aiPrompt).

       Requirements:
      - Use the pugStory to craft a narrative that aligns closely with the user prompt.
      - Ensure the output is clear, concise, and fits the context described in the aiPrompt.
      - Highlight only the most relevant details from the pugStory.
      - Avoid unnecessary repetition or overly detailed descriptions.

      Inputs:
      1. Pug Story:
         "${pugStory}"

      2. User Prompt:
         "${aiPrompt}"

      Task:
      Generate a detailed story that reflects the context of the aiPrompt while utilizing the details from the pugStory.
    `;

    // Generate the story using the AI model
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt:
        "Create a concise story based on the inputs yet give detailed story as possible and make sure that here request time dont take more that 8 seconds.",
      schema: z.object({
        story: z.string(),
      }),
    });

    const story = result.object.story.trim();
    return story;
  } catch (err) {
    console.error(`Failed to generate story: ${err}`);
    throw err;
  }
};
