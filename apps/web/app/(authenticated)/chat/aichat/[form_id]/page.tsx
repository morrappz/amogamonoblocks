import React from "react";
import AiChat from "../_components/AiChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with Preferred Data source",
};

interface PageProps {
  params: Promise<{ form_id: number }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const form_id = params.form_id;
  return (
    <div>
      <AiChat formId={form_id} />
    </div>
  );
};

export default Page;
