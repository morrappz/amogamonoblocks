/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Search, Star, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  // bookmarks: any[];
  favorites: any[];
  setRefreshState: (value: React.SetStateAction<boolean>) => void;
  title: string;
}

const BookmarkBar = ({
  open,
  setOpen,
  // bookmarks,
  favorites,
  setRefreshState,
  title,
}: Props) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [combinedItems, setCombinedItems] = useState<any[]>([]);

  // Process and combine bookmarks and favorites whenever they change
  useEffect(() => {
    // console.log("BookmarkBar received bookmarks:", bookmark

    // Combine and deduplicate items
    const combined = [...favorites].filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    setCombinedItems(combined);
  }, [favorites]);

  const handleClick = (chatId: string) => {
    router.push(`/agent/${chatId}`);
    setOpen(false);
  };

  // const handleRemoveBookmark = async (messageId: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://amogaagents.morr.biz/Message?id=eq.${messageId}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Prefer: "return=representation",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //         body: JSON.stringify({
  //           bookmark: false,
  //           favorite: false,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       toast({
  //         description: "Failed to remove bookmark",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Trigger refresh in parent component
  //     setRefreshState((prev) => !prev);

  //     toast({
  //       description: "Bookmark removed successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error removing bookmark:", error);
  //     toast({
  //       description: "Failed to remove bookmark",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleRemoveFavorite = async (messageId: string) => {
    try {
      const response = await fetch(
        `https://amogaagents.morr.biz/Message?id=eq.${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            favorite: false,
          }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to remove favorite");
        return;
      }

      // Trigger refresh in parent component
      setCombinedItems((prevItems) =>
        prevItems.filter((item) => item.id !== messageId)
      );
      setRefreshState((prev) => !prev);

      toast.success("Favorite removed successfully");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  // Filter items based on search term
  const filteredItems = combinedItems.filter((item) =>
    item.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Sheet open={open} onOpenChange={(open) => setOpen(open ? true : false)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="mb-4">{title}</SheetTitle>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </SheetHeader>

          <div className="mt-4">
            {filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                {searchTerm
                  ? "No matching items found"
                  : combinedItems.length === 0
                  ? "No saved messages found"
                  : "No items to display"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.favorite && (
                          <Star className="h-4 w-4 fill-primary" />
                        )}
                        {/* {item.bookmark && (
                          <Bookmark className="h-4 w-4 fill-primary text-primary" />
                        )} */}
                      </div>
                      <Trash
                        className="h-4 w-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                        onClick={() =>
                          item.favorite && handleRemoveFavorite(item.id)
                        }
                      />
                    </div>
                    <p
                      className="mt-2 line-clamp-3 text-sm cursor-pointer"
                      onClick={() => handleClick(item.chatId)}
                    >
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BookmarkBar;
