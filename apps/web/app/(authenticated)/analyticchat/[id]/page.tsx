import * as React from "react";

import { postgrest } from "@/lib/postgrest";
import { Metadata } from "next";
import AnalyticChat from "../_components/chat";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Analytic Chat",
  description: "Analytic Chat",
};

interface AnalyticChatSinglePageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalyticChatSinglePage(
  props: AnalyticChatSinglePageProps
) {
  const params = await props.params;
  if (!params.id) {
    return <div>Invalid ID</div>;
  }
  const session = await auth();
  if (!session?.user.user_catalog_id) {
    return <div>Invalid User</div>;
  }

  const { data: chat, error } = await postgrest
    .asAdmin("chat_db")
    .from("Chat")
    .select("*")
    .eq("id", params.id)
    .limit(1)
    .single();
  if (error || !chat) {
    console.error("Error fetching chat:", error);
    return <div>Error fetching chat</div>;
  }

  const { data: messages, error: messagesError } = await postgrest
    .asAdmin("chat_db")
    .from("Message")
    .select("id,chatId,content,role,createdAt,user_id,toolInvocations,usage,favorite,isLike")
    .eq("chatId", params.id)
    .order("createdAt", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return <div>Error fetching messages</div>;
  }

  return (
    <AnalyticChat
      key={params.id}
      chatId={params.id}
      initialMessages={messages}
      userId={String(session?.user.user_catalog_id)}
    />
  );
}
