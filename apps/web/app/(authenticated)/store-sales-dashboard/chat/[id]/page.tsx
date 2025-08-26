import React, { Suspense } from "react";
import { Metadata } from "next";
import Chat from "../../_components/Chat/Chat";

export const metadata: Metadata = {
  title: "Store Sales Dashboard",
  description: "Chat with Store Sales Data",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const chatId = params.id;

  return (
    <div className="md:max-w-[800px] w-full mx-auto p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Chat chatId={chatId} />
      </Suspense>
    </div>
  );
};

export default Page;
