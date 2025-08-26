/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getChatFavorites,
  getChatHistory,
} from "@/app/(authenticated)/aichat/lib/actions";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import HistoryBar from "./sidebar/History";
import MenuBar from "./sidebar/MenuBar";
import FavoritesBar from "./sidebar/FavoritesBar";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PageProps {
  chatId?: string;
  openHistory: boolean;
  setOpenHistory: (open: boolean) => void;
  openFavorite: boolean;
  setOpenFavorite: (open: boolean) => void;
  openMenu: boolean;
  setOpenMenu: (open: boolean) => void;
  setUsage: React.Dispatch<
    React.SetStateAction<{
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>
  >;
}

const ChatwithData = ({
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

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch("/api/store-sales-dashboard/sales-data", {
          method: "GET",
        });
        const result = await response.json();
        setContextData(result.data);
        setSuggestions([]);
      } catch (error) {
        throw error;
      }
    };
    fetchSalesData();
  }, []);

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
    fetchHistory();
  }, [openHistory]);

  const fetchHistory = async () => {
    try {
      const response: any = await getChatHistory("Chat with Store Board");
      setHistoryData(response);
    } catch (error) {
      toast.error("Error fetching history");
      throw error;
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response: any = await getChatFavorites("Chat with Store Board");
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
      const sortedMessages = [...messages].sort((a, b) => {
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
    setIsMessageAction(false);
    if (!contextData) return;

    setIsResponseLoading(true);
    try {
      const newChatUuid = uuidv4();
      const userMsgId = uuidv4();
      const assistantMsgId = uuidv4();
      const currentChatId = chatId || newChatUuid;
      const createdDate = new Date().toISOString();
      if (chatId) {
        const payload = {
          createdAt: createdDate,
          user_id: session?.user?.user_catalog_id,
          id: currentChatId,
          title: queryData,
          status: "active",
          chat_group: "Chat with Store Board",
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
        chat_group: "Chat with Store Board",

        createdAt: createdDate,
        user_id: session?.user?.user_catalog_id,
      };
      await createMessage(messagePayload);

      const assistantMsg = {
        id: assistantMsgId,
        chatId: currentChatId,
        content: "Generating...",
        role: "assistant",
        createdAt: createdDate,
        user_id: session?.user?.user_catalog_id,
        bookmark: null,
        isLike: null,
        favorite: null,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const response = await fetch("/api/store-sales-dashboard/chat", {
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

        if (result) {
          chartType = result.text.chartType;
          chartData = result.text.chartData;
          chartOptions = result.text.chartOptions;
          aiResponse = result.text.text || result.text.summary || result.text;
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
          chat_group: "Chat with Store Board",

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
    if (!queryData) return null;
    setIsMessageAction(false);

    setIsResponseLoading(true);
    try {
      const newChatUuid = uuidv4();
      const userMsgId = uuidv4();
      const assistantMsgId = uuidv4();
      const currentChatId = chatId || newChatUuid;
      const createdDate = new Date().toISOString();
      if (chatId) {
        const payload = {
          createdAt: createdDate,
          user_id: session?.user?.user_catalog_id,
          id: currentChatId,
          title: queryData,
          status: "active",
          chat_group: "Chat with Store Board",
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
        content: "Generating...",
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
    <div className="mt-5 flex w-full  justify-center  h-screen ">
      <div className="flex flex-col justify-center items-center  w-full h-full">
        <HistoryBar
          open={openHistory}
          data={historyData}
          title="History"
          setOpen={setOpenHistory}
          fetchHistory={fetchHistory}
        />
        <FavoritesBar
          open={openFavorite}
          data={favoriteData}
          title="Favorites"
          setOpen={setOpenFavorite}
          mode="AI-Chat"
        />
        <MenuBar open={openMenu} mode="AI-Chat" setOpen={setOpenMenu} />

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
        <div className="flex-1  w-full h-[85%]">
          <ScrollArea
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-1 w-full h-full"
          >
            <div className="flex mr-5  flex-col gap-4 w-full md:p-4 pb-8">
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
                  <div className="flex w-[680px] flex-col  gap-2  ">
                    <div
                      className={` rounded-t-md  break-words break-all overflow-y-auto   rounded-l-lg p-3 ${
                        message.role === "user" ? "bg-muted" : "bg-muted"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typeof message.text === "string"
                          ? message.text
                          : JSON.stringify(message.text ?? "Generating...")}
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
          className=" mt-4 sticky bottom-0 w-full  p-4 bg-background"
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

const ChatwithBoard = React.memo(ChatwithData);

export default ChatwithBoard;
