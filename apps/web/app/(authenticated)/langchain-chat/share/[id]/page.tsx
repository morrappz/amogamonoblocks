import { ChatWindow } from "@/components/chat/ChatWindow";
import React from "react";

interface IndexProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: IndexProps) => {
  const shareId = (await params).id;
  return (
    <div className="w-full  max-w-[800px] mx-auto ">
      <ChatWindow
        key="new-chat"
        endpoint="/api/chat"
        emoji="🏴‍☠️"
        placeholder="Enter prompt..."
        chatId={undefined}
        shareId={shareId}
      />
    </div>
  );
};

export default Page;
