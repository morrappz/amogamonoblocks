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
import { Bookmark, LoaderCircle, Star, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  deleteChat,
  getChatBookMarks,
  removeImportant,
} from "@/app/(authenticated)/langchain-chat/lib/actions";

import React from "react";

export interface Props {
  id: string;
  chatId: string;
  content: string;
  createdAt: string;
  prompt_uuid: string;
}

const Important = ({
  important,
  onDropdownOpen,
  onImportantUpdate,
  loading,
  onImportantClick,
}: {
  important: Props[];
  onDropdownOpen: () => void;
  onImportantUpdate: () => void;
  loading: boolean;
  onImportantClick?: (promptUuid: string) => void;
}) => {
  const handleDelete = async (id: string, event: React.MouseEvent) => {
    // Prevent dropdown from closing when clicking delete
    event.stopPropagation();
    event.preventDefault();

    try {
      await removeImportant(id);
      onImportantUpdate();
      toast.success("Important removed successfully");
    } catch (error) {
      console.error("Error removing important:", error);
      toast.error(`Error removing important: ${error}`);
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
            <Star className="w-5 h-5 text-muted-foreground" />
            <span>Important</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="max-h-[400px] overflow-y-auto ">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading important messages...
                </span>
              </div>
            ) : important?.length > 0 ? (
              important.map((item) => (
                <DropdownMenuItem
                  className="bg-muted  overflow-y-auto mb-2"
                  key={item.id}
                  onSelect={(e) => {
                    // Prevent dropdown from closing when selecting the item
                    e.preventDefault();
                  }}
                >
                  <div className="flex justify-between w-full items-center">
                    <div
                      className="overflow-ellipsis cursor-pointer flex-1"
                      onClick={() => onImportantClick?.(item.prompt_uuid)}
                    >
                      <>
                        <p className="overflow-ellipsis line-clamp-2 break-all">
                          {item.content}
                        </p>
                        <p>{formatDate(item.createdAt)}</p>
                      </>
                    </div>
                    <div className="hover:bg-red-100 hover:scale-110 rounded-md p-2.5">
                      <Trash
                        onClick={(e) => handleDelete(item.id, e)}
                        className="w-4 cursor-pointer h-4  text-red-500"
                      />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No Important messages available
                </p>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Important;
