/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUp,
  Bot,
  Copy,
  Edit,
  Eye,
  Loader2,
  RefreshCw,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  Volume2Icon,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  addFavorite,
  addFeedback,
  createChat,
  createMessage,
  fetchMessages,
} from "../../../files/lib/action";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RenderTable from "./charts/Table";
import {
  getChatFavorites,
  getChatHistory,
  getDataFromDb,
} from "../lib/actions";
import DynamicChart from "./charts/DynamicCharts";
import HistoryBar from "./sidebar/HistoryBar";
import FavoritesBar from "./sidebar/FavoritesBar";
import MenuBar from "./sidebar/MenuBar";

interface PageProps {
  dataProps: {
    api_connection_json?: string;
    content: {
      description: string;
      name: string;
      queries: any[];
      type: string;
    }[];
    story_api?: string;
    data_api_url?: string;
    db_connection_json?: string;
    form_id: number;
    form_name: string;
  };
  chatId?: string;
  formId: number;
  openHistory: boolean;
  setOpenHistory: React.Dispatch<React.SetStateAction<boolean>>;
  openFavorite: boolean;
  setOpenFavorite: React.Dispatch<React.SetStateAction<boolean>>;
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface suggestions {
  id: number;
  api: string;
  description: string;
  query: string;
  name: string;
  type: string;
}

export interface metrics {
  count_order_number: number;
  sum_order_payment_amount: number;
  mean_order_payment_amount: number;
  median_order_payment_amount: number;
  max_order_payment_amount: number;
  min_order_payment_amount: number;
  first_order_date: number | string;
  last_order_date: number | string;
  orders_by_date: number | string;
  orders_by_weekday: number | string;
}

const ConversationalChat = ({
  dataProps,
  chatId,
  formId,
  openHistory,
  setOpenHistory,
  openFavorite,
  setOpenFavorite,
  openMenu,
  setOpenMenu,
}: PageProps) => {
  const [input, setInput] = React.useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    React.useState<suggestions | null>(null);

  const [historyData, setHistoryData] = React.useState<any[]>([]);
  const [favoriteData, setFavoriteData] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const isMessageActionUpdate = useRef(false);
  const [storyApiData, setStoryApiData] = React.useState<unknown>([]);

  useEffect(() => {
    try {
      const fetchStoryApiData = async () => {
        if (dataProps?.story_api) {
          const { story_api } = dataProps;
          const response = await fetch(story_api, {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.SaPQ1nlsFVeVCY9N_AC57AH4r70fAEhe8STPGvM6rBQ",
            },
          });
          const result = await response.json();

          if (!response.ok) {
            toast.error("Error fetching Stories");
            return;
          }
          setStoryApiData(result[0]);
        }
      };
      fetchStoryApiData();
    } catch (error) {
      toast.error(`Error fetching Stories ${error}`);
    }
  }, [dataProps]);

  useEffect(() => {
    if (scrollAreaRef.current && isAtBottom && !isMessageActionUpdate.current) {
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
  }, [messages, isAtBottom, selectedSuggestion]);

  useEffect(() => {
    fetchHistory();
  }, [openHistory]);

  const fetchHistory = async () => {
    try {
      const response: any = await getChatHistory("Conversational Chat");
      setHistoryData(response);
    } catch (error) {
      toast.error("Error fetching history");
      throw error;
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response: any = await getChatFavorites("Conversational Chat");
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
            response_story_json: msg.response_story_json,
            isLike: msg.isLike,
            favorite: msg.favorite,
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollAreaRef.current) {
      const scrollContainer = e.currentTarget;
      const isBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop <=
        scrollContainer.clientHeight + 10;
      setIsAtBottom(isBottom);
    }
  };

  const handleSuggestionClick = async (item: {
    name: string;
    id: number;
    api: string;
    description: string;
    query: string;
    type: string;
    story: string;
  }) => {
    setInput(item.name);
    setSelectedSuggestion(item);
    setLoading(true);
    const { query, api, name, story } = item;
    try {
      const newMsgUuid = uuidv4();
      const userMessageId = uuidv4();
      const assitantMsgId = uuidv4();
      const currentTimeStamp = new Date().toISOString();
      const currentChatId = chatId || newMsgUuid;

      // Create chat if needed
      if (!chatId) {
        const payload = {
          createdAt: currentTimeStamp,
          user_id: session?.user?.user_catalog_id,
          id: newMsgUuid,
          title: name,
          status: "active",
          chat_group: "Conversational Chat",
        };
        const createChatData = await createChat(payload);
        if (!createChatData.success) {
          toast.error("Error creating chat");
          return;
        }
      }

      // Add user message to state and DB
      const userMessage = {
        id: userMessageId,
        chatId: currentChatId,
        content: name,
        text: name,
        role: "user",
        createdAt: currentTimeStamp,
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
      };

      setMessages((prev) => [...prev, userMessage]);
      await createMessage({
        id: userMessageId,
        chatId: currentChatId,
        content: name,
        role: "user",
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
        chat_group: "Conversational Chat",
      });

      // Add initial assistant message
      const initialAssistantMsg = {
        id: assitantMsgId,
        chatId: currentChatId,
        content: "Generating....",
        text: "Generating...",
        role: "assistant",
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
        bookmark: null,
        isLike: null,
        favorite: null,
        response_story_json: null,
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);

      // Handle database or GraphQL response
      let botResponse: any;
      let storyData: unknown = null;

      if (storyApiData?.story_json[0]?.type === "database") {
        try {
          const response = await getDataFromDb(
            dataProps?.db_connection_json,
            query
          );
          const result = response[0].data;
          botResponse = Array.isArray(result)
            ? result[0]?.count !== undefined
              ? result[0].count
              : result?.length > 1
              ? result
              : result
            : result;

          // Generate story if we have a response
          if (botResponse) {
            const storyResponse = await fetch("/api/ai-chat/generate-story", {
              method: "POST",
              body: JSON.stringify({ botResponse, story }),
            });
            const storyResult = await storyResponse.json();
            if (!storyResult.success) {
              toast.error("Error generating story");
            } else {
              storyData = {
                story: storyResult.data,
                metricsStory: storyResult.metrics,
              };
            }
          }

          // Update message with final response and story
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assitantMsgId
                ? {
                    ...msg,
                    text: botResponse,
                    content: botResponse,
                    response_story_json: storyData,
                  }
                : msg
            )
          );

          setLoading(false);
        } catch (error) {
          setLoading(false);
          throw error;
        }
      } else if (storyApiData?.story_json[0]?.type === "graphql") {
        try {
          const response = await fetch("/api/boards/graphql", {
            method: "POST",
            body: JSON.stringify({ query, api }),
          });

          if (!response.ok) {
            toast.error("Error fetching data");
            return;
          }

          const result = await response.json();
          botResponse = Array.isArray(result)
            ? result[0]?.count !== undefined
              ? result[0].count
              : result
            : result;

          // Generate story if we have a response
          if (botResponse) {
            const storyResponse = await fetch("/api/ai-chat/generate-story", {
              method: "POST",
              body: JSON.stringify({ botResponse, story }),
            });
            const storyResult = await storyResponse.json();
            if (!storyResult.success) {
              toast.error("Error generating story");
            } else {
              storyData = {
                story: storyResult.data,
                metricsStory: storyResult.metrics,
              };
            }
          }

          // Update message with final response and story
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assitantMsgId
                ? {
                    ...msg,
                    text: botResponse,
                    content: botResponse,
                    response_story_json: storyData,
                  }
                : msg
            )
          );
        } catch (error) {
          throw error;
        }
      }

      // Save final message to DB
      await createMessage({
        id: assitantMsgId,
        chatId: currentChatId,
        role: "assistant",
        content: JSON.stringify(botResponse),
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
        chat_group: "Conversational Chat",
        response_story_json: storyData,
      });

      // Handle navigation if needed
      if (!chatId) {
        router.push(`/chat/aichat/${formId}/${currentChatId}`);
      }

      setInput("");
      setSelectedSuggestion(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error sending message");
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!input || !selectedSuggestion) return null;
    const { query, api } = selectedSuggestion;
    try {
      const newMsgUuid = uuidv4();
      const userMessageId = uuidv4();
      const assitantMsgId = uuidv4();
      const currentTimeStamp = new Date().toISOString();
      const currentChatId = chatId || newMsgUuid;

      if (!chatId) {
        const payload = {
          createdAt: currentTimeStamp,
          user_id: session?.user?.user_catalog_id,
          id: newMsgUuid,
          title: input,
          status: "active",
          chat_group: "Conversational Chat",
        };
        const createChatData = await createChat(payload);
        if (!createChatData.success) {
          toast.error("Error creating chat");
          return;
        }
      }

      const userMessage = {
        id: userMessageId,
        chatId: currentChatId,
        content: input,
        text: input,
        role: "user",
        createdAt: currentTimeStamp,
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
      };

      setMessages((prev) => [...prev, userMessage]);

      const messagePayload = {
        id: userMessageId,
        chatId: currentChatId,
        content: input,
        role: "user",
        createdAt: currentTimeStamp,
        chat_group: "Conversational Chat",

        user_id: session?.user?.user_catalog_id,
      };
      await createMessage(messagePayload);

      const assistantMsg = {
        id: assitantMsgId,
        chatId: currentChatId,
        content: "",
        role: "assistant",
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
        bookmark: null,
        isLike: null,
        favorite: null,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      let botResponse: any;
      if (storyApiData?.story_json[0]?.queries[0].type === "database") {
        try {
          const response = await getDataFromDb(
            dataProps?.db_connection_json,
            query
          );
          const result = response[0].data;
          if (Array.isArray(result)) {
            if (result[0]?.count !== undefined) {
              botResponse = result[0].count;
            } else if (result?.length > 1) {
              const orders = result;

              botResponse = orders;
            } else {
              botResponse = result;
            }
          } else {
            botResponse = result;
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
          throw error;
        }
        setMessages((prev) => {
          const messages = [...prev];
          if (
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant"
          ) {
            messages[messages.length - 1].text = botResponse;
            messages[messages.length - 1].content = botResponse;
          }
          return messages;
        });
      }

      if (dataProps.content[0].type === "graphql") {
        try {
          const response = await fetch("/api/boards/graphql", {
            method: "POST",
            body: JSON.stringify({ query, api }),
          });
          if (!response.ok) {
            toast.error("Error fetching data");
            return;
          }
          const result = await response.json();

          if (Array.isArray(result)) {
            // Case 1: If it's a list with a "count" property
            if (result[0]?.count !== undefined) {
              botResponse = result[0].count;
            } else {
              botResponse = result;
            }
          } else {
            // Not an array, return as-is
            botResponse = result;
          }
          setMessages((prev) => {
            const messages = [...prev];
            if (
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant"
            ) {
              messages[messages.length - 1].text = botResponse;
              messages[messages.length - 1].content = botResponse;
            }
            return messages;
          });
        } catch (error) {
          throw error;
        }
      }
      await createMessage({
        id: assitantMsgId,
        chatId: currentChatId,
        role: "assistant",
        chat_group: "Conversational Chat",
        content: JSON.stringify(botResponse),
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
      });
      if (!chatId) {
        router.push(`/chat/aichat/${formId}/${currentChatId}`);
      }
      setInput("");
      setSelectedSuggestion(null);
    } catch (error) {
      toast.error("Error sending message");
      throw error;
    }
  };

  const handleFavorite = async (message: any) => {
    const newFavoriteStatus = !message.favorite;

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

  const speak = (text: string) => {
    if (typeof window !== "undefined") {
      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en_US";
      synthesis.speak(utterance);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="  w-full  justify-center  flex flex-col items-center">
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
          formId={formId}
          title=""
          setOpen={setOpenFavorite}
          mode="Conversational-Chat"
        />
        <MenuBar
          open={openMenu}
          formId={formId}
          mode="Conversational-Chat"
          setOpen={setOpenMenu}
        />
        <div className="flex  flex-wrap items-center gap-2.5 justify-center">
          {!dataProps && (
            <p className="text-md text-muted-foreground">No Data Avaliable</p>
          )}
          {storyApiData?.story_json?.length > 0 &&
            storyApiData?.story_json[0].queries.map((item) => (
              <div key={item.id}>
                <Button
                  onClick={() => {
                    setInput(item.name);
                    setSelectedSuggestion(item);
                    setTimeout(() => handleSuggestionClick(item), 0);
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  {item.name}
                </Button>
              </div>
            ))}
          {/* {dataProps &&
            dataProps?.content?.length > 0 &&
            dataProps.content[0].queries.map((item) => (
              <div key={item.id}>
                <Button
                  onClick={() => {
                    setInput(item.name);
                    setSelectedSuggestion(item);
                    setTimeout(() => handleSuggestionClick(item), 0);
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  {item.name}
                </Button>
              </div>
            ))} */}
        </div>
        <ScrollArea
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="h-[calc(70vh-100px)] mt-5 w-full relative"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex gap-2.5 space-y-2.5 items-center"
            >
              <div className="bg-secondary gap-2.5  h-10 w-10 flex items-center flex-col justify-center rounded-full">
                {message.role === "user" ? (
                  <p className="flex flex-col justify-center items-center">
                    {session?.user?.user_name?.[0]?.toUpperCase()}
                  </p>
                ) : (
                  <Bot className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col w-full">
                <div className="bg-muted   rounded-md w-full gap-2.5 p-2.5">
                  {(() => {
                    let parsed;
                    try {
                      parsed =
                        typeof message.text === "string"
                          ? JSON.parse(message.text)
                          : message.text;
                    } catch {
                      parsed = message.text; // fallback to raw string if parse fails
                    }

                    if (Array.isArray(parsed)) {
                      return (
                        <Tabs defaultValue="table" className="w-full">
                          <TabsList defaultValue={"table"}>
                            <TabsTrigger value="table">Table</TabsTrigger>
                            <TabsTrigger value="chart">Chart</TabsTrigger>
                          </TabsList>
                          <TabsContent value="table">
                            <div className="bg-background overflow-x-auto">
                              <RenderTable data={parsed} />
                            </div>
                          </TabsContent>
                          <TabsContent value="chart">
                            <DynamicChart
                              data={parsed}
                              type={selectedSuggestion?.type || "pie-chart"}
                              title={selectedSuggestion?.name}
                              story={message?.response_story_json?.story || ""}
                              metrics={
                                message?.response_story_json?.metricsStory
                              }
                            />
                          </TabsContent>
                        </Tabs>
                      );
                    } else if (typeof parsed === "object") {
                      return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
                    } else {
                      return parsed;
                    }
                  })()}
                </div>
                <div className="mt-2">
                  {message.role === "assistant" && (
                    <div className="flex  md:ml-3 mr-3 items-center gap-5">
                      <div className="flex items-center gap-5">
                        <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        <Star
                          className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                            message.favorite ? "fill-primary text-primary" : ""
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
                        <Volume2Icon
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
        </ScrollArea>
        <form
          className="border flex mt-5 items-center rounded-full w-full p-2.5"
          onSubmit={handleSubmit}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question"
            className="w-full border-none"
          />
          <Button
            disabled={!input || !selectedSuggestion || loading}
            size={"icon"}
            className="rounded-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationalChat;
