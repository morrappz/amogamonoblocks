import { Metadata } from "next";
import React from "react";
import { getFormSetupData } from "@/app/(authenticated)/agentmaker/lib/actions";
import ChatForms from "../../_components/chatForms/PublicChatForms";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat forms",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const formUuid = (await params).id;
  const formSetupData = await getFormSetupData({ formId: formUuid });

  return (
    <div className="max-w-[800px] mx-auto p-4 w-full  max-h-screen h-full">
      <ChatForms
        formId={formSetupData[0]?.form_id}
        formName={formSetupData[0]?.form_name}
        formUuid={formUuid}
        formJson={formSetupData[0]?.form_json}
        apiUrl={formSetupData[0]?.data_api_url}
        apiKey={formSetupData[0]?.api_connection_json}
      />
    </div>
  );
};

export default Page;
