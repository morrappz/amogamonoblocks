import { redirect } from "next/navigation";
import AnalyticChat from "../_components/chat";
import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytic Assistant",
  description: "Analytic Assistant",
};

export default async function AnalyticAssistantPage({
  params,
}: {
  params: { assistant_identifier: number };
}) {
  const session = await auth();
  const { assistant_identifier } = await params;

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
    return <div>Error: Form setup not found</div>;
    redirect("/analyticassistant");
  }

  return (
    <AnalyticChat
      chatId={undefined}
      userId={session.user.user_catalog_id}
      dbConfig={formSetup.db_connection_json}
      assistantName={formSetup.form_name}
      assistantIdentifier={formSetup.form_id}
    />
  );
}
