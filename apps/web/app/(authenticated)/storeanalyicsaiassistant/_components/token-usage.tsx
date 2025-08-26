import { memo } from "react";
import { Coins } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TokenUsageProps {
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const TokenUsage = memo(({ usage }: TokenUsageProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-1">
          <Coins className="w-5 h-5 text-yellow-500" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p>Prompt Tokens: {usage.promptTokens}</p>
          <p>Completion Tokens: {usage.completionTokens}</p>
          <p>Total Tokens: {usage.totalTokens}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

TokenUsage.displayName = "TokenUsage";
export default TokenUsage;
