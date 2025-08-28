// chat window

"use client";

// import { type Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { toast } from "sonner";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { useParams, usePathname, useRouter } from "next/navigation";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";
import { Button } from "../ui/button";
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
import { Checkbox } from "../ui/checkbox";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/utils/cn";
import {
  createChat,
  saveMessage,
  getMessagesByChatId,
  updateMessageStatus,
  getChatBookMarks,
  getChatHistory,
  getChatFavorites, // Add this function to your actions
  createNewChatSession,
  getMessagesByPromptUuid,
  getChatImportant,
  getChatByShareId,
} from "@/app/(authenticated)/langchain-chat/lib/actions";

import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
// import { saveUserLogs } from "@/utils/userLogs";
import getCurrentBrowser from "@/utils/getCurrentBrowser";
import getUserOS from "@/utils/getCurrentOS";
import getUserLocation from "@/utils/geoLocation";
import { ChatInput } from "./ChatInput";

import { ChatLayout } from "./ChatLayout";
import History from "./MenuItems/History";
import BookMark from "./MenuItems/Important";
import Favorites from "./MenuItems/Favorites";
import { ChatMessages } from "./ChatMessages";
import SuggestedPrompts from "./MenuItems/SuggestedPrompts";
import Assistants from "./MenuItems/Assistants";
import { AISettings } from "./types/types";
import ChatName from "./ChatName";
import Important from "./MenuItems/Important";
import ChatBookMarks from "./MenuItems/ChatBookMarks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/supabase-provider";

type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  important?: boolean;
  favorite?: boolean;
  chart?: any;
};

type IntermediateStepType = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  isLike: boolean;
  important: boolean;
  favorite: boolean;
  chart?: string;
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

export function ChatWindow(props: {
  endpoint: string;
  placeholder?: string;
  emoji?: string;
  showIngestForm?: boolean;
  showIntermediateStepsToggle?: boolean;
  chatId?: string;
  shareId?: string;
}) {
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(
    !!props.showIntermediateStepsToggle
  );
  const [intermediateStepsLoading, setIntermediateStepsLoading] =
    useState(false);
  const [currentChatId, setCurrentChatId] = useState(props.chatId);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedAIModel, setSelectedAIModel] = useState<AISettings | null>(
    null
  );
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isSharedChat, setIsSharedChat] = useState(!!props.shareId);
  const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
  const msgId = uuidv4();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const [history, setHistory] = useState<any[]>([]);
  const [important, setImportant] = useState<any[]>([]);
  const [chatBookMarks, setChatBookMarks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [importantLoading, setImportantLoading] = useState(false);
  const [chatBookMarkLoading, setChatBookMarkLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [bookmarkClickLoading, setBookmarkClickLoading] = useState(false);
  const usageRef = useRef<any>(null);
  const promptId = uuidv4();
  const isMobile = useIsMobile();
  const pathName = usePathname();

  // Fetch history when dropdown opens
  const fetchHistory = async () => {
    if (historyLoading) return; // Prevent multiple calls

    setHistoryLoading(true);
    try {
      const response = await getChatHistory("LangStarter");
      setHistory(response as any[]);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error fetching History");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Bookmarks

  const fetchImportant = async () => {
    if (importantLoading) return;
    setImportantLoading(true);
    try {
      const response = await getChatImportant("LangStarter");
      setImportant(response as any[]);
    } catch (error) {
      console.error("Error fetching Important messages:", error);
      toast.error("Error fetching Important messages");
      throw error;
    } finally {
      setImportantLoading(false);
    }
  };

  const fetchChatBookMarks = async () => {
    if (chatBookMarkLoading) return;
    setChatBookMarkLoading(true);
    try {
      const response = await getChatBookMarks("LangStarter");

      setChatBookMarks(response as any[]);
    } catch (error) {
      console.error("Error fetching Chat Bookmarks:", error);
      toast.error("Error fetching Chat Bookmarks");
      throw error;
    } finally {
      setChatBookMarkLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (favoriteLoading) return; // Fixed: was checking bookMarkLoading instead of favoriteLoading
    setFavoriteLoading(true);
    try {
      const response = await getChatFavorites("LangStarter");
      setFavorites(response as any[]);
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

  const refreshImportant = async () => {
    await fetchImportant();
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  const refreshChatBookMarks = async () => {
    await fetchChatBookMarks();
  };

  // useEffect(() => {
  //   const saveLogs = async () => {
  //     try {
  //       await saveUserLogs({
  //         status: "Success",
  //         description: "Langchain-Chat Page viewed",
  //         event_type: "Langchain-Chat Page viewed",
  //         browser: getCurrentBrowser(),
  //         device: getUserOS(),
  //         geo_location: await getUserLocation(),
  //         operating_system: getUserOS(),
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };
  //   saveLogs();
  // }, []);

  const { session } = useAuth();

  const chat = useChat({
    api: props.endpoint,
    id: currentChatId,
    body: {
      language: selectedLanguage,
      aiModel: selectedAIModel,
    },
    onResponse(response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
        : [];

      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    streamMode: "text",
    onError: (e) =>
      toast.error(`Error while processing your request`, {
        description: e.message,
      }),
    onFinish: async (message) => {
      // Save assistant messages to the database
      if (message.role === "assistant") {
        try {
          let chatIdToUse = currentChatId;
          if (!chatIdToUse) {
            const pathParts = window.location.pathname.split("/");
            const chatIdFromUrl = pathParts[pathParts.length - 1];
            chatIdToUse =
              chatIdFromUrl && chatIdFromUrl !== "chat"
                ? chatIdFromUrl
                : uuidv4();
          }

          // Fetch usage data separately
          let usageData = null;
          try {
            const usageResponse = await fetch(`${props.endpoint}/usage`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: chatRef.current?.messages || [],
                language: selectedLanguage,
                aiModel: selectedAIModel,
              }),
            });

            if (usageResponse.ok) {
              const usageResult = await usageResponse.json();
              usageData = usageResult.usage;
            }
          } catch (error) {
            console.warn("Failed to fetch usage data:", error);
          }

          // Save the original message content to the database
          await saveMessage({
            id: message.id || `msg-${Date.now()}`,
            chatId: chatIdToUse,
            role: "assistant",
            content: message.content, // Save original content
            chat_group: "LangStarter",
            status: "active",
            user_id: session?.user?.user_catalog_id || "",
            createdAt: new Date().toISOString(),
            isLike: false,
            bookmark: false,
            important: false,
            favorite: false,
            prompt_tokens: usageData?.input_tokens,
            completion_tokens: usageData?.output_tokens,
            total_tokens: usageData?.total_tokens,
            prompt_uuid: promptId,
          });
          // handleHistory();
        } catch (error) {
          console.error("Failed to save assistant message:", error);
          toast.error("Failed to save assistant message");
          // await saveUserLogs({
          //   status: "failure",
          //   description: "Assistant message failed to save",
          //   event_type: "Assistant message save failed",
          //   browser: getCurrentBrowser(),
          //   device: getUserOS(),
          //   geo_location: await getUserLocation(),
          //   operating_system: getUserOS(),
          //   response_error: true,
          //   error_message: error,
          // });
        }
      }
    },
    generateId: () => uuidv4(),
  });

  // Update the ref whenever chat changes
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  // Auto-scroll to bottom when new messages arrive (but not for initial load)
  useEffect(() => {
    // Skip auto-scroll during initial load or when no messages
    if (isInitialLoad || !messagesLoaded || chat.messages.length <= 1) {
      return;
    }

    // For subsequent message additions, auto-scroll if user is near bottom
    if (messagesEndRef.current) {
      const container = messagesContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

        // Auto-scroll if user is near bottom (they're actively viewing)
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // If container not available yet, just scroll (for new conversations)
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [chat.messages, messagesLoaded, isInitialLoad]);

  // Check if user should see scroll to bottom button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isAtBottom);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll events
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Function to update message status
  const handleUpdateMessage = async (
    messageId: string,
    updates: Partial<Message>
  ) => {
    try {
      // Update local state
      const updatedMessages = chat.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      chat.setMessages(updatedMessages);

      // Update database if currentChatId exists
      if (currentChatId) {
        await updateMessageStatus({
          messageId,
          isLike: updates.isLike,
          important: updates.important,
          favorite: updates.favorite,
        });

        // Show appropriate toast message
        if (updates.important !== undefined) {
          toast.success(
            updates.important
              ? "Message marked as important"
              : "Important status removed"
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
  // Load existing messages when component mounts or chatId changes
  const loadMessages = useCallback(
    async (id, isSharedChat = false) => {
      setMessagesLoaded(false); // Reset loading state

      // Allow loading if we have an ID and either user is logged in OR it's a shared chat
      if (id && (session?.user?.user_catalog_id || isSharedChat)) {
        try {
          const existingMessages = await getMessagesByChatId(id);
          if (existingMessages && existingMessages.length > 0) {
            // Convert database messages to useChat format
            const formattedMessages: Message[] = existingMessages.map(
              (msg: any) => ({
                id: msg.id,
                role: msg.role || "user",
                content: msg.content,
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                isLike: msg.isLike,
                bookmark: msg.bookmark,
                important: msg.important,
                favorite: msg.favorite,
              })
            );
            chatRef.current?.setMessages(formattedMessages);
          } else {
            // No messages found, clear the chat
            chatRef.current?.setMessages([]);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
          chatRef.current?.setMessages([]); // Clear messages on error
        }
      } else {
        // No chatId provided (new chat), clear everything
        chatRef.current?.setMessages([]);
        // Clear sources and reset other states
        setSourcesForMessages({});
      }

      setMessagesLoaded(true);
      // Set initial load to false after first load
      setTimeout(() => setIsInitialLoad(false), 100);
    },
    [session?.user?.user_catalog_id]
  );

  // Effect for loading shared chat
  useEffect(() => {
    if (!props.shareId) return;

    const loadSharedChat = async () => {
      try {
        const chatData = await getChatByShareId(props.shareId!); // Non-null assertion since we check above
        if (chatData?.id) {
          const existingMessages = await getMessagesByChatId(chatData.id);
          if (existingMessages && existingMessages.length > 0) {
            // Convert and store shared messages
            const formattedMessages: Message[] = existingMessages.map(
              (msg: any) => ({
                id: msg.id,
                role: msg.role || "user",
                content: msg.content,
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                isLike: msg.isLike,
                bookmark: msg.bookmark,
                important: msg.important,
                favorite: msg.favorite,
              })
            );
            setSharedMessages(formattedMessages);
            chatRef.current?.setMessages(formattedMessages);
          }
          console.log("Shared chat loaded:", chatData);
        } else {
          toast.error("No chat found for this share ID");
        }
      } catch (error) {
        console.error("Error loading shared chat:", error);
        toast.error("Failed to load shared chat");
      }
      setMessagesLoaded(true);
      setTimeout(() => setIsInitialLoad(false), 100);
    };

    loadSharedChat();
    setIsInitialLoad(true);
  }, [props.shareId]);

  // Effect for loading regular chat
  useEffect(() => {
    if (props.shareId || !props.chatId) return; // Skip if it's a shared chat or no chatId

    loadMessages(props.chatId);
    setIsInitialLoad(true);
  }, [props.chatId, loadMessages, props.shareId]);

  const createNewChatAndRedirect = async (userMessage: string) => {
    if (!session) return;
    try {
      const newChatId = uuidv4();
      const shareToken = uuidv4();
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

      await createChat({
        id: newChatId,
        title: "New Chat", // Use "New Chat" instead of user message
        chat_group: "LangStarter",
        status: "active",
        user_id: session?.user?.user_catalog_id,
        createdAt: new Date().toISOString(),
        share_token: shareToken,
        share_url: shareUrl,
      });

      setCurrentChatId(newChatId);

      // Update URL without page reload
      window.history.replaceState(
        window.history.state,
        "",
        `/langchain-chat/chat/${newChatId}`
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

  const copySharedMessagesToNewChat = async (newChatId: string) => {
    try {
      const savedMessages: Message[] = [];
      let currentPromptUuid = uuidv4();

      for (let i = 0; i < sharedMessages.length; i++) {
        const msg = sharedMessages[i];
        const newMessageId = uuidv4();

        // Use same prompt_uuid for user-assistant pairs
        if (msg.role === "user") {
          currentPromptUuid = uuidv4();
        }

        // Save shared message to the new chat with new ID
        await saveMessage({
          id: newMessageId,
          chatId: newChatId,
          role: msg.role,
          content: msg.content,
          chat_group: "LangStarter",
          status: "active",
          user_id: session?.user?.user_catalog_id || "",
          createdAt: new Date().toISOString(),
          isLike: false,
          bookmark: false,
          important: false,
          favorite: false,
          prompt_uuid: currentPromptUuid,
        });

        // Keep the message for UI with new ID
        savedMessages.push({
          ...msg,
          id: newMessageId,
        });
      }

      return savedMessages;
    } catch (error) {
      console.error("Failed to copy shared messages:", error);
      throw error;
    }
  };

  const handleNewChatClick = async () => {
    try {
      const result = await createNewChatSession();
      if (result.success) {
        // Navigate to the new chat
        router.push(`/langchain-chat/chat/${result.chatId}`);
        // Refresh history
        setTimeout(() => {
          refreshHistory();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Failed to create new chat session");
    }
  };

  const saveUserMessage = async (
    chatId: string,
    messageId: string,
    content: string
  ) => {
    try {
      await saveMessage({
        id: messageId,
        chatId: chatId,
        role: "user",
        content: content,
        chat_group: "LangStarter",
        status: "active",
        user_id: session?.user?.user_catalog_id,
        createdAt: new Date().toISOString(),
        isLike: false,
        bookmark: false,
        important: false,
        favorite: false,
        prompt_uuid: promptId,
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
      toast.error("Failed to save user message");
    }
  };

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) {
      toast.error("Login required");
      const currentUrl = window.location.href;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    if (chat.isLoading || intermediateStepsLoading) return;

    const userMessage = chat.input;
    if (!userMessage.trim()) return;

    let chatId = currentChatId;

    // Handle shared chat scenario - create new chat and copy shared messages
    if (!chatId && isSharedChat && sharedMessages.length > 0) {
      try {
        // Create new chat for the user
        chatId = await createNewChatAndRedirect(userMessage);
        setCurrentChatId(chatId);

        // Copy all shared messages to the new chat
        const copiedMessages = await copySharedMessagesToNewChat(chatId);

        // Update the UI with copied messages
        chatRef.current?.setMessages(copiedMessages);

        // Mark as no longer a shared chat
        setIsSharedChat(false);

        toast.success("Conversation copied to your chat history");
      } catch (error) {
        console.error("Failed to copy shared chat:", error);
        toast.error("Failed to create your chat session");
        return;
      }
    }
    // Create new chat if this is the first message (normal scenario)
    else if (!chatId) {
      try {
        chatId = await createNewChatAndRedirect(userMessage);
        setCurrentChatId(chatId);
      } catch (error) {
        console.error(error);
        return; // Exit if chat creation failed
      }
    }

    // Save user message
    const userMessageId = uuidv4();
    await saveUserMessage(chatId, userMessageId, userMessage);

    // Force scroll to bottom when user sends a message
    setIsInitialLoad(false);

    if (!showIntermediateSteps) {
      // Simple case: let useChat handle the flow and onFinish will save the response
      chat.handleSubmit(e);
      // Ensure scroll to bottom after message is sent
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    // Complex case: Handle intermediate steps manually
    setIntermediateStepsLoading(true);

    // Clear input and add user message to UI
    chat.setInput("");
    const messagesWithUserReply = [
      ...chat.messages,
      {
        id: userMessageId,
        content: userMessage,
        role: "user" as const,
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        important: false,
        favorite: false,
      } as Message,
    ];
    chat.setMessages(messagesWithUserReply);

    try {
      const response = await fetch(props.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      setIntermediateStepsLoading(false);

      const responseMessages: Message[] = json.messages;

      // Represent intermediate steps as system messages for display purposes
      const toolCallMessages = responseMessages.filter(
        (responseMessage: any) => {
          return (
            (responseMessage.role === "assistant" &&
              !!(responseMessage as any).tool_calls?.length) ||
            responseMessage.role === "tool"
          );
        }
      );

      const intermediateStepMessages: Message[] = [];
      for (let i = 0; i < toolCallMessages.length; i += 2) {
        const aiMessage = toolCallMessages[i] as any;
        const toolMessage = toolCallMessages[i + 1];
        intermediateStepMessages.push({
          id: msgId,
          role: "tool",
          content: JSON.stringify({
            action: aiMessage.tool_calls ? aiMessage.tool_calls[0] : undefined,
            observation: toolMessage.content,
          }),
          createdAt: new Date(),
          isLike: false,
          important: false,
          bookmark: false,
          favorite: false,
        });
      }

      const newMessages = [...messagesWithUserReply];
      for (const message of intermediateStepMessages) {
        newMessages.push(message);
        chat.setMessages([...newMessages]);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
      }

      const finalAssistantMessage: Message = {
        id: msgId,
        content: responseMessages[responseMessages.length - 1].content,
        role: "assistant" as const,
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        important: false,
        favorite: false,
      };
      chat.setMessages([...newMessages, finalAssistantMessage]);

      // Ensure scroll to bottom after final message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

      // Save the final assistant message
      try {
        await saveMessage({
          id: msgId,
          chatId: chatId,
          role: "assistant",
          content: finalAssistantMessage.content,
          chat_group: "LangStarter",
          status: "active",
          user_id: session?.user?.user_catalog_id,
          createdAt: new Date().toISOString(),
          isLike: false,
          bookmark: false,
          important: false,
          favorite: false,
          prompt_uuid: promptId,
        });
      } catch (error) {
        console.error("Failed to save assistant message:", error);
        toast.error("Failed to save assistant message");
      }
    } catch (error) {
      setIntermediateStepsLoading(false);
      console.error("Error in sendMessage:", error);
      toast.error("Failed to process message");
    }
  }

  // Don't render until messages are loaded (or confirmed empty)
  if (!messagesLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const handleSendFavoritePrompt = async (content: string) => {
    if (!content) return;

    chat.setInput(content);
    // Mark that we're no longer in initial load when user interacts
    setIsInitialLoad(false);
  };

  const handleBookmarkClick = async (promptUuid: string) => {
    if (bookmarkClickLoading) return; // Prevent multiple clicks

    setBookmarkClickLoading(true);
    try {
      // Get all messages with the same prompt_uuid
      const messages = await getMessagesByPromptUuid(promptUuid);

      if (messages && messages.length > 0) {
        // Ensure we have a current chat ID
        let chatId = currentChatId;
        if (!chatId) {
          // Create new chat if we don't have one
          chatId = await createNewChatAndRedirect("Bookmark conversation");
          setCurrentChatId(chatId);
        }

        // Convert database messages to useChat format and save to current chat
        const formattedMessages: Message[] = [];
        let currentPromptUuid = uuidv4();

        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          const newMessageId = uuidv4();

          // Use same prompt_uuid for user-assistant pairs
          if (msg.role === "user") {
            currentPromptUuid = uuidv4();
          }

          // Save to database with new IDs for current chat
          await saveMessage({
            id: newMessageId,
            chatId: chatId,
            role: msg.role,
            content: msg.content,
            chat_group: "LangStarter",
            status: "active",
            user_id: session?.user?.user_catalog_id,
            createdAt: new Date().toISOString(),
            isLike: msg.isLike || false,
            bookmark: msg.bookmark || false,
            important: msg.important || false,
            favorite: msg.favorite || false,
            prompt_uuid: currentPromptUuid,
          });

          // Format for UI
          formattedMessages.push({
            id: newMessageId,
            role: msg.role || "user",
            content: msg.content,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            isLike: msg.isLike || false,
            bookmark: msg.bookmark || false,
            important: msg.important || false,
            favorite: msg.favorite || false,
          });
        }

        // Append to existing messages in UI
        const updatedMessages = [...chat.messages, ...formattedMessages];
        chat.setMessages(updatedMessages);

        toast.success("Important conversation added to chat");
      } else {
        toast.error("No messages found for this important conversation");
      }
    } catch (error) {
      console.error("Failed to load important messages:", error);
      toast.error("Failed to load important conversation");
    } finally {
      setBookmarkClickLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-screen relative">
      {/* Header with icons - sticky at top of chat container */}
      <div className="sticky top-0 z-40 bg-background  border-b flex-shrink-0">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="px-1 sm:px-3 py-1 min-w-0 flex-1">
            <ChatName id={props?.chatId} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            <div className="md:flex items-center hidden gap-1 sm:gap-2">
              <Favorites
                favorites={favorites}
                onDropdownOpen={fetchFavorites}
                onFavoriteUpdate={refreshFavorites}
                loading={favoriteLoading}
                onSendFavorite={handleSendFavoritePrompt}
              />
              <SuggestedPrompts />
              <button
                onClick={handleNewChatClick}
                className="cursor-pointer p-1"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1">
                <Ellipsis className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="md:hidden">
                    <Favorites
                      favorites={favorites}
                      onDropdownOpen={fetchFavorites}
                      onFavoriteUpdate={refreshFavorites}
                      loading={favoriteLoading}
                      onSendFavorite={handleSendFavoritePrompt}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden">
                    <SuggestedPrompts />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden">
                    <button
                      onClick={handleNewChatClick}
                      className="cursor-pointer flex items-center gap-2.5 p-1"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      <span className=" md:hidden">New Chat</span>
                    </button>
                  </DropdownMenuItem>
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
                    <Important
                      important={important}
                      onDropdownOpen={fetchImportant}
                      onImportantUpdate={refreshImportant}
                      loading={importantLoading}
                      onImportantClick={handleBookmarkClick}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ChatBookMarks
                      bookmarks={chatBookMarks}
                      onDropdownOpen={fetchChatBookMarks}
                      onBookMarkUpdate={refreshChatBookMarks}
                      loading={chatBookMarkLoading}
                      onBookmarkClick={handleBookmarkClick}
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
      </div>

      {/* Messages area - scrollable middle section */}
      <div className="flex-1 overflow-hidden relative pb-16 sm:pb-20">
        <div
          ref={messagesContainerRef}
          className="h-full px-2  sm:px-4 py-2 sm:py-4 overflow-y-auto hide-scrollbar"
          onScroll={handleScroll}
        >
          <ChatMessages
            aiEmoji={props.emoji}
            messages={chat.messages.map((msg: any) => ({
              ...msg,
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            }))}
            sourcesForMessages={sourcesForMessages}
            onUpdateMessage={handleUpdateMessage}
            onBookmarkUpdate={refreshImportant}
            onFavoriteUpdate={refreshFavorites}
          />
          {/* Invisible div for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-20">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToBottom}
              className="shadow-lg"
            >
              <ArrowDown className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Scroll to bottom</span>
              <span className="sm:hidden">Scroll</span>
            </Button>
          </div>
        )}
      </div>

      {/* Input area - fixed at bottom with responsive positioning */}
      <div
        className={cn(
          "sticky bottom-0 z-50 bg-background ",
          isMobile ? "left-0 right-0" : "right-0",
          !isMobile && "left-[var(--sidebar-width,240px)]"
        )}
      >
        <div className="p-2 sm:p-4">
          <ChatInput
            value={chat.input}
            onChange={chat.handleInputChange}
            onSubmit={sendMessage}
            loading={chat.isLoading || intermediateStepsLoading}
            placeholder={props.placeholder ?? "What's it like to be a pirate?"}
            setSelectedLanguage={setSelectedLanguage}
            setSelectedAIModel={setSelectedAIModel}
            selectedAIModel={selectedAIModel}
          >
            {props.showIngestForm && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-2 pr-3 -ml-2"
                    disabled={chat.messages.length !== 0}
                  >
                    <Paperclip className="size-4" />
                    <span className="hidden sm:inline">Upload document</span>
                    <span className="sm:hidden">Upload</span>
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

            {props.showIntermediateStepsToggle && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show_intermediate_steps"
                  name="show_intermediate_steps"
                  checked={showIntermediateSteps}
                  disabled={chat.isLoading || intermediateStepsLoading}
                  onCheckedChange={(e) => setShowIntermediateSteps(!!e)}
                />
                <label
                  htmlFor="show_intermediate_steps"
                  className="text-sm hidden sm:inline"
                >
                  Show intermediate steps
                </label>
                <label
                  htmlFor="show_intermediate_steps"
                  className="text-sm sm:hidden"
                >
                  Steps
                </label>
              </div>
            )}
          </ChatInput>
        </div>
      </div>
    </div>
  );
}
