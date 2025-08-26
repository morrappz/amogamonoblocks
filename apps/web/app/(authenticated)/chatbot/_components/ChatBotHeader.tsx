"use client";
import { Bot, History, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

const ChatBotHeader = () => {
  const { data: session } = useSession();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Bot className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{session?.user?.user_name}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <Plus className="w-5 h-5 text-muted-foreground" />
        <History className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
};

export default ChatBotHeader;
