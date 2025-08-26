import { memo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Clock,
  Menu,
  Plus,
  Star,
  Edit,
  Check,
  X,
  Bookmark,
} from "lucide-react";
import TokenUsage from "./token-usage";
import {
  updateChatTitle,
  updateChatBookmark,
  getFavoritMessages,
} from "../actions";
import { toast } from "sonner";
import FavoriteMessagesModal from "./chat-favorite-messages";

interface ChatHeaderProps {
  onHistoryClick: () => void;
  onAssistantListClick: () => void;
  scrollToMessage: (messageId: string) => void;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  assistantName: string;
  assistantIdentifier: string;
  chatData: {
    id: string;
    title: string;
    bookmark?: boolean;
    status?: string;
    createdAt?: string;
  };
  chatId: string;
  chatTitle?: string;
}

const ChatHeader = memo(
  ({
    onHistoryClick,
    onAssistantListClick,
    scrollToMessage,
    usage,
    assistantName,
    assistantIdentifier,
    chatData,
    chatId,
    chatTitle,
  }: ChatHeaderProps) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [showFavoriteMessages, setShowFavoriteMessages] = useState(false);
    const [favoriteMessages, setFavoriteMessages] = useState([]);
    const [isLoadingFavoriteMessages, setIsLoadingFavoriteMessages] =
      useState(false);

    //TODO: move chat history to this component

    const handleUpdateTitle = async () => {
      if (!chatId || !editedTitle.trim()) return;
      try {
        await updateChatTitle(chatId, editedTitle);
        setIsEditingTitle(false);
        setNewTitle(editedTitle);
        toast.success("Chat title updated");
      } catch (error) {
        console.error("Error updating chat title:", error);
        toast.error("Failed to update chat title");
      }
    };

    const handleChatBookmark = async () => {
      if (!chatId) return;
      try {
        await updateChatBookmark(chatData.id, !chatData?.bookmark);
        toast.success(
          chatData?.bookmark ? "Bookmark removed" : "Chat bookmarked"
        );
      } catch (error) {
        console.error("Error updating bookmark:", error);
        toast.error("Failed to update bookmark");
      }
    };

    const loadBookmarkedMessages = async () => {
      if (!chatId) return;
      setIsLoadingFavoriteMessages(true);
      try {
        const result = await getFavoritMessages(chatData.id);
        if (result.success) {
          setFavoriteMessages(result.data);
        }
      } catch (error) {
        console.error("Error loading bookmarked messages:", error);
        toast.error("Failed to load bookmarked messages");
      } finally {
        setIsLoadingFavoriteMessages(false);
      }
    };

    return (
      <header className="flex flex-col px-4 py-0 md:py-2 border-b">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <Bot className="w-6 h-6 text-gray-500" />
            <div>
              <h1 className="text-xl font-semibold">
                {assistantName
                  ? decodeURIComponent(assistantName)
                  : "Assistant"}
              </h1>
              {chatTitle && (
                <div className="flex items-center gap-2 mt-2">
                  {!isEditingTitle ? (
                    <p>{newTitle || chatTitle}</p>
                  ) : (
                    <Input
                      type="text"
                      value={
                        isEditingTitle
                          ? editedTitle
                          : newTitle
                          ? newTitle
                          : chatTitle
                      }
                      className={`px-1 py-0 h-7 border-0 w-fit max-w-[50%] ${
                        isEditingTitle ? "border border-primary" : ""
                      }`}
                      readOnly={!isEditingTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onFocus={() => {
                        if (isEditingTitle && !editedTitle && chatTitle) {
                          setEditedTitle(newTitle ? newTitle : chatData.title);
                        }
                      }}
                    />
                  )}

                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Check
                        className="w-5 h-5 cursor-pointer"
                        onClick={handleUpdateTitle}
                      />
                      <X
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => {
                          setIsEditingTitle(false);
                          setEditedTitle("");
                        }}
                      />
                    </div>
                  ) : (
                    <Edit
                      className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setEditedTitle(newTitle || chatTitle || "");
                      }}
                    />
                  )}
                  <Bookmark
                    className={`w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary ${
                      chatData?.bookmark ? "fill-primary text-primary" : ""
                    }`}
                    onClick={handleChatBookmark}
                  />
                </div>
              )}
            </div>
            <TokenUsage usage={usage} />
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/agentchat/${assistantIdentifier}`}>
              <Button variant="ghost" size="icon" aria-label="New chat">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="History"
              onClick={onHistoryClick}
            >
              <Clock className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bookmarks"
              onClick={() => {
                setShowFavoriteMessages(true);
                loadBookmarkedMessages();
              }}
            >
              <Star className={`w-5 h-5`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Assistants"
              onClick={onAssistantListClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <FavoriteMessagesModal
          open={showFavoriteMessages}
          onOpenChange={setShowFavoriteMessages}
          messages={favoriteMessages}
          onRefresh={loadBookmarkedMessages}
          scrollToMessage={scrollToMessage}
          isLoadingFavoriteMessages={isLoadingFavoriteMessages}
        />
      </header>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
export default ChatHeader;
