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
import { History, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteChat, getChatHistory } from "../lib/actions";

import React from "react";
interface HistoryProps {
  id: string;
  title: string;
  createdAt: string;
}
const HistoryView = ({
  history,
  onHistoryUpdate,
}: {
  history: HistoryProps[];
  onHistoryUpdate: () => Promise<void>;
}) => {
  const fetchHistory = React.useCallback(async () => {
    try {
      const data = await getChatHistory("LangStarter");
      onHistoryUpdate();
      // setHistory(data);
    } catch (error) {
      toast.error(`Error ${error}`);
      throw error;
    }
  }, [onHistoryUpdate]);
  const handleDelete = async (id: string) => {
    try {
      await deleteChat(id);
      fetchHistory();
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(`Error deleting chat ${error}`);
      throw error;
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} size={"icon"} className="rounded-full">
            <History className="w-5 h-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="md:max-h-[400px]  overflow-y-auto">
            {history?.length > 0 &&
              history.map((item) => (
                <DropdownMenuItem
                  className="bg-muted  overflow-y-auto mb-2"
                  key={item.id}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="overflow-ellipsis hover:scale-105 duration-300 ease-in-out ">
                      <Link href={`/langchain-chat/chat/${item.id}`}>
                        <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                          {item.title}
                        </p>
                        <p>{formatDate(item.createdAt)}</p>
                      </Link>
                    </div>
                    <div className="hover:bg-red-100 hover:scale-110 rounded-md p-2.5">
                      <Trash
                        onClick={() => handleDelete(item.id)}
                        className="w-5  cursor-pointer h-5 text-red-500"
                      />
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

export default HistoryView;
