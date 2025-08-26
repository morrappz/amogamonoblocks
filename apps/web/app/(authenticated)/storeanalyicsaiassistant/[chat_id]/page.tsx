import AnalyticChat from "../_components/chat";
import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

export default async function AnalyticAssistantChatPage({
  params,
}: {
  params: { chat_id: string };
}) {
  const session = await auth();
  const {chat_id } = await params;

  if (!session?.user?.user_email) {
    return <div>Error can not get session Email</div>;
  }

  const { data: chatData, error: chatError } = await postgrest
    .asAdmin("chat_db")
    .from("Chat")
    .select("id,title,bookmark")
    .eq("id", chat_id)
    .limit(1)
    .single();

  if (chatError) {
    console.error("Error fetching chat data:", chatError);
    return <div>Error fetching chat data</div>;
  }

  const { data: messages, error: messagesError } = await postgrest
    .asAdmin("chat_db")
    .from("Message")
    .select(
      "id,chatId,content,role,createdAt,user_id,toolInvocations,usage,favorite,isLike"
    )
    .eq("chatId", chat_id)
    .order("createdAt", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return <div>Error fetching messages</div>;
  }

  return (
    <AnalyticChat
      chatId={chat_id}
      userId={session.user.user_catalog_id}
      dbConfig={undefined}
      initialMessages={messages}
      chatData={chatData}
    />
  );
}
