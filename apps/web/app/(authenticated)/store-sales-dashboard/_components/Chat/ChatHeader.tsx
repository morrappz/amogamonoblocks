import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Bot, Coins, History, Menu, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageProps {
  setOpenHistory: (value: boolean) => void;
  setOpenFavorite: (value: boolean) => void;
  setOpenMenu: (value: boolean) => void;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const ChatHeader = ({
  setOpenHistory,
  setOpenFavorite,
  setOpenMenu,
  usage,
}: PageProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Bot className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold md:flex hidden">
          Chat with Sales Data
        </h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Coins className="text-yellow-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Prompt Tokens: {usage.promptTokens}</p>
            <p>Completion Tokens: {usage.completionTokens}</p>
            <p>Total Tokens: {usage.totalTokens}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-5 justify-end">
        <Link href="/store-sales-dashboard">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <History
          onClick={() => setOpenHistory(true)}
          className="w-5 h-5 cursor-pointer text-muted-foreground"
        />
        <Star
          onClick={() => setOpenFavorite(true)}
          className="w-5 h-5 cursor-pointer text-muted-foreground"
        />
        <Menu
          onClick={() => setOpenMenu(true)}
          className="w-5 h-5 cursor-pointer text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default ChatHeader;
