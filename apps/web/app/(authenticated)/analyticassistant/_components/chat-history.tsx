"use client";

import { Bookmark, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useState } from "react";
import { deleteChat } from "../actions";
import Link from "next/link";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: Record<string, string | boolean | number>[];
  onDelete: () => void;
  isHistoryLoading: boolean;
}

export default function HistoryBar({
  open,
  setOpen,
  data,
  onDelete,
  isHistoryLoading,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    try {
      await deleteChat(id);
      toast.success("Chat deleted successfully");
      onDelete();
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const filteredData = data
    .filter((item) => item.status !== "delete")
    .filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {filteredData.length === 0 ? (
            <>
              {isHistoryLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  {searchTerm
                    ? "No matching items found"
                    : data.length === 0
                    ? "No history found"
                    : "No items to display"}
                </div>
              )}
            </>
          ) : (
            filteredData.map((chat) => (
              <div
                key={chat.chatId}
                className="hover:bg-secondary cursor-pointer p-2.5 rounded-md"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex justify-between items-center gap-2">
                    {chat.bookmark && (
                      <Bookmark className="h-5 w-5 fill-primary text-primary" />
                    )}
                    <Link
                      href={`/analyticassistant/${chat.form_id}/${chat.id}`}
                    >
                      <p>{chat.title}</p>
                    </Link>
                  </div>
                  <Trash
                    className="h-5 w-5 text-muted-foreground"
                    onClick={() => handleDelete(chat.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
