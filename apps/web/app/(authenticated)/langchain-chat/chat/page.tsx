import { redirect } from "next/navigation";
import { createNewChatSession } from "@/app/(authenticated)/langchain-chat/lib/actions";

export default async function Home() {
  // When accessing /langchain-chat/chat without an ID, create a new chat session
  const result = await createNewChatSession();

  if (result.success) {
    // Redirect to the new chat with the generated ID
    redirect(`/langchain-chat/chat/${result.chatId}`);
  }

  // If createNewChatSession fails, redirect to role menu
  redirect("/role-menu");
}
