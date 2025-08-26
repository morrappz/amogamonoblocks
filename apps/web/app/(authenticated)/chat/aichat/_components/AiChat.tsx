/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ArrowLeft, Bot, History, Menu, Plus, Star } from "lucide-react";
import React from "react";
import { fetchFormSetupData } from "../lib/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ConversationalChat from "./ConversationalChat";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageProps {
  formId: number;
  chatId?: string;
}

interface DataProps {
  api_connection_json?: string;
  content: any;
  data_api_url?: string;
  db_connection_json?: string;
  form_id: number;
  form_name: string;
  story_api?: string;
}

const AiChat = ({ formId, chatId }: PageProps) => {
  const [data, setData] = React.useState<DataProps[]>([]);
  const [aiChatMode, setAiChatMode] = React.useState(false);
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    const fetchFormSetup = async () => {
      const response: any = await fetchFormSetupData(formId);
      setData(response);
    };
    fetchFormSetup();
  }, [formId]);

  React.useEffect(() => {
    if (aiChatMode) {
      router.push(`/chat/aichat/ai_mode/${formId}?mode=ai`);
    }
  }, [aiChatMode, formId, router]);

  return (
    <div className="mt-5 flex flex-col justify-center items-center">
      <div className="flex max-w-[800px]  w-full justify-between  items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {data && data[0]?.form_name}
          </h2>
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
            <Link href={`/chat/aichat/${formId}`}>
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
              className="h-5 w-5 cursor-pointer text-muted-foreground"
              onClick={() => setOpenMenu(true)}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 max-w-[800px] w-full">
        <ConversationalChat
          dataProps={data && data[0]}
          formId={formId}
          chatId={chatId}
          openHistory={openHistory}
          setOpenHistory={setOpenHistory}
          openFavorite={openFavorite}
          setOpenFavorite={setOpenFavorite}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
      </div>
    </div>
  );
};

export default AiChat;
