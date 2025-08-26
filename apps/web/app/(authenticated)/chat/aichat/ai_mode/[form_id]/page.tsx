import React, { Suspense } from "react";
import AiChatMode from "../../_components/AiChatMode";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with Preferred Data source",
};

interface PageProps {
  params: Promise<{ form_id: number }>;
  searchParams: Promise<{ mode: string }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const form_id = params.form_id;
  const searchParams = await props.searchParams;
  const mode = searchParams.mode;


  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AiChatMode formId={form_id} mode={mode} />
      </Suspense>
    </div>
  );
};

export default Page;
