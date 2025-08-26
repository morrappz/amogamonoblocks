"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { History as HistoryIcon, Trash, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  deleteChat,
  getChatHistory,
} from "@/app/(authenticated)/langchain-chat/lib/actions";

import React from "react";

interface HistoryProps {
  id: string;
  title: string;
  createdAt: string;
}

const History = ({
  history,
  onDropdownOpen,
  onHistoryUpdate,
  loading = false,
}: {
  history: HistoryProps[];
  onDropdownOpen: () => void;
  onHistoryUpdate: () => void;
  loading?: boolean;
}) => {
  const handleDelete = async (id: string, event: React.MouseEvent) => {
    // Prevent dropdown from closing when clicking delete
    event.stopPropagation();
    event.preventDefault();

    try {
      await deleteChat(id);
      toast.success("Chat deleted successfully");
      // Refresh the history after deletion
      onHistoryUpdate();
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(`Error deleting chat: ${error}`);
    }
  };

  return (
    <div>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            onDropdownOpen();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-muted-foreground" />
            <span>History</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="max-h-[400px]  overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading history...
                </span>
              </div>
            ) : history?.length > 0 ? (
              history.map((item) => (
                <DropdownMenuItem
                  className="bg-muted overflow-y-auto mb-2"
                  key={item.id}
                  onSelect={(e) => {
                    // Prevent dropdown from closing when selecting the item
                    e.preventDefault();
                  }}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="overflow-ellipsis hover:scale-105 duration-300 ease-in-out flex-1">
                      <Link href={`/langchain-chat/chat/${item.id}`}>
                        <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                      </Link>
                    </div>
                    <div className="hover:bg-red-100 hover:scale-110 rounded-md p-2.5">
                      <Trash
                        onClick={(e) => handleDelete(item.id, e)}
                        className="w-4 h-4 cursor-pointer text-red-500"
                      />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No chat history available
                </p>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default History;
