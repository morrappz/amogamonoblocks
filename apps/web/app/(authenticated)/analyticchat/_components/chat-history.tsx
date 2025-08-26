/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bookmark, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { deleteChat } from "../actions";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any[];
  onDelete: () => void;
}

export default function HistoryBar({ open, setOpen, data, onDelete }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleClick = (id: string) => {
    router.push(`/analyticchat/${id}`);
    setOpen(false);
  };

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
            <div className="text-center text-muted-foreground py-4">
              {searchTerm
                ? "No matching items found"
                : data.length === 0
                ? "No history found"
                : "No items to display"}
            </div>
          ) : (
            filteredData.map((prompt: any) => (
              <div
                key={prompt.chatId}
                className="hover:bg-secondary cursor-pointer p-2.5 rounded-md"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex justify-between items-center gap-2">
                    {prompt.bookmark && (
                      <Bookmark className="h-5 w-5 fill-primary text-primary" />
                    )}

                    <p onClick={() => handleClick(prompt.id)}>
                      {prompt.title}
                    </p>
                  </div>
                  <Trash
                    className="h-5 w-5 text-muted-foreground"
                    onClick={() => handleDelete(prompt.id)}
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
