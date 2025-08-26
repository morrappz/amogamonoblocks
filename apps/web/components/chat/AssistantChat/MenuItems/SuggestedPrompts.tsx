import React from "react";
import prompts from "@/data/suggestedprompts.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpingHand } from "lucide-react";
import { Button } from "@/components/ui/button";

const SuggestedPrompts = () => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* <Button variant={"ghost"} size={"icon"} className="rounded-full"> */}
          <HelpingHand className="w-5 h-5 cursor-pointer text-muted-foreground" />
          {/* </Button> */}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="max-h-[400px]  overflow-y-auto">
            {prompts[0].queries.map((prompt) => (
              <DropdownMenuItem className="bg-muted mb-2" key={prompt.id}>
                <div className="flex justify-between w-full items-center">
                  <div className="overflow-ellipsis hover:scale-105 duration-300 ease-in-out flex-1">
                    <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                      {prompt.name}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SuggestedPrompts;
