/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Archive,
  Bot,
  Copy,
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
import RenderTable from "../atoms/Table";
import {
  getChatFavorites,
  getChatHistory,
  getDataFromDb,
} from "../../lib/actions";
import DynamicChart from "../atoms/DynamicCharts";
import HistoryBar from "../sidebar/HistoryBar";
import FavoritesBar from "../sidebar/FavoritesBar";
import MenuBar from "../sidebar/MenuBar";
import StoryCard from "../atoms/StoryCard";
import CardRender from "../atoms/CardRender";
import { formatDate } from "@/utils/formatDate";

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
  setLoading: (item: boolean) => void;
  setInput: (item: string) => void;
  selectedSuggestion: suggestions | null;
  setSelectedSuggestion: React.Dispatch<
    React.SetStateAction<suggestions | null>
  >;
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

export interface ChartData {
  type: string;
  title: string;
  xaxis: string;
  yaxis: string;
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
  setLoading,
  setInput,
  selectedSuggestion,
  setSelectedSuggestion,
}: PageProps) => {
  // const [selectedSuggestion, setSelectedSuggestion] =
  //   React.useState<suggestions | null>(null);

  const [historyData, setHistoryData] = React.useState<any[]>([]);
  const [favoriteData, setFavoriteData] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  // const [selectedTableColumns, setSelectedTableColumns] = React.useState<
  //   string[] | undefined
  // >(undefined);
  // const [selectedCardColumns, setSelectedCardColumns] = React.useState<
  //   string[] | undefined
  // >(undefined);
  // const [chartData, setChatData] = React.useState<ChartData>();
  // const [storyApi, setStoryApi] = React.useState<string | undefined>();

  const { data: session } = useSession();
  const router = useRouter();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const isMessageActionUpdate = useRef(false);
  const [storyApiData, setStoryApiData] = React.useState<any>([]);

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
        } else {
          setStoryApiData(dataProps?.content[0]);
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
            table_columns: msg.table_columns,
            chart: msg.chart,
            story_api: msg.story_api,
            cards: msg.cards,
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
    field?: string;
    table_columns?: string[];
    chart?: ChartData;
    cards?: string[];
    story_api?: string;
  }) => {
    setInput(item.name);
    setSelectedSuggestion(item);
    // setSelectedTableColumns(item.table_columns);
    // setSelectedCardColumns(item.cards);
    // setChatData(item.chart);
    setLoading(true);
    // setStoryApi(item?.story_api);
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
        table_columns: item.table_columns, // add this
        chart: item.chart, // add this
        cards: item.cards, // add this
        story_api: item.story_api,
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);

      // Handle database or GraphQL response
      let botResponse: any;
      let storyData: unknown = null;

      if (storyApiData?.type === "database") {
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
                    table_columns: item.table_columns, // ensure these are set
                    chart: item.chart,
                    cards: item.cards,
                    story_api: item.story_api,
                  }
                : msg
            )
          );

          setLoading(false);
        } catch (error) {
          setLoading(false);
          throw error;
        }
      } else if (storyApiData?.type === "api") {
        try {
          const field: any = item.field;
          const response = await fetch(item.api, {
            method: "GET",
            headers: {
              Authorization: dataProps.api_connection_json!,
            },
          });
          const result = await response.json();
          const keys =
            field &&
            field
              .match(/\['(.+?)'\]/g)
              .map((k: any) => k.replace(/\['|'\]/g, ""));

          const value =
            keys &&
            keys.reduce(
              (obj: any, key: any) => (obj ? obj[key] : undefined),
              result
            );

          botResponse = Array.isArray(result) ? JSON.stringify(result) : value;

          // Generate story if we have a response
          // if (botResponse) {
          //   const storyResponse = await fetch("/api/ai-chat/generate-story", {
          //     method: "POST",
          //     body: JSON.stringify({ botResponse, story }),
          //   });
          //   const storyResult = await storyResponse.json();
          //   console.log("result------", storyResult);
          //   if (!storyResult.success) {
          //     toast.error("Error generating story");
          //   } else {
          //     storyData = {
          //       story: storyResult.data,
          //       metricsStory: storyResult.metrics,
          //     };
          //   }
          // }

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
      } else if (storyApiData?.type === "graphql") {
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
        content: botResponse,
        table_columns: item.table_columns,
        chart: item.chart,
        cards: item.cards,
        story_api: item.story_api,
        createdAt: currentTimeStamp,
        user_id: session?.user?.user_catalog_id,
        chat_group: "Conversational Chat",
        response_story_json: storyData,
      });

      // Handle navigation if needed
      if (!chatId) {
        router.push(`/aichat/${formId}/${currentChatId}`);
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
    <div className="flex h-full  md:max-h-[78%]  flex-col">
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
      <ScrollArea
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="h-full  overflow-y-auto"
      >
        <div className="flex flex-wrap mb-2 items-start gap-2.5">
          {!dataProps && (
            <p className="text-md text-muted-foreground">No Data Avaliable</p>
          )}
          {storyApiData?.queries?.length > 0 &&
            storyApiData?.queries.map((item: any) => (
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
        </div>

        {messages.map((message) => (
          <div key={message.id} className="flex flex-col ">
            <div className="flex items-center gap-2.5">
              <div className="bg-secondary   gap-2.5  h-10 w-10 flex items-center flex-col justify-center rounded-full">
                {message.role === "user" ? (
                  <p className="flex flex-col  justify-center items-center">
                    {session?.user?.user_name?.[0].toUpperCase() ||
                      message?.created_user_name?.[0].toUpperCase()}
                  </p>
                ) : (
                  <Bot className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(new Date(message.createdAt))}
              </span>
            </div>
            <div className="flex flex-col w-full">
              <div className=" overflow-x-auto md:max-w-[790px] max-w-full  rounded-md w-full gap-2.5 p-2.5">
                {(() => {
                  let parsed;
                  try {
                    parsed =
                      typeof message.text === "string"
                        ? JSON.parse(message.text)
                        : message.text;
                  } catch {
                    parsed = message.text;
                  }

                  if (Array.isArray(parsed)) {
                    return (
                      <div className="w-full">
                        <Tabs defaultValue="chart" className="w-full">
                          <TabsList defaultValue={"chart"}>
                            <TabsTrigger value="chart">Chart</TabsTrigger>
                            <TabsTrigger value="table">Table</TabsTrigger>
                            <TabsTrigger value="cards">Cards</TabsTrigger>
                          </TabsList>
                          <TabsContent value="chart">
                            <div className="w-full overflow-x-auto">
                              <DynamicChart
                                data={parsed}
                                chart={message.chart}
                                type={
                                  selectedSuggestion?.type &&
                                  selectedSuggestion?.type
                                }
                                story_api={message.story_api}
                                title={selectedSuggestion?.name}
                                story={
                                  message?.response_story_json?.story || ""
                                }
                                metrics={
                                  message?.response_story_json?.metricsStory
                                }
                              />
                            </div>
                          </TabsContent>
                          <TabsContent
                            value="table"
                            className="overflow-x-auto"
                          >
                            <div>
                              <RenderTable
                                data={parsed}
                                columns={message.table_columns}
                              />
                            </div>
                          </TabsContent>
                          <TabsContent value="cards">
                            <div className="w-full">
                              <CardRender
                                data={parsed}
                                columns={message.cards}
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                        <StoryCard
                          story_api={message.story_api}
                          data={parsed}
                        />
                      </div>
                    );
                  } else if (typeof parsed === "object") {
                    return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
                  } else {
                    return parsed;
                  }
                })()}
              </div>
              <div className="mt-2  flex md:max-w-[770px] max-w-[360px] mx-auto w-full  mb-2">
                {message.role === "assistant" && (
                  <div className="flex mx-auto  w-full  items-center gap-5">
                    <div className="flex items-center gap-5">
                      {/* <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" /> */}
                      <Copy
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          toast.success("Copied to clipboard");
                        }}
                        className="w-5 h-5 cursor-pointer text-muted-foreground"
                      />
                      {/* <RefreshCw className="w-5 h-5 cursor-pointer text-muted-foreground" /> */}
                      {/* <Share2 className="w-5 h-5 cursor-pointer text-muted-foreground" /> */}
                      {/* <Edit className="w-5 h-5 cursor-pointer text-muted-foreground" /> */}
                      <Volume2Icon
                        onClick={() => speak(message.text)}
                        className="w-5 h-5 cursor-pointer text-muted-foreground"
                      />
                      <ThumbsUp
                        onClick={() => handleLike(message, true)}
                        className={`w-5 h-5 ${
                          message.isLike === true && "fill-primary text-primary"
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
                    <div className="flex items-center justify-end  gap-5 w-full">
                      <Star
                        className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                          message.favorite ? "fill-primary text-primary" : ""
                        }`}
                        onClick={() => handleFavorite(message)}
                      />
                      <Archive className="w-5 h-5 cursor-not-allowed text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ConversationalChat;
