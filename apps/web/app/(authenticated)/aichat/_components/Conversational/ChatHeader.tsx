"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  Brain,
  ChevronDown,
  History,
  Menu,
  MessageSquare,
  Plus,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface DataProps {
  api_connection_json?: string;
  content: unknown;
  data_api_url?: string;
  db_connection_json?: string;
  form_id: number;
  form_name: string;
  story_api?: string;
}

interface PageProps {
  data: DataProps[];
  formId: number;
  setOpenHistory: (value: boolean) => void;
  setOpenFavorite: (value: boolean) => void;
  setOpenMenu: (value: boolean) => void;
}

const ChatHeader = ({
  data,
  formId,
  setOpenHistory,
  setOpenFavorite,
  setOpenMenu,
}: PageProps) => {
  const [aiChatMode, setAiChatMode] = React.useState(false);
  const [dropdownMenu, setDropdownMenu] = React.useState(false);

  return (
    <div className="flex justify-between pb-2.5  w-full gap-2.5">
      <div className="flex items-center gap-2.5">
        <Bot className="w-6 h-6 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{data && data[0]?.form_name}</h2>
      </div>

      <div className="flex items-center gap-5">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer hover:bg-muted hover:rounded-md p-2.5 items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-muted-foreground cursor-pointer" />
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link
                  href={`/aichat/${formId}`}
                  onClick={() => setAiChatMode(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    <span>QNA Mode</span>
                    {!aiChatMode && (
                      <div>
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/aichat/ai_mode/${formId}?mode=ai`}
                  onClick={() => setAiChatMode(true)}
                >
                  <div className="flex justify-between w-full items-center gap-2.5">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-muted-foreground" />
                      <span>AI Mode</span>
                    </div>
                    {aiChatMode && (
                      <div>
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <DropdownMenu open={dropdownMenu} onOpenChange={setDropdownMenu}>
            <DropdownMenuTrigger asChild>
              <div className="hover:bg-muted p-2 hover:rounded-full">
                <Menu className="w-5 h-5 cursor-pointer text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuItem>
                <Link href={`/aichat/${formId}`}>
                  <div className="flex items-center gap-2.5">
                    <Plus className="h-5 w-5  text-muted-foreground" />
                    <span>New Chat</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  className="flex items-center gap-2.5"
                  onClick={() => {
                    setOpenHistory(true);
                    setDropdownMenu(false);
                  }}
                >
                  <History className="h-5 w-5  text-muted-foreground" />
                  <span>History</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  className="flex items-center gap-2.5"
                  onClick={() => {
                    setOpenFavorite(true);
                    setDropdownMenu(false);
                  }}
                >
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <span>Favorites</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  className="flex items-center gap-2.5"
                  onClick={() => {
                    setOpenMenu(true);
                    setDropdownMenu(false);
                  }}
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>Agents</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
