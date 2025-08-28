"use client";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { toast } from "sonner";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { IntermediateStep } from "../IntermediateStep";
import { Button } from "../../ui/button";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Coins,
  Ellipsis,
  FileJson,
  Globe,
  HandHelping,
  LoaderCircle,
  Logs,
  MessageCircle,
  Paperclip,
  Plus,
  Settings,
  Settings2,
} from "lucide-react";
import { Checkbox } from "../../ui/checkbox";
import { UploadDocumentsForm } from "../UploadDocumentsForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { cn } from "@/utils/cn";
import {
  createChat,
  saveMessage,
  getMessagesByChatId,
  updateMessageStatus,
  getChatBookMarks,
  getChatHistory,
  getChatFavorites,
  fetchFormSetupData, // Add this function to your actions
} from "@/app/(authenticated)/langchain-chat/lib/actions";

import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import Link from "next/link";
import { saveUserLogs } from "@/utils/userLogs";
import getCurrentBrowser from "@/utils/getCurrentBrowser";
import getUserOS from "@/utils/getCurrentOS";
import getUserLocation from "@/utils/geoLocation";
import { AssistantInput } from "./AssistantInput";
import { ChatLayout } from "../ChatLayout";
import History from "./MenuItems/History";
import BookMark from "./MenuItems/Bookmark";
import Favorites from "./MenuItems/Favorites";
import { ChatMessages } from "../ChatMessages";
import SuggestedPrompts from "../MenuItems/SuggestedPrompts";
import Assistants from "../MenuItems/Assistants";
import { AssistantData, ChartData, Content, Query } from "../types/types";
import { AssistantMessages } from "./AssistantMessages";
import { AssistantLayout } from "./AssistantLayout";
import { useAuth } from "@/context/supabase-provider";

// type Message = {
//   id: string;
//   role: "user" | "assistant" | "system";
//   content: string;
//   createdAt: Date;
//   isLike?: boolean;
//   bookmark?: boolean;
//   favorite?: boolean;
//   chart?: any; // Can now hold complex chart objects
// };

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
  table_columns?: string[];
  chart?: ChartData;
  analysisPrompt?: { data: any };
  suggestions: boolean;
  initialMsg?: boolean;
};

export function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

export function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();

  // scrollRef will also switch between overflow: unset to overflow: auto
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={cn("grid grid-rows-[1fr,auto]", props.className)}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

export function AssistantWindow(props: {
  endpoint: string;
  emptyStateComponent?: ReactNode;
  placeholder?: string;
  emoji?: string;
  showIngestForm?: boolean;
  showIntermediateStepsToggle?: boolean;
  assistantId: string;
  chatId?: string;
}) {
  const [currentChatId, setCurrentChatId] = useState(props.chatId);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [jsonData, setJsonData] = useState<AssistantData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const msgId = uuidv4();

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const [history, setHistory] = useState([]);
  const [bookmarks, setBookMarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [bookMarkLoading, setBookMarkLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchAssistantData = async () => {
      try {
        const response = await fetchFormSetupData(props.assistantId);

        setJsonData(response);
      } catch (error) {
        console.error("Failed fetching assistant data:", error);
      }
    };
    fetchAssistantData();
  }, [props.assistantId]);

  // Fetch history when dropdown opens
  const fetchHistory = async () => {
    if (historyLoading) return; // Prevent multiple calls

    setHistoryLoading(true);
    try {
      const response = await getChatHistory("LangStarter Assistant");
      setHistory(response);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error fetching History");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Bookmarks

  const fetchBookMarks = async () => {
    if (bookMarkLoading) return;
    setBookMarkLoading(true);
    try {
      const response = await getChatBookMarks("LangStarter Assistant");
      setBookMarks(response);
    } catch (error) {
      console.error("Error fetching Bookmarks:", error);
      toast.error("Error fetching Bookmarks");
      throw error;
    } finally {
      setBookMarkLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (favoriteLoading) return; // Fixed: was checking bookMarkLoading instead of favoriteLoading
    setFavoriteLoading(true);
    try {
      const response = await getChatFavorites("LangStarter Assistant");

      setFavorites(response);
    } catch (error) {
      console.error("Error fetching Favorites:", error);
      toast.error("Error fetching Favorites");
      throw error;
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Function to refresh history after operations like delete
  const refreshHistory = async () => {
    await fetchHistory();
  };

  const refreshBookMarks = async () => {
    await fetchBookMarks();
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  useEffect(() => {
    const saveLogs = async () => {
      try {
        await saveUserLogs({
          status: "Success",
          description: "Langchain-Chat Page viewed",
          event_type: "Langchain-Chat Page viewed",
          browser: getCurrentBrowser(),
          device: getUserOS(),
          geo_location: await getUserLocation(),
          operating_system: getUserOS(),
        });
      } catch (error) {
        throw error;
      }
    };
    saveLogs();
  }, []);

  const { session } = useAuth();

  // Function to update message status
  const handleUpdateMessage = async (
    messageId: string,
    updates: Partial<Message>
  ) => {
    try {
      // Update local state
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      setMessages(updatedMessages);

      // Update database if currentChatId exists
      if (currentChatId) {
        await updateMessageStatus({
          messageId,
          isLike: updates.isLike,
          bookmark: updates.bookmark,
          favorite: updates.favorite,
        });

        // Show appropriate toast message
        if (updates.bookmark !== undefined) {
          toast.success(
            updates.bookmark ? "Message bookmarked" : "Bookmark removed"
          );
        }
        if (updates.favorite !== undefined) {
          toast.success(
            updates.favorite ? "Message favorited" : "Favorite removed"
          );
        }
        if (updates.isLike !== undefined) {
          toast.success(updates.isLike ? "Message liked" : "Like removed");
        }
      }
    } catch (error) {
      console.error("Failed to update message status:", error);
      toast.error("Failed to update message status");
    }
  };

  //Load existing messages when component mounts or chatId changes
  useEffect(() => {
    const loadMessages = async () => {
      setMessagesLoaded(false); // Reset loading state

      if (props.chatId && session?.user?.user_catalog_id) {
        try {
          const existingMessages = await getMessagesByChatId(props.chatId);
          let formattedMessages: Message[] = [];
          if (existingMessages && existingMessages.length > 0) {
            formattedMessages = existingMessages.map((msg: any) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
              isLike: msg.isLike,
              bookmark: msg.bookmark,
              favorite: msg.favorite,
              table_columns: msg.table_columns,
              chart: msg.chart,
              analysisPrompt: msg.analysisPrompt,
              suggestions: msg.suggestions,
            }));
          }
          // Prepend assistant buttons message if needed
          if (jsonData.length > 0) {
            const initialMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "How can I help you today?",
              createdAt: new Date(),
              suggestions: false,
              initialMsg: true,
            };
            setMessages([initialMessage, ...formattedMessages]);
          } else {
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
          setMessages([]); // Clear messages on error
        }
      } else {
        // No chatId provided (new chat), clear everything
        setMessages([]);
        // Clear sources and reset other states
        setSourcesForMessages({});
      }

      setMessagesLoaded(true);
    };

    loadMessages();
  }, [props.chatId, session?.user?.user_catalog_id, jsonData]);

  useEffect(() => {
    if (jsonData.length > 0) {
      const initialMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "How can I help you today?",
        createdAt: new Date(),
        suggestions: false,
        initialMsg: true,
      };
      setMessages([initialMessage]);
    }
  }, [jsonData]);

  const createNewChatAndRedirect = async (userMessage: string) => {
    try {
      const newChatId = uuidv4();

      await createChat({
        id: newChatId,
        title: userMessage.slice(0, 100), // Limit title length
        chat_group: "LangStarter Assistant",
        status: "active",
        user_id: session?.user?.user_catalog_id,
        createdAt: new Date().toISOString(),
        assistantId: props.assistantId,
      });

      setCurrentChatId(newChatId);

      // Update URL without page reload
      window.history.replaceState(
        window.history.state,
        "",
        `/langchain-chat/assistant/${props.assistantId}/${newChatId}`
      );

      // Refresh history after creating new chat
      setTimeout(() => {
        refreshHistory();
      }, 500); // Small delay to ensure the chat is saved

      return newChatId;
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create new chat");
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!input) return;
    if (messages.length === 0) {
      toast.error("Please analyze data first");
      return;
    }

    // Get the data from the first message (assuming it contains the analyzed data)
    const dataToAnalyze = messages[0].content;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user" as const,
      content: input,
      createdAt: new Date(),
      isLike: false,
      bookmark: false,
      favorite: false,
      chart: { type: "", title: "", xaxis: "", yaxis: "" },
      table_columns: [],
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    const userMessageId = userMessage.id;
    await saveMessage({
      id: userMessageId,
      chatId: currentChatId || "",
      content: input,
      role: "user",
      createdAt: new Date(),
      table_columns: [],
      chart: { type: "", title: "", xaxis: "", yaxis: "" },
      bookmark: null,
      isLike: null,
      favorite: null,
      user_id: session?.user?.user_catalog_id,
      chat_group: "LangStarter Assistant",
      assistantId: props.assistantId,
    });

    try {
      const response = await fetch("/api/chat/analyze-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: dataToAnalyze,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userPrompt: input,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("Response body is null");

      // Create assistant message for streaming
      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        favorite: false,
        chart: { type: "", title: "", xaxis: "", yaxis: "" },
        table_columns: [],
        suggestions: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        content += chunk;

        // Update the last message with new content
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: content,
            };
          }
          return newMessages;
        });
      }

      // Save the final assistant message to database
      await saveMessage({
        id: assistantMessageId,
        chatId: currentChatId || "",
        content: content,
        role: "assistant",
        createdAt: new Date(),
        table_columns: [],
        chart: { type: "", title: "", xaxis: "", yaxis: "" },
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
        chat_group: "LangStarter Assistant",
        assistantId: props.assistantId,
      });

      // Save user activity log
      await saveUserLogs({
        status: "Success",
        description: "Chat message sent and response received",
        event_type: "Chat Interaction",
        browser: getCurrentBrowser(),
        device: getUserOS(),
        geo_location: await getUserLocation(),
        operating_system: getUserOS(),
        user_id: session?.user?.user_catalog_id,
      });
    } catch (error) {
      console.error("Chat error:", error);
      // Update the last message with error
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content:
              "Sorry, there was an error processing your request. Please try again.",
          };
        }
        return newMessages;
      });
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistant = async (assistant: Query, apiConnection: string) => {
    try {
      setIsLoading(true);
      let botResponse;
      const assistantId = uuidv4();
      const assistantResponseId = uuidv4();
      const fallbackMsgId = uuidv4();
      let chatId = currentChatId;

      // if there is no chat Id, create new chat and redirect
      if (!chatId) {
        try {
          chatId = await createNewChatAndRedirect(assistant?.name);
          setCurrentChatId(chatId);
        } catch (error) {
          console.error(error);
          return; // Exit if chat creation failed
        }
      }

      const assistantMsg = {
        id: assistantId,
        content: assistant.name,
        chatId: chatId,
        role: "user",
        createdAt: new Date(),
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await saveMessage({
        id: assistantId,
        chatId: chatId,
        createdAt: new Date(),
        content: assistant.name,
        role: "user",
        user_id: session?.user?.user_catalog_id,
        chat_group: "LangStarter Assistant",
        assistantId: props.assistantId,
      });

      try {
        const field = assistant.field;
        const response = await fetch(assistant.api, {
          method: "GET",
          headers: {
            Authorization: apiConnection,
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

        // fallback message after each response to generate suggestions
        const assistantResponse = {
          id: assistantResponseId,
          content: botResponse,
          chatId: chatId,
          createdAt: new Date(),
          role: "assistant",
          table_columns: assistant.table_columns,
          chart: assistant.chart,
          bookmark: null,
          isLike: null,
          favorite: null,
          user_id: session?.user?.user_catalog_id,
        };
        setMessages((prev) => [...prev, assistantResponse]);
        const fallbackMsg = {
          id: fallbackMsgId,
          content: "Do you want any suggested prompts?",
          chatId: chatId,
          createdAt: new Date(),
          role: "assistant",
          table_columns: assistant.table_columns,
          chart: assistant.chart,
          bookmark: null,
          isLike: null,
          favorite: null,
          user_id: session?.user?.user_catalog_id,
          analysisPrompt: {
            data: botResponse,
          },
        };
        setMessages((prev) => [...prev, fallbackMsg]);

        await saveMessage({
          id: assistantResponseId,
          chatId: chatId,
          content: botResponse,
          role: "assistant",
          createdAt: new Date(),
          table_columns: assistant.table_columns,
          chart: assistant.chart,
          bookmark: null,
          isLike: null,
          favorite: null,
          user_id: session?.user?.user_catalog_id,
          chat_group: "LangStarter Assistant",
          assistantId: props.assistantId,
        });
        await saveMessage({
          id: fallbackMsgId,
          content: "Do you want any suggested prompts?",
          chatId: chatId,
          createdAt: new Date(),
          role: "assistant",
          table_columns: assistant.table_columns,
          chart: assistant.chart,
          bookmark: null,
          isLike: null,
          favorite: null,
          user_id: session?.user?.user_catalog_id,
          assistantId: props.assistantId,

          analysisPrompt: {
            data: botResponse,
          },
        });

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAnalyzeData = async (messageId: string, dataToAnalyze: any) => {
    setIsLoading(true);
    let content = "";
    const messageIdForStream = uuidv4(); // Use proper UUID

    try {
      const response = await fetch("/api/chat/analyze-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataToAnalyze }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Create a new assistant message for the streamed response
      const analysisMessage: Message = {
        id: messageIdForStream,
        role: "assistant",
        content: "",
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        suggestions: true,
        favorite: false,
      };

      // Add the empty message to the UI immediately
      setMessages((prevMessages) => [...prevMessages, analysisMessage]);

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          // Decode the chunk and append to content
          const chunk = decoder.decode(value, { stream: true });
          content += chunk;

          // Update the message with the new content
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageIdForStream
                ? { ...msg, content, text: content }
                : msg
            )
          );
        }
      }

      // Save the complete message to the database
      await saveMessage({
        id: messageIdForStream,
        chatId: currentChatId,
        content: content,
        role: "assistant",
        createdAt: new Date(),
        table_columns: [],
        chart: {},
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
        chat_group: "LangStarter Assistant",
        assistantId: props.assistantId,
      });

      toast.success("Analysis completed!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze data. Please try again.");

      // Update the message with the error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageIdForStream
            ? {
                ...msg,
                content: "Sorry, there was an error processing your request.",
                text: "Sorry, there was an error processing your request.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompts = async (msg: string, data: any) => {
    setIsLoading(true);
    let content = "";
    const messageIdForStream = uuidv4(); // Use proper UUID

    const promptSelected = {
      id: uuidv4(),
      chatId: currentChatId,
      user_id: session?.user?.user_catalog_id,
      role: "user",
      content: msg,
      createdAt: new Date(),
      suggestions: true,
    };
    setMessages((prev) => [...prev, promptSelected]);
    await saveMessage({
      id: uuidv4(),
      chatId: currentChatId,
      user_id: session?.user?.user_catalog_id,
      role: "user",
      content: msg,
      createdAt: new Date(),
      suggestions: true,
      assistantId: props.assistantId,
    });

    try {
      const response = await fetch("/api/chat/analyze-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data, msg: msg }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Create a new assistant message for the streamed response
      const analysisMessage: Message = {
        id: messageIdForStream,
        role: "assistant",
        content: "",
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        favorite: false,
        suggestions: true,
      };

      // Add the empty message to the UI immediately
      setMessages((prevMessages) => [...prevMessages, analysisMessage]);

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          // Decode the chunk and append to content
          const chunk = decoder.decode(value, { stream: true });
          content += chunk;

          // Update the message with the new content
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageIdForStream
                ? { ...msg, content, text: content }
                : msg
            )
          );
        }
      }

      // Save the complete message to the database
      await saveMessage({
        id: messageIdForStream,
        chatId: currentChatId,
        content: content,
        role: "assistant",
        createdAt: new Date(),
        table_columns: [],
        chart: {},
        bookmark: null,
        isLike: null,
        favorite: null,
        user_id: session?.user?.user_catalog_id,
        chat_group: "LangStarter Assistant",
        suggestions: true,
        assistantId: props.assistantId,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze data. Please try again.");

      // Update the message with the error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageIdForStream
            ? {
                ...msg,
                content: "Sorry, there was an error processing your request.",
                text: "Sorry, there was an error processing your request.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissAnalysisPrompt = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, analysisPrompt: undefined } : msg
      )
    );
  };

  const getSuggestedPrompts = async (data: any) => {
    setIsLoading(true);
    const suggestedPromptId = uuidv4();
    try {
      const response = await fetch("/api/chat/suggested-prompts", {
        method: "POST",
        body: JSON.stringify({ data: data }),
      });
      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("result-----", result);

      const suggestedPrompts = {
        id: suggestedPromptId,
        chatId: currentChatId,
        content: result.suggestions,
        suggestions: true,
        role: "assistant",
        analysisPrompt: {
          data: data,
        },
      };
      setMessages((prev) => [...prev, suggestedPrompts]);
      await saveMessage({
        id: suggestedPromptId,
        chatId: currentChatId,
        content: result.suggestions,
        suggestions: true,
        role: "assistant",
        createdAt: new Date(),
        user_id: session?.user?.user_catalog_id,
        assistantId: props.assistantId,

        analysisPrompt: {
          data: data,
        },
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to generate suggestions. Please try again.");
    }
  };

  return (
    <div className="">
      <div className="flex relative z-50 bg-background items-center">
        <div className=" w-full justify-end items-center flex  gap-2.5 z-50">
          <Favorites
            favorites={favorites}
            onDropdownOpen={fetchFavorites}
            onFavoriteUpdate={refreshFavorites}
            loading={favoriteLoading}
          />
          <SuggestedPrompts />
          <Link href="/langchain-chat/chat">
            <Plus className=" text-muted-foreground" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-5 h-5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Assistants />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History
                    history={history}
                    onDropdownOpen={fetchHistory}
                    onHistoryUpdate={refreshHistory}
                    loading={historyLoading}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookMark
                    bookmarks={bookmarks}
                    onDropdownOpen={fetchBookMarks}
                    onBookMarkUpdate={refreshBookMarks}
                    loading={bookMarkLoading}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Coins className="text-yellow-500" />
                    <span>Token Use</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Logs className="w-5 h-5 text-muted-foreground" />
                    <span>Chat Logs</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span>Settings</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AssistantLayout
        content={
          jsonData[0]?.content?.length === 0 ? (
            <div>
              <h1 className="text-center">No Data Avaliable.</h1>
            </div>
          ) : (
            <AssistantMessages
              aiEmoji={props.emoji}
              messages={messages}
              emptyStateComponent={props.emptyStateComponent}
              sourcesForMessages={sourcesForMessages}
              onUpdateMessage={handleUpdateMessage}
              jsonData={jsonData}
              handleAssistant={handleAssistant}
              onAnalyzeData={handleAnalyzeData}
              onDismissAnalysisPrompt={handleDismissAnalysisPrompt}
              suggestedPrompts={getSuggestedPrompts}
              handleSuggestedPrompts={handleSuggestedPrompts}

              // setBookmarks={setBookmarks}
              // setFavorites={setFavorites}
            />
          )
        }
        footer={
          <AssistantInput
            value={input}
            setValue={setInput}
            onSubmit={handleSubmit}
            loading={isLoading}
            placeholder={props.placeholder}
          >
            {props.showIngestForm && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-2 pr-3 -ml-2"
                    disabled={messages.length !== 0}
                  >
                    <Paperclip className="size-4" />
                    <span>Upload document</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload document</DialogTitle>
                    <DialogDescription>
                      Upload a document to use for the chat.
                    </DialogDescription>
                  </DialogHeader>
                  <UploadDocumentsForm />
                </DialogContent>
              </Dialog>
            )}
          </AssistantInput>
        }
      />
    </div>
  );
}
