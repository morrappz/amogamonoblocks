/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AlarmClockPlus,
  ArrowLeft,
  ArrowUp,
  Bot,
  Copy,
  Download,
  Edit,
  Eye,
  File,
  FileAudio,
  FileDownIcon,
  FileImage,
  FileUp,
  FileVideo,
  Forward,
  History,
  Menu,
  Pause,
  Play,
  RefreshCw,
  Reply,
  Share2,
  Sparkle,
  Star,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
// import { EmojiPicker } from "@/components/ui/emoji-picker";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  addLatestMessage,
  createMessage,
  fetchFormSetupData,
  getGroupData,
  getLatestMessages,
  getMessages,
  getReceiverUserData,
  updateLatestMessage,
  updateMessageIcon,
  uploadFile,
} from "../../../../lib/actions";
import supabaseClient from "@/lib/supabaseClient";
import { getDataFromDb } from "@/app/(authenticated)/aichat/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PieChart from "../PieChart";

interface suggestions {
  id: number;
  api: string;
  description: string;
  query: string;
  name: string;
  type: string;
}

// ** THIS COMPONENT IS NOT USED BUT THIS KEPT FOR REFERENCE ** //
const ChatMessages = ({
  chatId,
  isGroup,
}: {
  chatId?: string;
  isGroup: boolean;
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [groupData, setGroupData] = useState<any>(null);
  const [repliedMessage, setRepliedMessage] = useState<any>(null);
  const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [recipientDetails, setRecipientDetails] = useState<any>(null);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const { data: session } = useSession();
  const [showCommands, setShowCommands] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [attachments, setAttachments] = useState<any>({
    attachment_url: "",
    attachment_type: "",
    attachment_name: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const generateRoomId = (
    sessionId: string | number,
    chatId: number | string
  ) => {
    return [sessionId, chatId].sort().join("_");
  };

  useEffect(() => {
    const fetchLatestMessage = async () => {
      const response = await getLatestMessages();
      setLatestMessage(response);
    };
    fetchLatestMessage();
  }, []);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (isGroup) {
        try {
          const response = await getGroupData(chatId);
          if (response) {
            setGroupData(response[0]);
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to fetch group data");
        }
      }
    };
    fetchGroupData();
  }, [chatId, isGroup]);

  const filteredAgents = useMemo(() => {
    if (!groupData) return;
    if (groupData) {
      const userDetails = groupData?.chat_group_users_json;
      const filterAgentBots = userDetails.filter(
        (user) => user.user_group_list === "Analytic Assistant"
      );

      return filterAgentBots;
    }
  }, [groupData]);

  const filteredGroupUsers = useMemo(() => {
    if (!groupData) return;
    if (groupData) {
      const userDetails = groupData?.chat_group_users_json;
      const filteredUsers = userDetails.filter(
        (user) => user.user_group_list !== "Analytic Assistant"
      );
      return filteredUsers;
    }
  }, [groupData]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!chatId) return;

      try {
        const response = await getReceiverUserData(parseInt(chatId));

        if (response) {
          setRecipientDetails(response?.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch user details");
      }
    };

    fetchUserDetails();
  }, [chatId]);

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
  }, [chatId, session, isGroup]);

  useEffect(() => {
    if (chatId && session?.user?.user_catalog_id) {
      const roomId = isGroup
        ? chatId
        : generateRoomId(session?.user?.user_catalog_id, chatId);

      console.log(`Joined room: ${roomId}`);
    }
  }, [chatId, session, isGroup]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatId || !session?.user?.user_catalog_id) return;

    const roomId = isGroup
      ? chatId
      : generateRoomId(session?.user?.user_catalog_id, chatId);

    const unqChatId = uuidv4();

    const payload = {
      id: unqChatId,
      created_user_id: session?.user?.user_catalog_id,
      created_user_name: session?.user?.user_name,
      created_date: new Date().toISOString(),
      replied_to_message_id:
        repliedMessage?.messageUniqueId ||
        repliedMessage?.id ||
        repliedMessage?.agentMsgId,
      chat_message_type: "text",
      soc_room_id: roomId,
      attachment_url: attachments?.attachment_url,
      attachment_type: attachments?.attachment_type,
      attachment_name: attachments?.attachment_name,
      sender_id: session?.user?.user_catalog_id,
      receiver_user_id: isGroup ? null : recipientDetails[0]?.user_catalog_id,
      receiver_group_id: isGroup ? chatId : null,
      chat_message: message,
      from_business_number: session?.user?.business_number,
      from_business_name: session?.user?.business_name,
      to_business_number: recipientDetails[0]?.business_number,
      to_business_name: recipientDetails[0]?.business_name,
      for_business_number: recipientDetails[0]?.business_number,
      for_business_name: recipientDetails[0]?.business_name,
    };

    try {
      // await axiosInstance.post(CHAT_MESSAGE_API, payload);

      await createMessage(payload);

      // Check if there's an existing latest message for this specific conversation
      const existingLatestMessage =
        latestMessage && latestMessage.length > 0
          ? latestMessage.find((msg: any) =>
              isGroup
                ? // For group messages, match by group ID
                  msg.receiver_group_name == chatId
                : // For direct messages, match by sender/receiver pair
                  (msg.sender_id == session?.user?.user_catalog_id &&
                    msg.receiver_id == recipientDetails[0]?.user_catalog_id) ||
                  (msg.sender_id == recipientDetails[0]?.user_catalog_id &&
                    msg.receiver_id == session?.user?.user_catalog_id)
            )
          : null;

      const latestMessagePayload = {
        sender_id: session?.user?.user_catalog_id,
        receiver_id: recipientDetails[0]?.user_catalog_id,
        sender_user_name: session?.user?.user_name,
        receiver_user_name: recipientDetails[0]?.first_name,
        receiver_group_name: isGroup ? chatId : null,
        chat_message: message,
        created_datetime: new Date().toISOString(),
        created_user_id: session?.user?.user_catalog_id,
      };

      if (existingLatestMessage) {
        // Update existing latest message for this conversation
        // await axiosInstance.patch(
        //   `${LATEST_MESSAGE_API}?id=eq.${existingLatestMessage.id}`,
        //   latestMessagePayload
        // );
        await updateLatestMessage(
          latestMessagePayload,
          existingLatestMessage.id
        );
      } else {
        // await axiosInstance.post(LATEST_MESSAGE_API, latestMessagePayload);
        await addLatestMessage(latestMessagePayload);
      }

      setMessage("");
      setAttachments({
        attachment_url: "",
        attachment_type: "",
        attachment_name: "",
      });
      setRepliedMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to send message");
    }
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

  const handleIconClick = async (message: any, icon: string) => {
    try {
      // await axiosInstance.patch(
      //   `${CHAT_MESSAGE_API}?id=eq.${message.id}`,
      //   icon === "important"
      //     ? { important: !message.important }
      //     : { favorite: !message.favorite }
      // );
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
        messages.map((msg) => {
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

  // const handleEmoji = async (value: string, message: any) => {
  //   if (!value || !message) return;
  //   try {
  //     await axiosInstance.patch(`${CHAT_MESSAGE_API}?id=eq.${message.id}`, {
  //       reactions: value,
  //     });
  //     setMessages(
  //       messages.map((msg) =>
  //         msg.id === message.id
  //           ? {
  //               ...msg,
  //               reactions: value,
  //             }
  //           : msg
  //       )
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Failed to update message");
  //   }
  // };

  const handleReply = (message: any) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setRepliedMessage(message);
  };

  const findRepliedMessageContent = (repliedToMessageId: string) => {
    // Try to find the replied message using different possible identifiers
    return messages.find(
      (msg) =>
        msg.messageUniqueId === repliedToMessageId ||
        msg.id === repliedToMessageId ||
        msg.agentMsgId === repliedToMessageId
    )?.chat_message;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setFileUploadLoading(false);
      return;
    }
    setMessage(file.name || "");
    const formData = new FormData();
    formData.append("file", file);

    try {
      let fileType = "others";
      if (file) {
        if (file?.type.includes("image")) {
          fileType = "media";
        } else if (file?.type.includes("pdf")) {
          fileType = "pdf";
        } else if (file?.type.includes("csv")) {
          fileType = "csv";
        } else if (
          file?.type.includes("xlsx") ||
          file?.type.includes("spreadsheetml") ||
          file?.name.toLowerCase().endsWith(".xlsx") ||
          file?.name.toLowerCase().endsWith(".xls")
        ) {
          fileType = "xlsx";
        } else if (
          file?.type.includes("docx") ||
          file?.type.includes("document") ||
          file?.name.toLowerCase().endsWith(".docx") ||
          file?.name.toLowerCase().endsWith(".doc")
        ) {
          fileType = "docx";
        } else if (
          file?.type.includes("pptx") ||
          file?.type.includes("presentation") ||
          file?.name.toLowerCase().endsWith(".pptx") ||
          file?.name.toLowerCase().endsWith(".ppt")
        ) {
          fileType = "pptx";
        }
      }

      const folderPath = `${session?.user?.user_name}/chat/${fileType}`;
      // const response = await UploadAttachment({
      //   file: file,
      //   fileName: file?.name || "",
      //   folderName: folderPath,
      // });
      const response = await uploadFile(
        file,
        file?.name,
        folderPath,
        fileType,
        "chat_files"
      );
      setAttachments({
        attachment_url: response.url,
        attachment_type: file?.type,
        attachment_name: file?.name,
      });
    } catch (error) {
      toast.error(`Error Uploading File ${error}`);
    } finally {
      setFileUploadLoading(false);
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

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value === "/") {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
    const lastValue = value && value.split("").pop();
    if (lastValue?.startsWith("@")) {
      setShowUsers(true);
    }
  };

  const handleUserSelect = (user: string) => {
    setMessage((prev) => prev + `${user} `);
    setShowUsers(false);
  };

  const handleCommands = async (item) => {
    if (!chatId || !session?.user?.user_catalog_id) return;

    const roomId = isGroup
      ? chatId
      : generateRoomId(session?.user?.user_catalog_id, chatId);
    const unqChatId = uuidv4();

    const response = await fetchFormSetupData(item.agent_uuid);
    if (!response.success) {
      toast.error("Failed to fetch data");
      return;
    }
    const storyApiUrl = response.data[0]?.story_api;
    const fetchStoryJson = await fetch(storyApiUrl);
    const result = await fetchStoryJson.json();

    // setDbConnectionStr(response.data[0]?.db_connection_json);
    setShowCommands(false);
    const botMessage = {
      id: unqChatId,
      created_date: new Date().toISOString(),
      created_user_name: item.user_name,
      chat_message: `Starting conversation with ${item.user_name}...`,
      sender_id: item.user_catalog_id,
      chat_message_type: "agent_message",
      soc_room_id: roomId,
      story_json: result[0],
      db_connection_json: response.data[0]?.db_connection_json,
    };
    // setMessages((prev) => [...prev, botMessage]);
    await createMessage(botMessage);
  };

  const handleSuggestionClick = async (item: suggestions, message: unknown) => {
    const unqChatId = uuidv4();
    try {
      let botResponse: any;
      const response = await getDataFromDb(
        JSON.parse(message.db_connection_json),
        item.query
      );
      const result = response[0].data;

      // eslint-disable-next-line prefer-const
      botResponse = Array.isArray(result)
        ? result[0]?.count !== undefined
          ? result[0].count
          : result?.length > 1
          ? result
          : result
        : result;
      const botMessage = {
        created_date: new Date().toISOString(),
        id: unqChatId,
        created_user_name: message.user_name,
        chat_message_type: "agent_response",
        sender_id: session?.user?.user_catalog_id,
        soc_room_id: message.soc_room_id,
        // created_user_name: item.user_name,
        chat_message: botResponse,
      };
      await createMessage(botMessage);
    } catch (error) {
      toast.error("Error fetching data");
      throw error;
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex border-b border-gray-200 pb-5 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <h1 className="flex text-xl font-semibold items-center gap-2">
              <Bot className="w-5 h-5 text-muted-foreground" />
              {isGroup ? groupData?.chat_group_name : "Chat"}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {groupData && (
              <div className="flex gap-4 items-center">
                <Avatar className="flex items-center justify-center bg-muted rounded-full h-10 w-10">
                  <AvatarImage src={groupData?.profile_pic_url} />
                  <AvatarFallback>
                    {groupData?.created_user?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {groupData?.chat_group_users_json?.map(
                  (item: any, index: number) => (
                    <Avatar
                      key={index}
                      className="flex items-center justify-center bg-muted rounded-full h-10 w-10 -ml-2"
                    >
                      <AvatarImage src={item.profile_pic_url} />
                      <AvatarFallback>
                        {item?.first_name ? (
                          item?.first_name?.charAt(0).toUpperCase()
                        ) : (
                          <Bot className="w-5 h-5 text-muted-foreground" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-5">
          <Link href="/chat">
            <span className="text-muted-foreground cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </span>
          </Link>
          <span className="text-muted-foreground cursor-pointer">
            <History className="w-5 h-5" />
          </span>
          <span className="text-muted-foreground cursor-pointer">
            <Star className="w-5 h-5" />
          </span>
          <span className="text-muted-foreground cursor-pointer">
            <Menu className="w-5 h-5" />
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[calc(70vh-100px)] w-full relative"
        >
          <div className="flex flex-col gap-4 w-full md:p-4 p-2">
            {messages.map((message, index) => (
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
                        <span>
                          Forwarded by {message.forwared_by_user_name}
                        </span>
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
                      <span className="text-sm font-semibold">
                        Replied to:{" "}
                      </span>
                      <span className="text-sm break-words">
                        {findRepliedMessageContent(
                          message.replied_to_message_id ||
                            message.ref_chat_message_id
                        ) || "Original message"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start w-full gap-2 flex-wrap sm:flex-nowrap">
                    {/* <div className="relative"> */}
                    {/* <EmojiPicker
                      onChange={(value) => handleEmoji(value, message)}
                    /> */}
                    {/* </div> */}
                    <div className="rounded-t-md relative w-full rounded-l-lg p-3 bg-muted">
                      {message.attachment_url && message.attachment_type ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {message.attachment_type.includes("image") ? (
                            <Image
                              src={message.attachment_url}
                              alt={
                                message.attachment_name || "Attachment image"
                              }
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
                                        playAudio(
                                          message.attachment_url,
                                          "pause"
                                        )
                                      }
                                      className="w-5 h-5 cursor-pointer text-muted-foreground"
                                    />
                                  ) : (
                                    <Play
                                      className="w-5 h-5 cursor-pointer text-muted-foreground"
                                      onClick={() =>
                                        playAudio(
                                          message.attachment_url,
                                          "play"
                                        )
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
                                            <table className="w-full border-collapse">
                                              <thead>
                                                <tr className="bg-secondary">
                                                  {Object.keys(
                                                    parsedData[0]
                                                  ).map((header) => (
                                                    <th
                                                      key={header}
                                                      className="p-2 text-left border border-border"
                                                    >
                                                      {header
                                                        .split("_")
                                                        .map(
                                                          (word) =>
                                                            word
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                            word.slice(1)
                                                        )
                                                        .join(" ")}
                                                    </th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {parsedData.map(
                                                  (row, index) => (
                                                    <tr
                                                      key={index}
                                                      className="hover:bg-muted/50"
                                                    >
                                                      {Object.values(row).map(
                                                        (
                                                          cell: any,
                                                          cellIndex
                                                        ) => (
                                                          <td
                                                            key={cellIndex}
                                                            className="p-2 border border-border"
                                                          >
                                                            {cell === null ||
                                                            cell ===
                                                              undefined ||
                                                            cell === ""
                                                              ? "-"
                                                              : typeof cell ===
                                                                "object"
                                                              ? JSON.stringify(
                                                                  cell
                                                                )
                                                              : typeof cell ===
                                                                "number"
                                                              ? cell.toLocaleString()
                                                              : cell.toString()}
                                                          </td>
                                                        )
                                                      )}
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="chart">
                                          <PieChart data={parsedData} />
                                        </TabsContent>
                                      </Tabs>
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error parsing message:",
                                    error
                                  );
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
                          {message.chat_message_type === "agent_message" && (
                            <div className="flex items-center gap-2.5 mt-2.5">
                              {message?.story_json &&
                                message?.story_json?.story_json[0].queries.map(
                                  (item) => (
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
                              message.favorite
                                ? "fill-primary text-primary"
                                : ""
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center h-full mt-5 justify-center"
        >
          <div className="mt-10 w-full">
            {repliedMessage && (
              <div className="text-muted-foreground flex items-center justify-between mb-2.5 bg-secondary/90 rounded-full w-full p-2">
                <span>{repliedMessage?.chat_message}</span>
                <X
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setRepliedMessage(null)}
                />
              </div>
            )}
            <div>
              {showCommands && isGroup && (
                <div className="bg-muted rounded-md p-2.5 mb-5">
                  {filteredAgents.map((item: unknown) => (
                    <div
                      key={item.user_catalog_id}
                      onClick={() => handleCommands(item)}
                    >
                      <p className="cursor-pointer">{item?.user_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              {showUsers && isGroup && (
                <div className="bg-muted rounded-md p-2.5 mb-5">
                  {filteredGroupUsers.map((user: unknown) => (
                    <div
                      key={user.user_catalog_id}
                      onClick={() => handleUserSelect(user?.user_name)}
                    >
                      <p className="cursor-pointer">{user?.user_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              {/* <span className="text-muted-foreground cursor-pointer">
                <EmojiPicker
                  onChange={(value) => setMessage(message + value)}
                />
              </span> */}
              <div className="border flex items-center rounded-full   p-2.5  w-full md:w-full">
                <Input
                  placeholder="Type your message here..."
                  className="bg-transparent border-none"
                  value={message}
                  ref={inputRef}
                  // onChange={(e) => setMessage(e.target.value)}
                  onChange={(e) => handleChange(e)}
                />
                <div className="flex justify-between items-center gap-2 ml-2">
                  <div className="flex items-center gap-5 mr-3">
                    {/* <span className="text-muted-foreground cursor-pointer">
                      <EmojiPicker
                        onChange={(value) => setMessage(message + value)}
                      />
                    </span> */}
                    {/* <span className="text-muted-foreground cursor-pointer">
                      <Mic
                        className="w-5 h-5"
                        onClick={() => audioInputRef.current?.click()}
                      />
                      <input
                        type="file"
                        accept=".mp3,.mp4,.mov,.wmv,.avi"
                        className="hidden"
                        ref={audioInputRef}
                        onChange={handleFileChange}
                      />
                    </span> */}
                    <span className="text-muted-foreground cursor-pointer">
                      <FileUp
                        className="w-5 h-5"
                        onClick={() => fileInputRef.current?.click()}
                      />
                      <input
                        type="file"
                        accept=".pdf,.csv,,.docx,.xlsx,.ppt,.pptx, .txt,.wav,.mp3,.mp4,.mov,.wmv,.avi,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.mov,.wmv,.avi"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </span>

                    <input type="file" className="hidden" />
                  </div>
                  <div>
                    <Button
                      disabled={!messages || !message || fileUploadLoading}
                      size="icon"
                      className="rounded-full"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatMessages;
