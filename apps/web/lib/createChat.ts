"use server";
import { v4 as uuidv4 } from "uuid";
import { postgrest } from "./postgrest";

export async function createChat(
  prompt: string,
  aiResponse: string,
  data: any[]
) {
  const newChatId = uuidv4();

  try {
    const chatTitle = `${prompt}_supabase_cron`;

    const { data: newChat, error: chatCreationError } = await postgrest
      .from("chat")
      .insert({
        id: newChatId,
        user_id: data[0]?.created_by,
        title: chatTitle,
        chat_group: "LangStarter",
        createdAt: new Date().toISOString(),
        business_number: data[0]?.for_business_number,
        status: "active",
      })
      .select("id")
      .single();

    if (chatCreationError) {
      throw chatCreationError;
    }

    const { error: messageInsertError } = await postgrest
      .asAdmin()
      .from("message")
      .insert({
        chatId: newChat.id,
        role: "assistant",
        content: aiResponse,
        created_user_id: data[0]?.created_by,
        createdAt: new Date().toISOString(),
      });

    if (messageInsertError) {
      throw new Error(
        `Failed to save AI response to the new chat: ${messageInsertError.message}`
      );
    }

    return { success: true, chatId: newChat.id };
  } catch (error) {
    console.error("Error creating chat:", error);
  }
}
