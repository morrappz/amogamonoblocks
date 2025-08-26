import * as React from "react";

import { Metadata } from "next";
import AnalyticChat from "./_components/chat";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Analytic Chat",
  description: "Analytic Chat",
};

export default async function AnalyticChatPage() {
  const session = await auth();
  if (!session?.user.user_catalog_id) {
    return <div>Invalid User</div>;
  }
  return (
    <AnalyticChat
      key={undefined}
      chatId={undefined}
      userId={String(session?.user.user_catalog_id)}
      initialMessages={[
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your database assistant. What would you like to know about your data?",
        },
      ]}
    />
  );
}
