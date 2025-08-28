//Chat Message Bubble

import {
  getChatBookMarks,
  getMessageById,
  getMessagesByPromptUuid,
  updateMessageStatus,
} from "@/app/(authenticated)/langchain-chat/lib/actions";
import { cn } from "@/utils/cn";
import {
  AlarmClockCheck,
  Bookmark,
  Copy,
  Ellipsis,
  Heart,
  Star,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartRenderer } from "./ChartRenderer";
import AnalyticCard from "./AnalyticCard";
import ShareMenu from "./MenuItems/ShareMenu";
import RenderTable from "./RenderTable";
import AnalyticCardFileApi from "./AnalyticCardFileApi/AnalyticCardFileApi";
import ShareFileMenu from "./AnalyticCardFileApi/ShareMenu";
import { useAuth } from "@/context/supabase-provider";

type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  important?: boolean;
  favorite?: boolean;
  chart?: any; // Can now hold complex chart objects
};

interface Props {
  message: Message;
  aiEmoji?: string;
  sources: any[];
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onBookmarkUpdate?: () => void;
  onFavoriteUpdate?: () => void;
  parsedMessage: string;
  chartType: any;
  analyticCard: any;
  analyticCardWithFileApi: any;
  table: {
    headers: string[];
    rows: string[][];
  } | null;
  messages: Message[]; // <-- add messages array
}

export const ChatMessageBubble = React.memo(function ChatMessageBubble(
  props: Props
) {
  const {
    message,
    onUpdateMessage,
    parsedMessage,
    chartType,
    analyticCard,
    analyticCardWithFileApi,
    table,
    messages,
  } = props;
  const { session } = useAuth();

  // State to track the icon status from the corresponding user prompt
  const [iconStatus, setIconStatus] = useState({
    important: false,
    favorite: false,
  });

  // Load the icon status when component mounts or message changes
  useEffect(() => {
    const loadIconStatus = async () => {
      if (message.role === "assistant") {
        try {
          const currentMessage = await getMessageById(message.id);
          const promptMessages = await getMessagesByPromptUuid(
            currentMessage?.prompt_uuid
          );
          const userPrompt = promptMessages.find((msg) => msg.role === "user");
          setIconStatus({
            important: userPrompt?.important || false,
            favorite: userPrompt?.favorite || false,
          });
        } catch (error) {
          console.error("Error loading icon status:", error);
          // Set default values on error
          setIconStatus({
            important: false,
            favorite: false,
          });
        }
      } else {
        // For user messages, use their own status
        setIconStatus({
          important: message?.important || false,
          favorite: message?.favorite || false,
        });
      }
    };

    loadIconStatus();
  }, [message.id, message.important, message.favorite, message.role]);

  const handleImportant = async () => {
    const currentMessage = await getMessageById(message.id);

    const getPrompt = await getMessagesByPromptUuid(
      currentMessage?.prompt_uuid
    );

    const userPrompt = getPrompt.filter((msg) => msg.role === "user");

    // Check if userPrompt exists before accessing
    if (userPrompt.length === 0) {
      console.warn("No user prompt found for this message");
      return;
    }

    const newImportantStatus = !iconStatus.important;

    onUpdateMessage(userPrompt[0].id, {
      important: newImportantStatus,
    });

    // Update local icon status immediately
    setIconStatus((prev) => ({
      ...prev,
      important: newImportantStatus,
    }));

    props.onBookmarkUpdate?.();
  };

  const handleFavorite = async () => {
    const currentMessage = await getMessageById(message.id);

    const getPrompt = await getMessagesByPromptUuid(
      currentMessage?.prompt_uuid
    );

    const userPrompt = getPrompt.filter((msg) => msg.role === "user");

    // Check if userPrompt exists before accessing
    if (userPrompt.length === 0) {
      console.warn("No user prompt found for this message");
      return;
    }

    const newFavoriteStatus = !iconStatus.favorite;

    onUpdateMessage(userPrompt[0].id, {
      favorite: newFavoriteStatus,
    });

    // Update local icon status immediately
    setIconStatus((prev) => ({
      ...prev,
      favorite: newFavoriteStatus,
    }));

    props.onFavoriteUpdate?.();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message Copied Successfully");
  };

  return (
    <div
      className={cn(
        "mb-8 flex flex-col items-start",
        message.role === "user" && "items-end"
      )}
    >
      <div className="mb-1 w-10 h-10 rounded-full flex items-center justify-center  text-muted-foreground">
        {message.role === "user"
          ? session?.user?.email?.[0]?.toUpperCase()
          : props.aiEmoji}
      </div>

      <div
        className={cn(
          "rounded-[24px] px-4 py-2 md:max-w-[80%] max-w-[95%] flex flex-col",
          message.role === "user"
            ? "bg-secondary text-secondary-foreground"
            : " text-muted-foreground"
        )}
      >
        <div className="whitespace-pre-wrap flex flex-col">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ul: ({ children }) => (
                <ul className="list-disc pl-5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {message.role === "assistant" ? parsedMessage : message.content}
          </ReactMarkdown>

          {table && table?.headers?.length > 0 && (
            <RenderTable table={table} title={"Untitled"} />
          )}
          {chartType?.data && <ChartRenderer chartData={chartType} />}
          {analyticCard?.tabs && <AnalyticCard analyticCard={analyticCard} />}
          {analyticCardWithFileApi?.table && (
            <AnalyticCardFileApi
              analyticCardWithFileApi={analyticCardWithFileApi}
            />
          )}
          {message.role === "assistant" && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5 mt-2">
                <Copy
                  onClick={handleCopy}
                  className="h-5 w-5 cursor-pointer hover:text-primary text-muted-foreground"
                />
                <Star
                  onClick={handleImportant}
                  className={`h-5 w-5 ${
                    iconStatus?.important
                      ? "fill-yellow-500 text-yellow-500"
                      : ""
                  } cursor-pointer hover:text-primary text-muted-foreground`}
                />

                <Heart
                  onClick={handleFavorite}
                  className={`h-5 w-5 ${
                    iconStatus?.favorite ? "fill-red-500 text-red-500" : ""
                  } cursor-pointer hover:text-red-600 text-muted-foreground`}
                />
                <AlarmClockCheck className="h-5 cursor-pointer hover:text-primary w-5 text-muted-foreground" />
              </div>
              {(analyticCard?.tabs || table?.headers) && (
                <ShareMenu data={analyticCard} table={table} />
              )}
              {analyticCardWithFileApi?.table && (
                <ShareFileMenu data={analyticCardWithFileApi} />
              )}
            </div>
          )}

          {props.sources && props.sources.length ? (
            <>
              <code className="mt-4 mr-auto bg-primary px-2 py-1 rounded">
                <h2>🔍 Sources:</h2>
              </code>
              <code className="mt-1 mr-2 bg-primary px-2 py-1 rounded text-xs">
                {props.sources?.map((source, i) => (
                  <div className="mt-2" key={"source:" + i}>
                    {i + 1}. &quot;{source.pageContent}&quot;
                    {source.metadata?.loc?.lines !== undefined ? (
                      <div>
                        <br />
                        Lines {source.metadata?.loc?.lines?.from} to{" "}
                        {source.metadata?.loc?.lines?.to}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </code>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
});
