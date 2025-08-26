"use client";

import type React from "react";
import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, Send } from "lucide-react";
import ChatMessage from "./chat-message";
import { cn } from "@/lib/utils";
import {
  executeSql,
  getDatabaseSchema,
  createChat,
  saveMessage,
  getChatHistory,
  deleteMessagesByIds,
} from "../actions";

import { v4 as uuidv4 } from "uuid";
import HistoryBar from "./chat-history";
import { toast } from "sonner";
import ChatHeader from "./chat-header";

export default function AnalyticChat({
  chatId,
  initialMessages,
  userId,
  dbConfig,
  chatData,
  initialSuggestions = []
}: {
  chatId: string | undefined;
  initialMessages?: unknown[];
  userId: string;
  dbConfig?: Record<string, string>;
  chatData: {
    id: string;
    title: string;
    bookmark?: boolean;
    status?: string;
    createdAt?: string;
  };
  initialSuggestions?: string[];
}) {
  // Update connection string from dbConfig
  const [dbConnectionString] = useState<string | null>(
    dbConfig?.connection_string || null
  );

  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    chatId
  );

  const assistantIdentifier = "storeassi";

  const [chatTitle, setChatTitle] = useState<string | undefined>(
    chatData?.title
  );
  const [chatCreated, setChatCreated] = useState(false);
  const [allowedTables] = useState<string[]>(
    Array.isArray(dbConfig?.allowedTables)
      ? dbConfig?.allowedTables
      : ["customers", "product", "product_category", "order", "order_product"]
  );
  const [tableSchema, setTableSchema] = useState<unknown>(null);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions || []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<unknown[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add new state for token usage
  const [tokenUsage, setTokenUsage] = useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });

  const loadHistory = useCallback(async () => {
    if (!userId || isHistoryLoading) return;
    setIsHistoryLoading(true);
    try {
      const data = await getChatHistory(assistantIdentifier);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [userId, isHistoryLoading]);

  const handleHistoryClick = useCallback(() => {
    setShowHistory(true);
    loadHistory();
  }, [loadHistory]);

  // Memoize tool implementations
  const toolImplementations = useMemo(
    () => ({
      getDatabaseSchema: async () => {
        try {
          console.log(
            "Fetching database schema...",
            dbConnectionString,
            tableSchema
          );
          const schema = await getDatabaseSchema(
            dbConnectionString,
            allowedTables
          );
          if (schema.tables) setTableSchema(schema.tables);

          return { ...schema };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to get database schema",
          };
        }
      },
      executeSql: async ({ sql }: { sql: string }) => {
        try {
          console.log("Executing SQL query...", sql);
          const results = await executeSql(dbConnectionString, sql);
          return { ...results };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to execute SQL query",
          };
        }
      },
      generateChart: async ({ config }) => {
        try {
          console.log("Generating chart...", config);
          // Validate that the chart config is valid
          if (!config || !config.type || !config.data) {
            throw new Error("Invalid chart configuration");
          }

          return {
            success: true,
            message: "Chart generated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate chart",
          };
        }
      },
      generateSuggestions: async ({ suggestions }) => {
        try {
          console.log("Generating suggestions...", suggestions);
          setSuggestions(suggestions);
          return {
            success: true,
            message: "Suggestions generated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate suggestions",
          };
        }
      },
    }),
    [dbConnectionString, allowedTables]
  );

  const onToolCall = useCallback(
    async ({ toolCall }) => {
      const { toolName, args } = toolCall;
      console.log("Tool call:", toolName, args);

      if (toolName === "getDatabaseSchema") {
        return await toolImplementations.getDatabaseSchema();
      } else if (toolName === "executeSql") {
        return await toolImplementations.executeSql(args);
      } else if (toolName === "generateChart") {
        return await toolImplementations.generateChart(args);
      } else if (toolName === "generateSuggestions") {
        return await toolImplementations.generateSuggestions(args);
      }
    },
    [toolImplementations]
  );


  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: "/api/storeanalyicsaiassistant/chat",
    id: chatId,
    initialMessages: [],
    onFinish: async (message, options) => {
      const { finishReason, usage } = options;

      if (finishReason !== "stop" && finishReason !== "unknown") {
        return;
      }

      await saveMessage({
        id: message.id,
        chatId: currentChatId,
        content: message.content,
        role: "assistant",
        userId: userId,
        parts: message.parts,
        toolInvocations: message.toolInvocations,
        usage,
      });

      if (usage) {
        setTokenUsage((prev) => ({
          promptTokens: prev.promptTokens + (usage.promptTokens || 0),
          completionTokens:
            prev.completionTokens + (usage.completionTokens || 0),
          totalTokens: prev.totalTokens + (usage.totalTokens || 0),
        }));
      }
    },
    maxSteps: 15,
    onToolCall,
    generateId: () => uuidv4(),
    experimental_prepareRequestBody: ({ messages }) => {
      return {
        messages,
        chatId: currentChatId,
        assistantIdentifier,
      };
    },
  });

  useEffect(() => {
    if (!currentChatId) {
      setCurrentChatId(chatId || uuidv4());
    }
  }, [chatId, currentChatId]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);

      // Calculate initial token usage
      const initialUsage = initialMessages.reduce(
        (acc, message) => {
          if (message.usage) {
            acc.promptTokens += message.usage.promptTokens || 0;
            acc.completionTokens += message.usage.completionTokens || 0;
            acc.totalTokens += message.usage.totalTokens || 0;
          }
          return acc;
        },
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      );

      setTokenUsage(initialUsage);
    }
  }, [initialMessages, setMessages]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading || isGenerating) return;

      try {
        setIsGenerating(true);
        if (!input.trim()) return;

        const userMessageId = uuidv4();

        // If no chatId, create new chat
        if (!chatId && !chatCreated) {
          setChatCreated(true);
          await createChat(
            currentChatId,
            userId,
            assistantIdentifier,
            `${input.trim().slice(0, 50)}...`
          );
          window.history.replaceState(
            window.history.state,
            "",
            `/storeanalyicsaiassistant/${currentChatId}`
          );
        }

        setSuggestions([]);
        // Save user message with parts
        await saveMessage({
          id: userMessageId,
          chatId: currentChatId,
          content: input,
          role: "user",
          userId: userId,
          parts: [{ type: "text", content: input }],
        });

        originalHandleSubmit(e);
      } catch (error) {
        console.error("Error during form submission:", error);
        toast.error("Failed to process your request");
      } finally {
        setIsGenerating(false);
      }
    },
    [input, chatId, currentChatId, originalHandleSubmit]
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Add a ref to track if update is from message actions
  const isMessageActionUpdate = useRef(false);

  const handleMessageUpdate = useCallback(
    (messageId: string, updates: Record<string, unknown>) => {
      isMessageActionUpdate.current = true;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  useEffect(() => {
    // Only scroll if not from message actions (like, favorite, etc)
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
    // Reset the flag after each messages update
    isMessageActionUpdate.current = false;
  }, [messages, isAtBottom, suggestions]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollAreaRef.current) {
      const scrollContainer = e.currentTarget;
      const isBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop <=
        scrollContainer.clientHeight + 10;
      setIsAtBottom(isBottom);
    }
  };

  const handleSuggestedQuery = async (query: string) => {
    if (isLoading || isGenerating) return;
    try {
      if (!query.trim()) return;

      const userMessageId = uuidv4();

      // If no chatId, create new chat
      if (!chatId && !chatCreated) {
        setChatCreated(true);
        await createChat(
          currentChatId,
          userId,
          assistantIdentifier,
          `${query.trim().slice(0, 50)}...`
        );
        setChatTitle(`${query.trim().slice(0, 50)}...`);
        window.history.replaceState(
          window.history.state,
          "",
          `/storeanalyicsaiassistant/${currentChatId}`
        );
      }

      // Save user message
      await saveMessage({
        id: userMessageId,
        chatId: currentChatId,
        content: query,
        role: "user",
        userId: userId,
      });

      // Process the message with the AI
      append({
        role: "user",
        content: query,
      });
    } catch (error) {
      console.error("Error during suggested query:", error);
      toast.error("Failed to process your request");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSuggestions = useMemo(
    () => suggestions.filter((suggestion) => suggestion.trim()),
    [suggestions]
  );

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      // Find the message we want to regenerate from
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      const targetMessage = messages[messageIndex];
      if (targetMessage.role !== "assistant") return;

      try {
        // Get all message IDs that need to be deleted (including and after the target message)
        const messageIdsToDelete = messages
          .slice(messageIndex)
          .map((m) => m.id);

        // Delete messages from database
        await deleteMessagesByIds(messageIdsToDelete);

        // Remove messages from UI
        setMessages(messages.slice(0, messageIndex));

        // Get the last user message before this point
        const lastUserMessage = [...messages.slice(0, messageIndex)]
          .reverse()
          .find((m) => m.role === "user");

        if (lastUserMessage) {
          // Regenerate response
          append({
            role: "user",
            content: lastUserMessage.content,
          });
        }
      } catch (error) {
        console.error("Failed to regenerate messages:", error);
        toast.error("Failed to regenerate messages");
      }
    },
    [messages, append, currentChatId]
  );

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.focus();
        element.click();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [messages]
  );

  return (
    <div className="flex flex-col h-full max-h-screen">
      <ChatHeader
        onHistoryClick={handleHistoryClick}
        scrollToMessage={scrollToMessage}
        usage={tokenUsage}
        chatData={chatData}
        chatId={currentChatId}
        chatTitle={chatTitle}
      />

      <HistoryBar
        open={showHistory}
        setOpen={setShowHistory}
        data={history}
        onDelete={loadHistory}
        isHistoryLoading={isHistoryLoading}
      />

      {/* Chat area */}
      <ScrollArea
        className="flex-1 pb-4 pt-4"
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {messages.map((message, i) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={i === messages.length - 1}
              toolImplementations={toolImplementations}
              onUpdateMessages={handleMessageUpdate}
              onRegenerateMessage={handleRegenerateMessage}
            />
          ))}

          {/* Show suggested queries if there are only initial messages */}
          {messages.length <= 1 && filteredSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Try asking:
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleSuggestedQuery(query)}
                    className="px-4 py-2 bg-white text-black text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show suggestions after assistant responses */}
          {!isLoading &&
            messages.length > 1 &&
            messages[messages.length - 1].role === "assistant" &&
            filteredSuggestions.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Follow-up questions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.map((query) => (
                    <button
                      key={query}
                      onClick={() => handleSuggestedQuery(query)}
                      className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {isLoading && (
            <div className="flex items-center gap-2 self-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex space-x-2 p-3 bg-gray-100 rounded-lg">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex justify-between">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error?.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastUserMessage = [...messages]
                    .reverse()
                    .find((m) => m.role === "user");
                  if (lastUserMessage) {
                    append({
                      role: "user",
                      content: lastUserMessage.content,
                    });
                  }
                }}
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 md-4 border-t">
        <form
          onSubmit={handleFormSubmit}
          className="relative max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about your database..."
            className="pr-24 py-6 rounded-full border-gray-300"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Voice input"
              type="button"
            >
              <Mic className="w-5 h-5 text-gray-500" />
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Attach file"
              type="button"
            >
              <FileUp className="w-5 h-5 text-gray-500" />
            </Button> */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isGenerating}
              size="icon"
              className={cn(
                "rounded-full text-white",
                input.trim() && !isLoading ? "" : "bg-gray-400"
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
