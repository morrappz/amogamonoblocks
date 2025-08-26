"use client";
import { Search, Star, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useState } from "react";
import { deleteMessage } from "../actions";

interface BookmarkMessage {
  id: string;
  content: string;
  chatId: string;
  bookmark: boolean;
}

interface BookmarkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: BookmarkMessage[];
  onRefresh: () => void;
  scrollToMessage: (messageId: string) => void;
  isLoadingFavoriteMessages: boolean;
}

export default function FavoriteMessagesModal({
  open,
  onOpenChange,
  messages,
  onRefresh,
  scrollToMessage,
  isLoadingFavoriteMessages,
}: BookmarkModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const filteredMessages = messages.filter((msg) =>
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (messageId: string) => {
    setIsLoading((prev) => ({ ...prev, [messageId]: true }));
    try {
      await deleteMessage(messageId);
      onRefresh();
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setIsLoading((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleOpenChat = (messageId: string) => {
    scrollToMessage(messageId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bookmarked Messages</SheetTitle>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <>
              {isLoadingFavoriteMessages ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  {searchTerm
                    ? "No matching messages"
                    : "No bookmarked messages"}
                </div>
              )}
            </>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg border p-3 hover:bg-accent group relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-4 w-4 fill-primary" />
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isLoading[msg.id]}
                  >
                    <Trash
                      className={`h-4 w-4 text-muted-foreground hover:text-red-500 ${
                        isLoading[msg.id] ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <p
                  onClick={() => handleOpenChat(msg.id)}
                  className="text-sm cursor-pointer line-clamp-3"
                >
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
