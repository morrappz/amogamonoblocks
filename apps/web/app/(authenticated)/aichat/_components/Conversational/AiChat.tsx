/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import {
//   Bot,
//   Brain,
//   ChevronDown,
//   History,
//   Menu,
//   MessageSquare,
//   Plus,
//   Star,
//   Users,
// } from "lucide-react";
import React from "react";
import { fetchFormSetupData } from "../../lib/actions";
// import Link from "next/link";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import ConversationChatInput from "./ConversationChatInput";
const ConversationalChat = dynamic(() => import("./ConversationalChat"));
const ConversationChatInput = dynamic(() => import("./ConversationChatInput"));
import ChatHeader from "./ChatHeader";
import dynamic from "next/dynamic";

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

interface suggestions {
  id: number;
  api: string;
  description: string;
  query: string;
  name: string;
  type: string;
}

const AiChat = ({ formId, chatId }: PageProps) => {
  const [data, setData] = React.useState<DataProps[]>([]);
  // const [aiChatMode, setAiChatMode] = React.useState(false);
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  // const [dropdownMenu, setDropdownMenu] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    React.useState<suggestions | null>(null);

  // const router = useRouter();

  React.useEffect(() => {
    const fetchFormSetup = async () => {
      const response: any = await fetchFormSetupData(formId);
      setData(response);
    };
    fetchFormSetup();
  }, [formId]);

  // React.useEffect(() => {
  //   if (aiChatMode) {
  //     router.push(`/aichat/ai_mode/${formId}?mode=ai`);
  //   }
  // }, [aiChatMode, formId, router]);

  return (
    <div className="relative  h-full w-full">
      <div className="sticky top-0 z-10 bg-background">
        <ChatHeader
          data={data}
          formId={formId}
          setOpenHistory={setOpenHistory}
          setOpenFavorite={setOpenFavorite}
          setOpenMenu={setOpenMenu}
        />
      </div>

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
        setLoading={setLoading}
        setInput={setInput}
        selectedSuggestion={selectedSuggestion}
        setSelectedSuggestion={setSelectedSuggestion}
      />

      <div className="sticky md:max-w-[800px]  w-full bottom-0 ">
        <ConversationChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          selectedSuggestion={selectedSuggestion}
        />
      </div>
    </div>
  );
};

export default AiChat;
