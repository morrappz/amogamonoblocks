import { redirect } from "next/navigation";
import AnalyticChat from "../../_components/chat";
import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

export default async function AnalyticAssistantChatPage({
  params,
}: {
  params: { assistant_identifier: number; chat_id: string };
}) {
  const session = await auth();
  const { assistant_identifier, chat_id } = await params;

  if (!session?.user?.user_email) {
    return <div>Error can not get session Email</div>;
  }

  const { data: formSetup } = await postgrest
    .from("form_setup")
    .select("*")
    .eq("form_id", assistant_identifier)
    .filter("users_json", "cs", `["${session.user.user_email}"]`)
    .single();

  if (!formSetup) {
    redirect("/analyticassistant");
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
      dbConfig={formSetup.db_connection_json}
      initialMessages={messages}
      assistantName={formSetup.form_name}
      assistantIdentifier={formSetup.form_id}
      chatData={chatData}
    />
  );
}
