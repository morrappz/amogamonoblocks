"use server";

import { postgrest } from "@/lib/postgrest";

export async function getNotifications() {
  try {
    const { data, error } = await postgrest
      .from("message")
      .select(
        "id, agentMsgId, archive_status, read_status, important, chat_message_type, chat_message, created_user_name, createdAt, custom_one"
      )
      .eq("chat_message_type", "APP_NOTIFICATION")
      .eq("receiver_user_id", 140);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching Notifications:", error);
    throw error;
  }
}
