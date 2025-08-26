import React, { ReactNode, useCallback } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";

type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
};

export const ChatMessages = React.memo(function ChatMessages(props: {
  messages: Message[];
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onBookmarkUpdate?: () => void;
  onFavoriteUpdate?: () => void;
}) {
  // Helper function to check if JSON is complete and valid
  const isCompleteJSON = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return false;
    }

    // Count braces to ensure they're balanced
    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          braceCount++;
        } else if (char === "}") {
          braceCount--;
        }
      }
    }

    return braceCount === 0;
  }, []);

  // Helper function to parse message content and extract chart data
  const parseMessageContent = useCallback(
    (content: string) => {
      // Only try to parse if the content looks like complete JSON
      if (!isCompleteJSON(content)) {
        return {
          parsedContent: content,
          chartType: null,
        };
      }

      try {
        const parsedMsg = JSON.parse(content);
        // Only return parsed data if it has the expected structure
        if (parsedMsg && typeof parsedMsg === "object") {
          return {
            parsedContent: parsedMsg.content,
            chartType: parsedMsg.chart || null,
            analyticCard: parsedMsg.analyticCard || null,
            analyticCardWithFileApi: parsedMsg.analyticCardWithFileApi || null,
            table: parsedMsg.table || null,
          };
        } else {
          // If parsing succeeds but structure is unexpected, return original
          return {
            parsedContent: content,
            chartType: null,
            analyticCard: null,
            analyticCardWithFileApi: null,
            table: null,
          };
        }
      } catch (error) {
        // If parsing fails, return original content
        return {
          parsedContent: content,
          chartType: null,
          analyticCard: null,
          analyticCardWithFileApi: null,
          table: null,
        };
      }
    },
    [isCompleteJSON]
  );

  return (
    <div className="flex flex-col mt-5  -z-50  max-w-[768px] mx-auto pb-12 w-full">
      {props.messages.map((m, i) => {
        if (m.role === "system") {
          return <IntermediateStep key={m.id} message={m} />;
        }

        const sourceKey = (props.messages.length - 1 - i).toString();

        // Parse content for assistant messages only
        let parsedMessage = m.content;
        let chartType = null;
        let analyticCard = null;
        let analyticCardWithFileApi = null;
        let table = null;

        if (m.role === "assistant") {
          const parsed = parseMessageContent(m.content);
          parsedMessage = parsed.parsedContent;
          chartType = parsed.chartType;
          analyticCard = parsed.analyticCard;
          analyticCardWithFileApi = parsed.analyticCardWithFileApi;
          table = parsed.table;
        }

        return (
          <ChatMessageBubble
            key={m.id}
            message={m}
            aiEmoji={props.aiEmoji}
            sources={props.sourcesForMessages[sourceKey]}
            onUpdateMessage={props.onUpdateMessage}
            parsedMessage={parsedMessage}
            chartType={chartType}
            analyticCard={analyticCard}
            analyticCardWithFileApi={analyticCardWithFileApi}
            table={table}
            messages={props.messages}
            onBookmarkUpdate={props.onBookmarkUpdate}
            onFavoriteUpdate={props.onFavoriteUpdate}
          />
        );
      })}
    </div>
  );
});
