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
import { Star, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteChat, getChatFavorites } from "../lib/actions";
import React from "react";

export interface Props {
  id: string;
  chatId: string;

  content: string;
  createdAt: string;
}

const Favorites = ({
  favorites,
  onFavoriteUpdate,
}: {
  favorites: Props[];
  onFavoriteUpdate: () => void;
}) => {
  const handleDelete = async (id: string) => {
    try {
      await deleteChat(id);
      onFavoriteUpdate();
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(`Error deleting chat ${error}`);
      throw error;
    }
  };

  const fetchBookmarks = React.useCallback(async () => {
    try {
      const data = await getChatFavorites("LangStarter");

      // setFavorites(data);
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
            <Star className="w-5 h-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup className="md:max-h-[400px] overflow-y-auto md:max-w-[300px]">
            {favorites?.length > 0 ? (
              favorites.map((item) => (
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
              <div>No data avaliable</div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Favorites;
