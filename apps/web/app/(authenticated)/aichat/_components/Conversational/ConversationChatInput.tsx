"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Loader2 } from "lucide-react";
import React from "react";

interface suggestions {
  id: number;
  api: string;
  description: string;
  query: string;
  name: string;
  type: string;
}

interface PageProps {
  input: string;
  loading: boolean;
  setInput: (value: string) => void;
  selectedSuggestion: suggestions | null;
}

const ConversationChatInput = ({
  input,
  setInput,
  loading,
  selectedSuggestion,
}: PageProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(input);
  };

  return (
    <div>
      <div className="border w-full bottom-0 sticky my-3 bg-muted p-4 rounded-md">
        <form className="" onSubmit={handleSubmit}>
          <div className="flex gap-2.5 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question"
              className="w-full border-none"
            />
            <Button
              disabled={!input || !selectedSuggestion || loading}
              size={"icon"}
              className="rounded-full"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationChatInput;
