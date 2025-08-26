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
import { Bookmark, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteChat, getChatBookMarks } from "../lib/actions";

import React from "react";

export interface Props {
  id: string;
  chatId: string;
  content: string;
  createdAt: string;
}

const BookMark = ({
  bookmarks,
  onBookmarkUpdate,
}: {
  bookmarks: Props[];
  onBookmarkUpdate: () => void;
}) => {
  // const [bookMarks, setBookMarks] = React.useState<Props[]>([]);
  const handleDelete = async (id: string) => {
    try {
      await deleteChat(id);
      onBookmarkUpdate();
      toast.success("Bookmark removed successfully");
    } catch (error) {
      toast.error(`Error removing bookmark: ${error}`);
      throw error;
    }
  };

  const fetchBookmarks = React.useCallback(async () => {
    try {
      const data = await getChatBookMarks("LangStarter");

      // setBookMarks(data);
    } catch (error) {
      toast.error(`Error ${error}`);
      throw error;
    }
  }, []);

  React.useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} size={"icon"} className="rounded-full">
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup className="md:max-h-[400px] overflow-y-auto md:max-w-[300px]">
            {bookmarks?.length > 0 ? (
              bookmarks.map((item) => (
                <DropdownMenuItem
                  className="bg-muted  overflow-y-auto mb-2"
                  key={item.id}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="overflow-ellipsis ">
                      <Link href={`/langchain-chat/chat/${item.chatId}`}>
                        <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                          {item.content}
                        </p>
                        <p>{formatDate(item.createdAt)}</p>
                      </Link>
                    </div>
                    <div className="hover:bg-red-100 rounded-md p-2.5">
                      {/* <Trash
                        onClick={() => handleDelete(item.id)}
                        className="w-5 cursor-pointer h-5 text-red-500"
                      /> */}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div>
                <h1>No data avaliable</h1>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BookMark;
