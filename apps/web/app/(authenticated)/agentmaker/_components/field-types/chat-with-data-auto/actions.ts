"use server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const generatePugTemplate = async (data: string[]) => {
  try {
    const sampleTemplates = `
    Examples:

    1. Input Data:
       [
         {
           "product_name": "Polo",
           "total_sales": 100,
           "region": "North America"
         },
         {
           "product_name": "Cap",
           "total_sales": 75,
           "region": "Europe"
         }
       ]
       Output Template:
       p | The product #{product_name} has total sales of #{total_sales}.
       p | This product is popular in the #{region} region.

    2. Input Data:
       [
         {
           "order_id": 1024,
           "customer_name": "John Doe",
           "order_date": "2024-03-01",
           "order_total": 250.5
         }
       ]
       Output Template:
       p | Order ID #{order_id} was placed by #{customer_name} on #{order_date}.
       p | The total value of the order was #{order_total}.
    `;

    // Dynamically generate the system prompt
    const systemPrompt = `
      You are tasked with generating a descriptive Pug template based on an array of objects provided as input. Each object contains key-value pairs representing field names and their corresponding data.

      Requirements:
      - Use placeholders in the format #{field_name} (e.g., #{product_name}, #{total_sales}).
      - Do not include prefixes like item. in the placeholders.
      - Avoid using loops like "each item in data" in the template.
      - Generate a detailed and descriptive template that includes all fields in the data objects.
      - Provide meaningful sentences that describe the data fields in context.

      Examples:
      ${sampleTemplates}

      Task:
      Based on the following input data:
      ${JSON.stringify(data, null, 2)}

      Generate a valid Pug template that includes dynamic placeholders for all fields, presented in a detailed and descriptive manner.
    `;

    // Call AI model to generate the template
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Generate a detailed Pug template for the data array provided above.`,
      schema: z.object({
        template: z.string(),
      }),
    });

    const template = result.object.template.trim();
    return template;
  } catch (err) {
    console.error(`Failed to generate template: ${err}`);
    throw err;
  }
};
