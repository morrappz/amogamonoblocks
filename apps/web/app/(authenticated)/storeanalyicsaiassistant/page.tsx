import { auth } from "@/auth";
import { Metadata } from "next";
import AnalyticChat from "./_components/chat";

export const metadata: Metadata = {
  title: "Analytic Assistant",
  description: "Analytic Assistant",
};

export default async function AnalyticAssistantPage() {
  const session = await auth();

  if (!session?.user?.user_email) {
    return <div>Error can not get session Email</div>;
  }


  return (
    <AnalyticChat
      chatId={undefined}
      userId={session.user.user_catalog_id}
      dbConfig={undefined}
    />
  );
}
