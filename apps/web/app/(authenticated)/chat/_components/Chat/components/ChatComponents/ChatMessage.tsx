/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlarmClockPlus,
  Copy,
  Download,
  Edit,
  Eye,
  File,
  FileAudio,
  FileDownIcon,
  FileImage,
  FilePen,
  FileVideo,
  Forward,
  Pause,
  Play,
  RefreshCw,
  Reply,
  Share2,
  Sparkle,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import supabaseClient from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  createMessage,
  getMessages,
  updateMessageIcon,
} from "@/app/(authenticated)/chat/lib/actions";
// import { getDataFromDb } from "@/app/(authenticated)/chat/aichat/lib/actions";
import RenderTable from "@/app/(authenticated)/aichat/_components/atoms/Table";
import DynamicChart from "@/app/(authenticated)/aichat/_components/atoms/DynamicCharts";

interface suggestions {
  id: number;
  api: string;
  description: string;
  query: string;
  name: string;
  type: string;
  field: string;
  table_columns?: string[];
  chart?: {
    title: string;
    type: string;
    xaxis: string;
    yaxis: string;
  };
}

const ChatMessage = ({
  messages,
  setMessages,
  isGroup,
  chatId,
  inputRef,
  setRepliedMessage,
}: {
  messages: any;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  isGroup: boolean;
  chatId?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setRepliedMessage: React.Dispatch<any>;
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: session } = useSession();

  const generateRoomId = (
    sessionId: string | number,
    chatId: number | string
  ) => {
    return [sessionId, chatId].sort().join("_");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId || !session?.user?.user_catalog_id) return;

    const roomId: string = isGroup
      ? chatId
      : generateRoomId(session?.user?.user_catalog_id, chatId);

    let channel: any;

    const fetchMessages = async () => {
      try {
        const response = await getMessages(roomId);
        const normalizedMessages = response.map((msg: any) => ({
          ...msg,
          messageUniqueId: msg.id || msg.agentMsgId || uuidv4(),
        }));
        setMessages(normalizedMessages);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch messages");
      }
    };

    const listenToNewMessages = () => {
      channel = supabaseClient
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "message",
            filter: `soc_room_id=eq.${roomId}`,
          },
          (payload) => {
            const newMessage = {
              ...payload.new,
              messageUniqueId: payload.new.id || uuidv4(),
            };

            setMessages((prev: any[]) => [...prev, newMessage]);
          }
        )
        .subscribe();
    };

    listenToNewMessages();
    fetchMessages();

    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [chatId, session, isGroup, setMessages]);

  const findRepliedMessageContent = (repliedToMessageId: string) => {
    // Try to find the replied message using different possible identifiers
    return messages.find(
      (msg: any) =>
        msg.messageUniqueId === repliedToMessageId ||
        msg.id === repliedToMessageId ||
        msg.agentMsgId === repliedToMessageId
    )?.chat_message;
  };

  const generateFileIcon = (type: string) => {
    if (type.includes("audio")) {
      return <FileAudio className="w-5 h-5" />;
    } else if (type.includes("video")) {
      return <FileVideo className="w-5 h-5" />;
    } else if (type.includes("image")) {
      return <FileImage className="w-5 h-5" />;
    } else if (type.includes("pdf")) {
      return <File className="w-5 h-5" />;
    } else if (type.includes("doc")) {
      return <FileDownIcon className="w-5 h-5" />;
    }
  };

  const playAudio = (url: string, type: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => {
        setIsAudioPlaying(false);
      });
    }

    if (type === "play") {
      setIsAudioPlaying(true);
      audioRef.current.play();
    } else {
      setIsAudioPlaying(false);
      audioRef.current.pause();
    }
  };

  const handleDownload = async (url: string, name: string) => {
    if (!url || !name) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.log(error);
      toast.error("Failed to download file");
    }
  };

  const handleSuggestionClick = async (item: suggestions, message: any) => {
    const unqChatId = uuidv4();
    try {
      if (!message.api_connection_json) return;
      const field = item.field;

      let botResponse: any;
      // if(message.db_connection_json){
      // const response = await getDataFromDb(
      //   JSON.parse(message.db_connection_json),
      //   item.query
      // )
      const response = await fetch(item.api, {
        method: "GET",
        headers: {
          Authorization: message.api_connection_json!,
        },
      });
      const result = await response.json();
      const keys =
        field &&
        field.match(/\['(.+?)'\]/g).map((k) => k.replace(/\['|'\]/g, ""));

      const value =
        keys && keys.reduce((obj, key) => (obj ? obj[key] : undefined), result);

      // eslint-disable-next-line prefer-const
      botResponse = Array.isArray(result) ? JSON.stringify(result) : value;

      const botMessage = {
        created_date: new Date().toISOString(),
        id: unqChatId,
        created_user_name: message.user_name,
        chat_message_type: "agent_response",
        sender_id: session?.user?.user_catalog_id,
        soc_room_id: message.soc_room_id,
        // created_user_name: item.user_name,
        chat_message: botResponse,
        table_columns: item.table_columns,
        chart: item.chart,
      };
      await createMessage(botMessage);
    } catch (error) {
      toast.error("Error fetching data");
      throw error;
    }
  };

  const handleIconClick = async (message: any, icon: string) => {
    try {
      const messageId =
        message.id || message.messageUniqueId || message.agentMsgId;

      if (!messageId) {
        toast.error("Invalid message ID");
        return;
      }

      await updateMessageIcon(
        messageId,
        icon,
        icon === "important" ? message.important : message.favorite
      );
      setMessages(
        messages.map((msg: any) => {
          // Match message using all possible ID fields
          const isMatchingMessage =
            msg.id === messageId ||
            msg.messageUniqueId === messageId ||
            msg.agentMsgId === messageId;

          if (isMatchingMessage) {
            return {
              ...msg,
              ...(icon === "important"
                ? { important: !message.important }
                : { favorite: !message.favorite }),
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to update message");
    }
  };

  const handleReply = (message: any) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setRepliedMessage(message);
  };

  return (
    <div className="max-h-[70%] mt-5 h-full ">
      <ScrollArea ref={scrollAreaRef} className=" h-full overflow-y-auto">
        <div className="flex flex-col gap-4 w-full md:p-4 p-2">
          {messages.map((message: any, index: number) => (
            <div
              key={index}
              ref={messagesEndRef}
              className="flex items-start gap-2 w-full justify-start flex-wrap sm:flex-nowrap"
            >
              <div className="flex bg-secondary rounded-full h-10 w-10 flex-shrink-0 flex-col items-center justify-center">
                {message.from_business_number ===
                session?.user?.business_number ? (
                  <Avatar className="h-10 w-10 flex items-center justify-center">
                    <AvatarImage alt={session?.user?.user_name || "User"} />
                    <AvatarFallback>
                      {session?.user?.user_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-10 w-10 flex items-center justify-center">
                    <AvatarImage
                      src={message?.profile_pic_url}
                      alt={message?.created_user_name || "User"}
                    />
                    <AvatarFallback>
                      {message?.created_user_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className="flex flex-col w-full gap-2">
                {message.is_forwared && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground  p-2 rounded-md">
                    <Forward className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span>Forwarded by {message.forwared_by_user_name}</span>
                      {message.original_sender && (
                        <span className="text-xs">
                          Originally from: {message.original_sender}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {/* {new Date(message.created_date).toLocaleTimeString()} -{" "} */}
                  {new Date(message.created_date).toLocaleDateString()}
                </span>
                {message.replied_to_message_id && (
                  <div className="flex items-center w-full gap-2 flex-wrap">
                    <span className="text-sm font-semibold">Replied to: </span>
                    <span className="text-sm break-words">
                      {findRepliedMessageContent(
                        message.replied_to_message_id ||
                          message.ref_chat_message_id
                      ) || "Original message"}
                    </span>
                  </div>
                )}
                <div className="flex items-start w-full gap-2 flex-wrap sm:flex-nowrap">
                  <div className="rounded-t-md relative w-full rounded-l-lg p-3 ">
                    {message.attachment_url && message.attachment_type ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {message.attachment_type.includes("image") ? (
                          <Image
                            src={message.attachment_url}
                            alt={message.attachment_name || "Attachment image"}
                            className="max-h-[250px] h-full w-full  object-cover rounded-md"
                            width={350}
                            height={200}
                            priority
                            unoptimized={true}
                          />
                        ) : message.attachment_type.includes("video") ? (
                          <video
                            src={message.attachment_url}
                            className="max-h-[250px] w-full rounded-md"
                            width={100}
                            controls
                            height={100}
                          />
                        ) : (
                          <>
                            {generateFileIcon(message.attachment_type)}
                            <span className="break-words">
                              {message.attachment_name}
                            </span>
                            {message.attachment_type.includes("audio") && (
                              <div className="flex items-center gap-2">
                                {isAudioPlaying ? (
                                  <Pause
                                    onClick={() =>
                                      playAudio(message.attachment_url, "pause")
                                    }
                                    className="w-5 h-5 cursor-pointer text-muted-foreground"
                                  />
                                ) : (
                                  <Play
                                    className="w-5 h-5 cursor-pointer text-muted-foreground"
                                    onClick={() =>
                                      playAudio(message.attachment_url, "play")
                                    }
                                  />
                                )}
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex gap-2 mt-2 w-full">
                          <Link
                            href={`/chat/contacts/messages/${chatId}/viewFile/${message.id}`}
                            target="_blank"
                          >
                            <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" />
                          </Link>
                          <Download
                            className="w-5 h-5 cursor-pointer text-muted-foreground"
                            onClick={() =>
                              handleDownload(
                                message.attachment_url,
                                message.attachment_name
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="break-words">
                        {message.chat_message_type === "agent_response" ? (
                          <div className="w-full overflow-x-auto">
                            {(() => {
                              try {
                                const parsedData =
                                  typeof message.chat_message === "string"
                                    ? JSON.parse(message.chat_message)
                                    : message.chat_message;

                                const chart = message.chart && message.chart;

                                if (
                                  Array.isArray(parsedData) &&
                                  parsedData.length > 0
                                ) {
                                  return (
                                    <Tabs
                                      defaultValue="table"
                                      className="w-full"
                                    >
                                      <TabsList>
                                        <TabsTrigger value="table">
                                          Table
                                        </TabsTrigger>
                                        <TabsTrigger value="chart">
                                          Chart
                                        </TabsTrigger>
                                      </TabsList>
                                      <TabsContent value="table">
                                        <div className="bg-background">
                                          <RenderTable
                                            data={parsedData}
                                            columns={message.table_columns}
                                          />
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="chart">
                                        <DynamicChart
                                          data={parsedData}
                                          chart={chart || message.chart}
                                          type={chart?.type && chart?.type}
                                          title={chart?.name}
                                          story={
                                            message?.response_story_json
                                              ?.story || ""
                                          }
                                          metrics={
                                            message?.response_story_json
                                              ?.metricsStory
                                          }
                                        />
                                      </TabsContent>
                                    </Tabs>
                                  );
                                }
                              } catch (error) {
                                console.error("Error parsing message:", error);
                              }
                              return (
                                <div className="break-words">
                                  {message.chat_message}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="break-words">
                            {message.chat_message}
                          </div>
                        )}
                        {message.selected_form_id && (
                          <Link
                            href={`/chat/forms/${message.selected_form_id}`}
                          >
                            <FilePen className="w-5 h-5 text-muted-foreground mt-2.5" />
                          </Link>
                        )}
                        {message.chat_message_type === "agent_message" && (
                          <div className="flex items-center gap-2.5 flex-wrap mt-2.5">
                            {message?.content_json &&
                              message?.content_json?.[0]?.queries.map(
                                (item: any) => (
                                  <div key={item.id}>
                                    <Button
                                      onClick={() => {
                                        setTimeout(
                                          () =>
                                            handleSuggestionClick(
                                              item,
                                              message
                                            ),
                                          0
                                        );
                                      }}
                                      variant="outline"
                                      className="rounded-full"
                                    >
                                      {item.name}
                                    </Button>
                                  </div>
                                )
                              )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute">
                      {message.reactions && (
                        <div className="flex items-center bg-gray-200 rounded-full p-1 gap-2">
                          {message?.reactions}
                        </div>
                      )}
                    </div>
                    <div className="absolute flex items-center gap-2 right-2 pt-2 bottom-0 translate-y-full mt-2">
                      <Sparkle
                        onClick={() => handleIconClick(message, "important")}
                        className={`h-5 w-5 cursor-pointer text-muted-foreground ${
                          message.important ? "fill-primary text-primary" : ""
                        }`}
                      />
                      <Star
                        onClick={() => handleIconClick(message, "favorite")}
                        className={`h-5 w-5 cursor-pointer text-muted-foreground ${
                          message.favorite ? "fill-primary text-primary" : ""
                        }`}
                      />
                      <AlarmClockPlus
                        className={`h-5 w-5 cursor-pointer text-muted-foreground`}
                      />
                      <Reply
                        className="h-5 w-5 cursor-pointer text-muted-foreground "
                        onClick={() => handleReply(message)}
                      />
                      <Link href={`/chat/forward/${message.agentMsgId}`}>
                        <Forward className="h-5 w-5 cursor-pointer text-muted-foreground " />
                      </Link>
                    </div>
                  </div>
                  {/* <span className="text-muted-foreground cursor-pointer hidden sm:block">
                      <Reply
                        className="w-5 h-5"
                        onClick={() => handleReply(message)}
                      />
                    </span> */}
                </div>

                <div ref={messagesEndRef}></div>

                <div>
                  {message.role === "assistant" && (
                    <div className="flex md:ml-3 items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        <Star
                          className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                            message.favorite ? "fill-primary text-primary" : ""
                          }`}
                        />
                        <Copy className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        <RefreshCw className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        <Share2 className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        <Edit className="w-5 h-5 cursor-pointer text-muted-foreground" />
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
  );
};

export default ChatMessage;
