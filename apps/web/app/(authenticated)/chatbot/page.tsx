import React from "react";
import ChatBot from "./_components/ChatBot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Bot",
  description: "Chat with Bot",
};

const ChatBotPage = () => {
  return (
    <div className="max-w-[800px] mx-auto p-2.5  h-full">
      <ChatBot />
    </div>
  );
};

export default ChatBotPage;
