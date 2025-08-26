import React, { ReactNode, useCallback, useEffect } from "react";
import { AssistantMessageBubble } from "./AssistantMessageBubble";
import { AssistantData, ChartData, Query } from "../types/types";
import { Button } from "@/components/ui/button";
import { useChatStore } from "./useStore";

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
  initialMsg: boolean;
};

export const AssistantMessages = React.memo(function ChatMessages(props: {
  messages: Message[];
  emptyStateComponent: ReactNode;
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  jsonData: AssistantData[];
  handleAssistant: (assistant: Query, apiConnection: string) => void;
  onAnalyzeData: (messageId: string, data: any) => Promise<void>; // New prop
  onDismissAnalysisPrompt: (messageId: string) => void; // New prop
  suggestedPrompts: (data: any) => Promise<void>;
  handleSuggestedPrompts: (msg: string, data: any) => Promise<void>;
}) {
  const { setChartData } = useChatStore();

  // outside render loop
  useEffect(() => {
    const latestChart = props.messages.findLast((m) => m.chart?.title)?.chart;
    if (latestChart) {
      setChartData(latestChart);
    }
  }, [props.messages, setChartData]);

  return (
    <div className="flex flex-col mt-5  -z-50  max-w-[768px] mx-auto pb-12 w-full">
      {/* <div>
        {props.jsonData.map((data) => (
          <div className="flex gap-2.5 flex-wrap" key={data.form_id}>
            {data.content[0].queries.map((assistant) => (
              <Button
                onClick={() =>
                  props.handleAssistant(
                    assistant,
                    props.jsonData[0].api_connection_json
                  )
                }
                className="rounded-full"
                variant={"outline"}
                key={assistant.id}
              >
                {assistant.name}
              </Button>
            ))}
          </div>
        ))}
      </div> */}
      {props.messages.map((m, i) => {
        const sourceKey = (props.messages.length - 1 - i).toString();

        // Parse content for assistant messages only
        let parsedMessage = m.content;
        const tableColumns = m.table_columns;

        if (m.role === "assistant") {
          const parsed = m.content;

          if (typeof parsed === "string") {
            try {
              // Check if the string looks like JSON (starts with [ or {)
              if (parsed.trim().match(/^[\{\[]/)) {
                parsedMessage = JSON.parse(parsed);
              } else {
                parsedMessage = parsed;
              }
            } catch (e) {
              // If parsing fails, use the original string
              parsedMessage = parsed;
            }
          } else {
            parsedMessage = parsed;
          }
        }

        return (
          <AssistantMessageBubble
            key={m.id}
            message={m}
            aiEmoji={props.aiEmoji}
            sources={props.sourcesForMessages[sourceKey]}
            onUpdateMessage={props.onUpdateMessage}
            parsedMessage={parsedMessage}
            tableColumns={tableColumns}
            onAnalyzeData={props.onAnalyzeData}
            onDismissAnalysisPrompt={props.onDismissAnalysisPrompt}
            suggestedPrompts={props.suggestedPrompts}
            handleSuggestedPrompts={props.handleSuggestedPrompts}
            handleAssistant={props.handleAssistant}
            jsonData={props.jsonData}
            // onBookmarkUpdate={handleBookmarkUpdate}
            // onFavoriteUpdate={handleFavoriteUpdate}
          />
        );
      })}
    </div>
  );
});
