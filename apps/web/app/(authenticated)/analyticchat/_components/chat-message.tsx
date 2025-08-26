"use client";

import type { Message } from "ai";
import { memo, useState, useEffect, useMemo } from "react";
import {
  Bot,
  User,
  Eye,
  Star,
  Copy,
  RefreshCcw,
  Share2,
  Pencil,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import QueryResult from "./query-result";
import { toast } from "sonner";
import { updateMessageFavorite, updateMessageFeedback } from "../actions";

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  toolImplementations: {
    executeSql: (
      args: unknown
    ) => Promise<{ success: boolean; queryResults?: unknown }>;
    generateChart: (args: { config: unknown }) => Promise<{ success: boolean }>;
  };
  onUpdateMessages?: (
    messageId: string,
    updates: Record<string, unknown>
  ) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

function ChatMessage({
  message,
  isLast,
  toolImplementations,
  onUpdateMessages,
  onRegenerateMessage,
}: ChatMessageProps) {
  const [sqlResults, setSqlResults] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract tool calls from the message
  const toolCalls = useMemo(
    () => message.toolInvocations || [],
    [message.toolInvocations]
  );

  useEffect(() => {
    const processTool = async () => {
      // Only process tools for assistant messages
      if (message.role !== "assistant" || !toolCalls.length || isProcessing) {
        return;
      }

      setIsProcessing(true);

      // Find SQL execution calls
      const sqlCall = toolCalls.find((tool) => tool.toolName === "executeSql");
      if (sqlCall && !sqlCall.result) {
        try {
          const result = await toolImplementations.executeSql(sqlCall.args);
          if (result.success) {
            setSqlResults(result.queryResults);
          }
        } catch (error) {
          console.error("Error executing SQL:", error);
        }
      } else if (sqlCall?.result?.success) {
        setSqlResults(sqlCall.result.queryResults);
      }

      // Find chart generation calls
      const chartCall = toolCalls.find(
        (tool) => tool.toolName === "generateChart"
      );
      if (chartCall && !chartCall.result) {
        try {
          const result = await toolImplementations.generateChart(
            chartCall.args
          );
          if (result.success) {
            setChartConfig(chartCall.args.config);
          }
        } catch (error) {
          console.error("Error generating chart:", error);
        }
      } else if (chartCall?.args?.config) {
        setChartConfig(chartCall.args.config);
      }

      setIsProcessing(false);
    };

    processTool();
  }, [message, toolCalls, toolImplementations, isProcessing]);

  const handleFavorite = async () => {
    try {
      const newFavoriteStatus = !message.favorite;

      // Update UI immediately
      onUpdateMessages?.(message.id, { favorite: newFavoriteStatus });

      await updateMessageFavorite(message.id, newFavoriteStatus);
      toast.success(
        newFavoriteStatus ? "Message favorited" : "Favorite removed"
      );
    } catch (error) {
      // Revert UI on error
      onUpdateMessages?.(message.id, { favorite: !newFavoriteStatus });
      console.error("Error updating favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleLike = async (type: "like" | "dislike") => {
    try {
      const currentIsLike = message.isLike;
      const newIsLike =
        type === "like"
          ? currentIsLike === true
            ? null
            : true
          : currentIsLike === false
          ? null
          : false;

      // Update UI immediately
      onUpdateMessages?.(message.id, { isLike: newIsLike });

      await updateMessageFeedback(message.id, newIsLike);
      toast.success(
        newIsLike === true
          ? "Message liked"
          : newIsLike === false
          ? "Message disliked"
          : "Feedback removed"
      );
    } catch (error) {
      onUpdateMessages?.(message.id, { isLike: message.isLike });
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  const handleRegenerate = async () => {
    try {
      // Only allow regeneration for assistant messages
      if (message.role !== "assistant") return;
      onRegenerateMessage?.(message.id);
    } catch (error) {
      console.error("Error regenerating message:", error);
      toast.error("Failed to regenerate message");
    }
  };

  return (
    // flex-row-reverse
    <div className={`flex gap-2 ${message.role === "assistant" ? "" : ""}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        {message.role === "assistant" ? (
          <Bot className="w-5 h-5 text-gray-700" />
        ) : (
          <User className="w-5 h-5 text-gray-700" />
        )}
      </div>
      <div className="flex flex-col items-start w-full">
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            message.role === "assistant"
              ? " bg-primary-foreground text-primary"
              : "bg-primary-foreground text-primary"
          } text-gray-800`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Render SQL results and chart if available */}
        {(sqlResults || chartConfig) && (
          <QueryResult results={sqlResults} chartConfig={chartConfig} />
        )}

        {message.content &&
          message.content.length > 1 &&
          message.role === "assistant" && (
            <div className="flex items-center gap-3 mt-2">
              <button className="h-8 w-8 text-gray-500 hover:text-gray-700">
                <Eye className="h-4 w-4" />
              </button>
              <button
                className={`h-8 w-8 ${
                  message.favorite ? "text-yellow-500" : "text-gray-500"
                } hover:text-yellow-700`}
                onClick={handleFavorite}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                onClick={handleRegenerate}
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 text-gray-500 hover:text-gray-700">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 text-gray-500 hover:text-gray-700">
                <Pencil className="h-4 w-4" />
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  className={`h-8 w-8 ${
                    message.isLike === true ? "text-green-500" : "text-gray-500"
                  } hover:text-green-700`}
                  onClick={() => handleLike("like")}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                  className={`h-8 w-8 ${
                    message.isLike === false ? "text-red-500" : "text-gray-500"
                  } hover:text-red-700`}
                  onClick={() => handleLike("dislike")}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        {isLast && <></>}
      </div>
    </div>
  );
}

export default memo(ChatMessage, (prevProps, nextProps) => {
  // Always re-render the last message, otherwise shallow compare
  return (
    !nextProps.isLast &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.message === nextProps.message
  );
});
