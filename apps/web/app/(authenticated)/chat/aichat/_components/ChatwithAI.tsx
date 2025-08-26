/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";

import {
  ArrowUp,
  Bot,
  Copy,
  Edit,
  Eye,
  FileUp,
  Loader2,
  Mic,
  RefreshCw,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  addFavorite,
  addFeedback,
  createChat,
  createMessage,
  fetchMessages,
} from "@/app/(authenticated)/files/lib/action";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import HistoryBar from "../_components/sidebar/History";
import {
  getChatFavorites,
  getChatHistory,
  getDataFromDb,
} from "../lib/actions";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import MenuBar from "./sidebar/MenuBar";
import FavoritesBar from "./sidebar/FavoritesBar";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PageProps {
  dataProps: {
    story_api?: string;
    api_connection_json?: string;
    content: {
      description: string;
      name: string;
      queries: any[];
      type: string;
    }[];
    data_api_url?: string;
    db_connection_json?: string;
    form_id: number;
    form_name: string;
  };
  chatId?: string;
  formId: number;
  openHistory: boolean;
  setOpenHistory: (open: boolean) => void;
  openFavorite: boolean;
  setOpenFavorite: (open: boolean) => void;
  openMenu: boolean;
  setOpenMenu: (open: boolean) => void;
  setUsage: (usage: any) => void;
}

const ChatwithData = ({
  dataProps,
  formId,
  chatId,
  openHistory,
  setOpenHistory,
  openFavorite,
  setOpenFavorite,
  openMenu,
  setOpenMenu,
  setUsage,
}: PageProps) => {
  const [prompt, setPrompt] = React.useState("");
  const [messages, setMessages] = React.useState<any[]>([]);
  const [isResponseLoading, setIsResponseLoading] = React.useState(false);
  const [historyData, setHistoryData] = React.useState<any[]>([]);
  const [favoriteData, setFavoriteData] = React.useState<any[]>([]);
  const [contextData, setContextData] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isMessageAction, setIsMessageAction] = React.useState(false);

  const { data: session } = useSession();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const isMessageActionUpdate = useRef(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const router = useRouter();

  useEffect(() => {
    if (!listening && transcript) {
      setPrompt(transcript);
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  useEffect(() => {
    if (
      scrollAreaRef.current &&
      isAtBottom &&
      !isMessageActionUpdate.current &&
      !isMessageAction
    ) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
      }
    }
    isMessageActionUpdate.current = false;
  }, [messages, isAtBottom, suggestions, isMessageAction]);

  useEffect(() => {
    if (dataProps) {
      if (dataProps?.content?.length === 0) {
        toast.error("No data found");
        return;
      }
      const fetchContextData = async () => {
        if (dataProps?.content && dataProps?.content?.[0]) {
          const queries = dataProps?.content?.[0]?.queries;
          for (const item of queries) {
            const response = await getDataFromDb(
              dataProps.db_connection_json,
              item.query
            );
            setContextData((prev) => [...prev, response[0]]);
          }
        }
        if (dataProps?.story_api) {
          const response = await fetch(dataProps?.story_api, {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.SaPQ1nlsFVeVCY9N_AC57AH4r70fAEhe8STPGvM6rBQ",
            },
          });
          const result = await response.json();
          const queries = result[0]?.story_json[0]?.queries;
          for (const item of queries) {
            const response = await getDataFromDb(
              dataProps.db_connection_json,
              item.query
            );
            setContextData((prev) => [...prev, response[0]]);
          }
        }
      };
      fetchContextData();
    }
  }, [dataProps]);

  useEffect(() => {
    fetchHistory();
  }, [openHistory]);

  const fetchHistory = async () => {
    try {
      const response: any = await getChatHistory("Chat with Analytic Agent");
      setHistoryData(response);
    } catch (error) {
      toast.error("Error fetching history");
      throw error;
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response: any = await getChatFavorites(
          "Chat with Analytic Agent"
        );
        setFavoriteData(response);
      } catch (error) {
        toast.error("Error fetching favorites");
        throw error;
      }
    };
    fetchFavorites();
  }, [openFavorite]);

  useEffect(() => {
    if (chatId) {
      const renderMessages = async () => {
        const response = await fetchMessages(chatId);

        if (!response) {
          toast("Failed to fetch messages");
          return;
        }
        const sortedData = response.sort((a: any, b: any) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setMessages(
          sortedData.map((msg: any) => ({
            id: msg.id,
            chatId: msg.chatId,
            createdAt: msg.createdAt,
            bookmark: msg.bookmark,
            isLike: msg.isLike,
            favorite: msg.favorite,
            chartType: msg.chartType,
            chartData: msg.chartData,
            chartOptions: msg.chartOptions,
            text: msg.content,
            role: msg.role,
          }))
        );
      };
      renderMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      // Sort messages by createdAt timestamp (note: your data uses createdAt, not created_at)
      const sortedMessages = [...messages].sort((a, b) => {
        // If createdAt is available, use it for sorting
        if (a.createdAt && b.createdAt) {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        // Fallback to id if available
        if (a.id && b.id) {
          return a.id - b.id;
        }
        // If no reliable sorting field is available, maintain current order
        return 0;
      });

      // Only update if the order has changed
      if (
        JSON.stringify(sortedMessages.map((m) => m.id)) !==
        JSON.stringify(messages.map((m) => m.id))
      ) {
        setMessages(sortedMessages);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!dataProps || !formId) return;
    const fetchSuggestions = async () => {
      const response = await fetch("/api/ai-chat/suggestions", {
        method: "POST",
        body: JSON.stringify(contextData),
      });
      const result = await response.json();
      setSuggestions(result.suggestions);
    };
    fetchSuggestions();
  }, [dataProps, formId, contextData]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollAreaRef.current) {
      const scrollContainer = e.currentTarget;
      const isBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop <=
        scrollContainer.clientHeight + 10;
      setIsAtBottom(isBottom);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryData = prompt.replace(/"/g, "");
    if (!queryData || !dataProps) return null;
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

        let aiResponse = result.text.text || "AI response missing.";
        let chartType = result.text.chartType || null;
        let chartData = result.text.chartData || null;
        let chartOptions = result.text.chartOptions || null;

        if (
          result.text.chartType &&
          result.text.chartData &&
          result.text.chartOptions
        ) {
          chartType = result.text.chartType;
          chartData = result.text.chartData;
          chartOptions = result.text.chartOptions;
          aiResponse = result.text.text || "Here's your chart.";
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
          chartType,
          chartData,
          chartOptions,
        });
      } catch (error) {
        toast.error("Failed fetching response");
        throw error;
      }
      if (!chatId) {
        router.push(`/chat/aichat/ai_mode/${formId}/${currentChatId}?mode=ai`);
      }
      setIsResponseLoading(false);

      setPrompt("");
    } catch (error) {
      setIsResponseLoading(false);

      throw error;
    }
  };

  const handleFavorite = async (message: any) => {
    const newFavoriteStatus = !message.favorite;
    setIsMessageAction(true);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === message.id ? { ...msg, favorite: newFavoriteStatus } : msg
      )
    );
    const favorite = await addFavorite(message.id);

    if (!favorite.success) {
      toast.error("Error adding favorite");
    }
  };

  const handleLike = async (message: any, isLike: boolean) => {
    const newLikeStatus = message.isLike === isLike ? null : isLike;
    setIsMessageAction(true);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === message.id ? { ...msg, isLike: newLikeStatus } : msg
      )
    );
    const feedback = await addFeedback(message.id, newLikeStatus);

    if (!feedback.success) {
      toast.error("Error adding favorite");
    }
  };

  const handleSuggestedPromps = async (query: string) => {
    const queryData = query.replace(/"/g, "");
    if (!queryData || !dataProps) return null;
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

        if (!response.body) {
          toast.error("No response body from AI");
          setIsResponseLoading(false);
          return;
        }

        let aiResponse = "";
        let chartType = null;
        let chartData = null;
        let chartOptions = null;

        if (result.chartType && result.chartData && result.chartOptions) {
          chartType = result.chartType;
          chartData = result.chartData;
          chartOptions = result.chartOptions;
          aiResponse = result.text || "Here's your chart.";
        } else {
          aiResponse = result.text || "No structured chart data found.";
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
            messages[messages.length - 1].chartOptions = chartOptions;
          }
          return messages;
        });

        await createMessage({
          id: assistantMsgId,
          chatId: currentChatId,
          content: aiResponse,
          role: "assistant",
          createdAt: new Date().toISOString(),
          user_id: session?.user?.user_catalog_id,
        });
      } catch (error) {
        toast.error("Failed fetching response");
        throw error;
      }
      if (!chatId) {
        router.push(`/chat/aichat/ai_mode/${formId}/${currentChatId}?mode=ai`);
      }
      setIsResponseLoading(false);

      setPrompt("");
    } catch (error) {
      setIsResponseLoading(false);

      throw error;
    }
  };

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser doesn't support speech recognition");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: "en_US" });
  };

  const speak = (text: string) => {
    if (typeof window !== "undefined") {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.voice = window.speechSynthesis.getVoices()[1];

      synth.speak(utterance);
    }
  };

  return (
    <div className="mt-5 flex w-full justify-center  h-screen ">
      <div className="flex flex-col justify-center items-center  max-w-[800px] w-full h-full">
        {/* <div className="w-full flex justify-end">
          
          <div className="flex items-center gap-4">
          <Plus className="h-5 w-5 text-muted-foreground" />
          <History
            onClick={() => setOpenHistory(true)}
            className="h-5 cursor-pointer w-5 text-muted-foreground"
          />
          <Star
            onClick={() => setOpenFavorite(true)}
            className="h-5 w-5 cursor-pointer text-muted-foreground"
          />
          <Menu className="h-5 w-5 text-muted-foreground" />
        </div>
        </div> */}
        <HistoryBar
          open={openHistory}
          data={historyData}
          formId={formId}
          title=""
          setOpen={setOpenHistory}
          fetchHistory={fetchHistory}
        />
        <FavoritesBar
          open={openFavorite}
          data={favoriteData}
          title=""
          formId={formId}
          setOpen={setOpenFavorite}
          mode="AI-Chat"
        />
        <MenuBar
          open={openMenu}
          formId={formId}
          mode="AI-Chat"
          setOpen={setOpenMenu}
        />
        <div className="flex items-center w-full flex-wrap gap-4">
          {messages.length <= 1 &&
            suggestions &&
            suggestions?.length > 0 &&
            suggestions.map((item, index) => (
              <div key={index}>
                <Button
                  variant={"outline"}
                  onClick={() => handleSuggestedPromps(item)}
                  className="rounded-full"
                >
                  {item.replace(/"/g, "")}
                </Button>
              </div>
            ))}
        </div>
        <div className="flex-1 w-full h-[90%]">
          <ScrollArea
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-1 w-full h-full"
          >
            <div className="flex flex-col gap-4 w-full md:p-4 pb-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 w-full justify-start "
                >
                  <div className="flex bg-secondary rounded-full h-10 w-10 flex-col items-center justify-center">
                    {message.role === "user" ? (
                      <p className="flex flex-col items-center justify-center">
                        {session?.user?.user_name?.[0].toUpperCase()}
                      </p>
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <div
                      className={` rounded-t-md rounded-l-lg p-3 ${
                        message.role === "user" ? "bg-muted" : "bg-muted"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                      {message.chartType && message.chartData && (
                        <div className="mt-4">
                          <Chart
                            className="max-w-full max-h-full min-h-72"
                            type={message.chartType}
                            data={message.chartData}
                            options={{
                              ...message.chartOptions,
                              maintainAspectRatio: false,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      {message.role === "assistant" && (
                        <div className="flex  md:ml-3 items-center gap-5">
                          <div className="flex items-center gap-5">
                            <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" />
                            <Star
                              className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                                message.favorite
                                  ? "fill-primary text-primary"
                                  : ""
                              }`}
                              onClick={() => handleFavorite(message)}
                            />
                            <Copy
                              onClick={() => {
                                navigator.clipboard.writeText(message.text);
                                toast.success("Copied to clipboard");
                              }}
                              className="w-5 h-5 cursor-pointer text-muted-foreground"
                            />
                            <RefreshCw className="w-5 h-5 cursor-pointer text-muted-foreground" />
                            <Share2 className="w-5 h-5 cursor-pointer text-muted-foreground" />
                            <Edit className="w-5 h-5 cursor-pointer text-muted-foreground" />
                            <Volume2
                              onClick={() => speak(message.text)}
                              className="w-5 h-5 cursor-pointer text-muted-foreground"
                            />
                          </div>
                          <div className="flex items-center  gap-5 justify-end w-full">
                            <ThumbsUp
                              onClick={() => handleLike(message, true)}
                              className={`w-5 h-5 ${
                                message.isLike === true &&
                                "fill-primary text-primary"
                              } cursor-pointer text-muted-foreground`}
                            />
                            <ThumbsDown
                              onClick={() => handleLike(message, false)}
                              className={`w-5 h-5 ${
                                message.isLike === false &&
                                "fill-primary text-primary"
                              } cursor-pointer text-muted-foreground`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-[800px] mt-4 sticky bottom-0 w-full  p-4 bg-background"
        >
          <div className="rounded-full flex items-center p-2.5 border">
            <Input
              placeholder="Type your message here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-0"
            />
            <div className="flex items-center gap-4">
              <FileUp className="w-5 h-5 cursor-not-allowed text-muted-foreground" />
              <Button
                disabled={isResponseLoading || !prompt}
                size={"icon"}
                className="rounded-full"
              >
                {isResponseLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 " />
                )}
              </Button>
              <Button
                onClick={handleMicClick}
                size={"icon"}
                disabled={listening}
                className="rounded-full"
              >
                {listening ? (
                  <Loader2 className="w-5 animate-spin h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatwithAI = React.memo(ChatwithData);

export default ChatwithAI;
