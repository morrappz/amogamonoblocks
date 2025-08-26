import Chat from "../../../_components/Chat/components/ChatComponents/Chat";
import React from "react";

interface IndexProps {
  params: Promise<{ chat_group_id: string }>;
}

const page = async (props: IndexProps) => {
  const params = await props.params;
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <Chat chatId={params.chat_group_id} isGroup={true} />
    </div>
  );
};

export default page;
