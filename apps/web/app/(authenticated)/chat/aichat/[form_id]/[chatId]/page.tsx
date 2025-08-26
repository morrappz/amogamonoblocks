import React from "react";
import AiChat from "../../_components/AiChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with Preferred Data source",
};

interface PageProps {
  params: Promise<{ form_id: number; chatId: string }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const form_id = params.form_id;
  const chatId = params.chatId;
  return (
    <div>
      <AiChat formId={form_id} chatId={chatId} />
    </div>
  );
};

export default Page;
