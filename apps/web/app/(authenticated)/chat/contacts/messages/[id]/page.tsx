import Chat from "../../../_components/Chat/components/ChatComponents/Chat";
import React from "react";

interface IndexPageProps {
  params: Promise<{ id: string }>;
}

const Page = async (props: IndexPageProps) => {
  const params = await props.params;
  return (
    <div className=" overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <Chat chatId={params.id} isGroup={false} />
    </div>
  );
};

export default Page;
