import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { withDatabase, withObservables } from "@nozbe/watermelondb/react";
import { Database } from "@nozbe/watermelondb";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/context/supabase-provider";
import ChatHeader from "./ChatHeader";
import { ChatGroup, Message } from "@/database/model";
import { Input } from "../elements/Input";
import LucideIcon from "../LucideIcon";

type Props = {
  chatGroupId: string;
  database: Database; // this is what fixes the "database not exists" error
  setSelectedChat: (id: string) => void
};

function ChatScreen({
  chatGroup,
  setSelectedChat,
  setSelectedScreen,
  onForwardMessage,
  replyingToMessage,
  onSetReply
}: {
  chatGroup: ChatGroup;
  setSelectedChat: (id: string | null) => void;
  setSelectedScreen: (screen: string | null) => void;
  onForwardMessage: (message: Message) => void;
  replyingToMessage: Message | null;
  onSetReply: (message: Message | null) => void;
}) {
  if (!chatGroup) return null;
  const { session, userCatalog } = useAuth()
  const [searchQueryRaw, setSearchQueryRaw] = useState("");
  const [searchQuery, setSearchQuery] = useState("")
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchQuery(searchQueryRaw.trim());
    }, 300); // adjust this delay as needed
    return () => clearTimeout(delay);
  }, [searchQueryRaw]);

  useEffect(() => {
    if (chatGroup.isGroup && chatGroup.chatGroupUsers) {
      const userIds = (chatGroup.chatGroupUsers as any).filter((u: { id: string, role: string }) => u.role === 'admin').map((u: { id: string }) => u.id);
      setIsGroupAdmin(userIds.includes(String(userCatalog.user_catalog_id)));
    }
  }, [chatGroup, session]);

  return (
    <View className="flex flex-1 h-full justify-between">
      <View>
        <ChatHeader chatGroup={chatGroup} userSession={{ ...userCatalog, user_catalog_id: String(userCatalog.user_catalog_id) }} setSelectedChat={setSelectedChat} setSelectedScreen={setSelectedScreen} isGroupAdmin={isGroupAdmin} />
        <View className="p-3">
          <View className="relative">
            <Input
              placeholder="Search messages..."
              value={searchQueryRaw}
              onChangeText={setSearchQueryRaw}
              className={`pl-8 pr-8 h-12 text-base `}
            />
            <View className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8">
              <Text>
                <LucideIcon name="Search" size={22} />
              </Text>
            </View>
          </View>
        </View>
      </View>
      <MessageList
        chatGroup={chatGroup}
        userSession={{ ...userCatalog, user_catalog_id: String(userCatalog.user_catalog_id) }}
        searchQuery={searchQuery}
        page={page}
        setPage={setPage}
        onForwardMessage={onForwardMessage}
        onSetReply={onSetReply}
      />
      <MessageInput
        chatGroup={chatGroup}
        userSession={{ ...userCatalog, user_catalog_id: String(userCatalog.user_catalog_id) }}
        replyingToMessage={replyingToMessage}
        onSetReply={onSetReply} />
    </View>
  );
}

export default withDatabase(
  withObservables(["chatGroupId"], ({ database, chatGroupId, setSelectedChat }: Props) => ({
    chatGroup: database.get("chat_group").findAndObserve(chatGroupId),
  }))(ChatScreen)
);
