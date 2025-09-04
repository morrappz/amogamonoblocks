import { createChat } from "@/lib/createChat";
import { executeAIPrompt } from "@/lib/executeAIPrompt";
import { postgrest } from "@/lib/postgrest";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { data, error } = await postgrest
      .from("prompts_list")
      .select("*")
      .eq("is_scheduled", true)
      .eq("status", "active")
      .eq("execution_status", "idle");
    //   .lte("next_execution", new Date().toISOString());

    if (error) {
      throw error;
    }

    console.log("[CRON]", new Date().toISOString(), "Cron endpoint hit!");
    console.log("data----", data);

    const prompt = data[0]?.description || "";

    if (data?.length > 0) {
      const aiResponse = await executeAIPrompt(prompt);

      const deliveryOptions = data[0]?.delivery_options;

      if (deliveryOptions?.aiChat) {
        createChat(prompt, aiResponse, data);
      }

      if (deliveryOptions?.email) {
        try {
          const info = await transporter.sendMail({
            from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_ADMIN_EMAIL}>`,
            to: "tharungoud1206@gmail.com",
            subject: prompt,
            text: aiResponse,
          });
          console.log("Email has been sent", info);
        } catch (error) {
          console.error("Error sending Email");
        }
      }

      await postgrest
        .from("prompts_list")
        .update({
          is_scheduled: false,
        })
        .eq("id", data[0]?.id);
    } else {
      console.log("No data found");
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}
