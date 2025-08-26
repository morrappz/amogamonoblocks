/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import {
//   Bot,
//   Brain,
//   ChevronDown,
//   Coins,
//   History,
//   Loader,
//   Menu,
//   MessageSquare,
//   Plus,
//   Star,
//   Users,
// } from "lucide-react";
import React from "react";
import { fetchFormSetupData } from "../../lib/actions";
import { useRouter } from "next/navigation";
import ChatwithAI from "./ChatwithAI";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  createChat,
  createMessage,
} from "@/app/(authenticated)/files/lib/action";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import Link from "next/link";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

interface PageProps {
  formId: number;
  chatId?: string;
  mode?: string;
}

export interface DataProps {
  api_connection_json?: string;
  content: any;
  data_api_url?: string;
  db_connection_json?: string;
  form_id: number;
  form_name: string;
}

const AiChatMode = ({ formId, chatId }: PageProps) => {
  const [data, setData] = React.useState<DataProps[]>([]);
  // const [aiChatMode, setAiChatMode] = React.useState(false);
  // const [initialized, setInitialized] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [isResponseLoading, setIsResponseLoading] = React.useState(false);
  const [isMessageAction, setIsMessageAction] = React.useState(false);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [contextData, setContextData] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [usage, setUsage] = React.useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const { data: session } = useSession();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

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

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser doesn't support speech recognition");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: "en_US" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryData = prompt.replace(/"/g, "");
    if (!queryData || !data) return null;
    setIsMessageAction(false);

    setIsResponseLoading(true);
    try {
      const newChatUuid = uuidv4();
      const userMsgId = uuidv4();
      const assistantMsgId = uuidv4();
      const currentChatId = chatId || newChatUuid;
      const createdDate = new Date().toISOString();
      if (!chatId) {
        const payload = {
          createdAt: createdDate,
          user_id: session?.user?.user_catalog_id,
          id: newChatUuid,
          title: queryData,
          status: "active",
          chat_group: "Chat with Analytic Agent",
        };
        const createChatData = await createChat(payload);
        if (!createChatData.success) {
          toast.error("Error creating chat");
        }
      }

      const userMessage = {
        id: userMsgId,
        chatId: currentChatId,
        content: queryData,
        text: queryData,
        role: "user",
        createdAt: createdDate,
        user_id: session?.user?.user_catalog_id,
        bookmark: null,
        isLike: null,
        favorite: null,
      };

      setMessages((prev) => [...prev, userMessage]);

      const messagePayload = {
        id: userMsgId,
        chatId: currentChatId,
        content: queryData,
        role: "user",
        chat_group: "Chat with Analytic Agent",

        createdAt: createdDate,
        user_id: session?.user?.user_catalog_id,
      };
      await createMessage(messagePayload);

      const assistantMsg = {
        id: assistantMsgId,
        chatId: currentChatId,
        content: "",
        role: "assistant",
        createdAt: createdDate,
        user_id: session?.user?.user_catalog_id,
        bookmark: null,
        isLike: null,
        favorite: null,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const response = await fetch("/api/ai-chat/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contextData, queryData }),
        });
        const result = await response.json();
        if (result.usage) {
          setUsage(result.usage);
        }

        if (!response.body) {
          toast.error("No response body from AI");
          setIsResponseLoading(false);
          return;
        }

        let aiResponse = result?.text?.text || "AI response missing.";
        let chartType = result?.text?.chartType || null;
        let chartData = result?.text?.chart?.data || null;
        let chartOptions = result.text?.chartOptions || null;
        let chart = result?.text?.chart;

        if (result?.text?.chart && result?.text?.chart?.data) {
          chartType = result?.text?.chartType;
          chartData = result?.text?.chart?.data;
          chartOptions = result?.text?.chartOptions;
          chart = result?.text?.chart;
          aiResponse = result?.text?.text || "Here's your chart.";
        } else {
          aiResponse = result.text.text || "No structured chart data found.";
        }

        setMessages((prev) => {
          const messages = [...prev];
          if (
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant"
          ) {
            messages[messages.length - 1].text = aiResponse;
            messages[messages.length - 1].content = aiResponse; // Update both fields
            messages[messages.length - 1].chartType = chartType;
            messages[messages.length - 1].chartData = chartData;
            messages[messages.length - 1].chart = chart;
            messages[messages.length - 1].chartOptions = chartOptions;
          }
          return messages;
        });

        await createMessage({
          id: assistantMsgId,
          chatId: currentChatId,
          content: aiResponse,
          role: "assistant",
          chat_group: "Chat with Analytic Agent",
          createdAt: new Date().toISOString(),
          user_id: session?.user?.user_catalog_id,
          chart,
          chartType,
          chartData,
          chartOptions,
        });
      } catch (error) {
        setPrompt("");
        toast.error(`Failed fetching response ${error}`);
        throw error;
      }
      if (!chatId) {
        router.push(`/aichat/ai_mode/${formId}/${currentChatId}?mode=ai`);
      }
      setIsResponseLoading(false);

      setPrompt("");
    } catch (error) {
      setIsResponseLoading(false);

      throw error;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="sticky top-0 z-10 bg-background">
        <ChatHeader
          loading={loading}
          data={data}
          formId={formId}
          usage={usage}
          setOpenHistory={setOpenHistory}
          setOpenFavorite={setOpenFavorite}
          setOpenMenu={setOpenMenu}
        />
      </div>
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
        prompt={prompt}
        setPrompt={setPrompt}
        setIsResponseLoading={setIsResponseLoading}
        isMessageAction={isMessageAction}
        messages={messages}
        setMessages={setMessages}
        contextData={contextData}
        setContextData={setContextData}
        transcript={transcript}
        listening={listening}
        resetTranscript={resetTranscript}
        setIsMessageAction={setIsMessageAction}
      />
      <div className="sticky bottom-0 w-full max-w-[800px]">
        <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          handleSubmit={handleSubmit}
          handleMicClick={handleMicClick}
          isResponseLoading={isResponseLoading}
          listening={listening}
        />
      </div>
    </div>
  );
};

export default AiChatMode;
