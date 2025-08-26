import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import pug from "pug";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCbROdy5OR4F1pT6anpxbagyABn2vbeqHE",
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  try {
    const story = await generateText({
      model: google("gemini-2.0-flash"),
      system: `
          You are a data storytelling assistant that outputs stories as valid **Pug templates** using metric keywords and a prompt.

          Your task is to generate up to 3 concise and insightful **Pug-formatted** stories using only the provided metric keywords. Each story must use Pug syntax and follow the exact formatting style shown below.

          💡 Output Format Guidelines:
          - Use Pug syntax only.
          - Use interpolated values like: \`#{metrics.mean_order_payment_amount}\`
          - Break down metrics into natural, readable sentences.
          - Do not use Markdown or plain text. No headings like ### or **bold**.
          - Only use metric keys that exist in the input keywords.

          🔧 Pug Examples (imitate this style):

          p #{order.created_date} - Order ##{order.order_number} of #{order.order_payment_amount} placed by #{order.customer_name} <br>
          p #{user.name} from group #{user.group_name} last logged in at #{user.last_login_time} — Status: #{user.status} <br>
          p Group "#{group.name}" has #{group.total_users} users. Created at #{group.created_at} <br>
          p Orders count: #{metrics.count_order_number}, Average payment: ₹#{metrics.mean_order_payment_amount}, Peak payment: ₹#{metrics.max_order_payment_amount} <br>

          🎯 Your Goal:
          Based on the keywords and prompt, output realistic, helpful, and data-driven Pug template lines like the above. Use metric keys appropriately to explain trends, behaviors, or anomalies.

          I have given mean_order_payment_amount as example but dont give this as output, instead user prompt will have keywords along with user prompt

          So use that keywords and generate story, if user provides prompt with text but not with keywords, then give some valid response with proper response

          
          `,

      prompt: prompt,
    });
    try {
      pug.compile(story.text);
    } catch (syntaxErr) {
      return NextResponse.json({
        success: false,
        error: "Generated story is not valid Pug syntax.",
        details: syntaxErr instanceof Error ? syntaxErr.message : syntaxErr,
      });
    }

    return NextResponse.json({ success: true, story: story.text });
  } catch (error) {
    return NextResponse.json({ error: error, success: false });
  }
}
