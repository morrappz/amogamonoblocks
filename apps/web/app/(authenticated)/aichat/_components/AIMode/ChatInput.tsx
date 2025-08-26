import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, FileUp, Loader2, Mic } from "lucide-react";
import React from "react";

interface PageProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<null | undefined>;
  isResponseLoading: boolean;
  listening: boolean;
  handleMicClick: () => void;
}

const ChatInput = ({
  prompt,
  setPrompt,
  handleSubmit,
  isResponseLoading,
  listening,
  handleMicClick,
}: PageProps) => {
  return (
    <div>
      <div className="border w-full bottom-0 sticky my-3 bg-muted p-4 rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2.5 w-full">
            <Input
              placeholder="Type your message here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-0"
            />
            <div className="flex items-center gap-4">
              <FileUp className="w-5 h-5 cursor-not-allowed text-muted-foreground" />
              <Button
                disabled={isResponseLoading || !prompt}
                size={"icon"}
                className="rounded-full"
              >
                {isResponseLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 " />
                )}
              </Button>
              <Button
                onClick={handleMicClick}
                size={"icon"}
                disabled={listening}
                className="rounded-full"
              >
                {listening ? (
                  <Loader2 className="w-5 animate-spin h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
