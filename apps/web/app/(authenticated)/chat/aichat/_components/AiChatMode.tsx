/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ArrowLeft,
  Bot,
  Coins,
  History,
  Loader,
  Menu,
  Plus,
  Star,
} from "lucide-react";
import React, { useEffect } from "react";
import { fetchFormSetupData } from "../lib/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import ChatwithAI from "./ChatwithAI";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface PageProps {
  formId: number;
  chatId?: string;
  mode: string;
}

interface DataProps {
  api_connection_json?: string;
  content: any;
  data_api_url?: string;
  db_connection_json?: string;
  form_id: number;
  form_name: string;
}

const AiChatMode = ({ formId, chatId, mode }: PageProps) => {
  const [data, setData] = React.useState<DataProps[]>([]);
  const [aiChatMode, setAiChatMode] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [usage, setUsage] = React.useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });

  const router = useRouter();

  React.useEffect(() => {
    setLoading(true);
    const fetchFormSetup = async () => {
      const response: any = await fetchFormSetupData(formId);
      setData(response);
      setLoading(false);
    };
    fetchFormSetup();
  }, [formId]);

  useEffect(() => {
    if (mode === "ai") {
      setAiChatMode(true);
      setInitialized(true);
    }
  }, [mode, formId, router]);

  React.useEffect(() => {
    if (aiChatMode === false && initialized) {
      router.push(`/chat/aichat/${formId}`);
    }
  }, [aiChatMode, formId, router, initialized]);

  return (
    <div className="mt-5  flex flex-col justify-center items-center">
      <div className="flex   max-w-[800px] w-full gap-2.5 items-center justify-between">
        {loading && <Loader className="w-5 h-5 animate-spin" />}
        <div className="flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            {data && data[0]?.form_name}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Coins className="w-5 h-5 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Prompt Tokens: {usage.promptTokens}</p>
                <p>Completion Tokens: {usage.completionTokens}</p>
                <p>Total Tokens: {usage.totalTokens}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2.5">
            <Switch
              id="chat_type"
              checked={aiChatMode}
              onCheckedChange={() => setAiChatMode(!aiChatMode)}
            />
            <Label htmlFor="chat_type">Enable AI</Label>
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href={`/chat/aichat/ai_mode/${formId}?mode=ai`}>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Link>
            <History
              onClick={() => setOpenHistory(true)}
              className="h-5 cursor-pointer w-5 text-muted-foreground"
            />
            <Star
              onClick={() => setOpenFavorite(true)}
              className="h-5 w-5 cursor-pointer text-muted-foreground"
            />
            <Menu
              onClick={() => setOpenMenu(true)}
              className="h-5 w-5 cursor-pointer text-muted-foreground"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 max-w-[800px] w-full">
        <ChatwithAI
          dataProps={data && data[0]}
          formId={formId}
          chatId={chatId}
          openHistory={openHistory}
          setOpenHistory={setOpenHistory}
          openFavorite={openFavorite}
          setOpenFavorite={setOpenFavorite}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setUsage={setUsage}
        />
      </div>
    </div>
  );
};

export default AiChatMode;
