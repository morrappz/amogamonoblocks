/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  fetchMessages,
  getLatestMessages,
} from "@/app/(authenticated)/chat/lib/actions";
import { Latest } from "@/app/(authenticated)/chat/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, MessageCircle, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Chats = ({
  // messages,
  contacts,
  groups,
}: {
  // messages: any;
  contacts: any;
  groups: any[];
}) => {
  const [search, setSearch] = useState("");
  const [uniqueChats, setUniqueChats] = useState<any[]>([]);
  const [uniqueGroups, setUniqueGroups] = useState<any[]>([]);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        // Fetch both messages and latest messages in parallel
        const [messageResponse, latestResponse] = await Promise.all([
          fetchMessages(),
          getLatestMessages(),
        ]);
        setMessages(messageResponse);
        setLatestMessages(latestResponse);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessage();
  }, []); // Run only on mount

  useEffect(() => {
    const refreshMessages = async () => {
      try {
        const latestResponse = await getLatestMessages();
        if (latestResponse) {
          setLatestMessages(latestResponse);
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshMessages);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshMessages);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.user_catalog_id) return;

    const userSet = new Set();

    messages.forEach((msg: any) => {
      // Only add users that the current user has interacted with
      if (msg?.sender_id === session?.user?.user_catalog_id) {
        // If current user is sender, add the receiver
        userSet.add(msg?.receiver_user_id);
      } else if (msg?.receiver_user_id == session?.user?.user_catalog_id) {
        // If current user is receiver, add the sender
        userSet.add(msg?.sender_id);
      }
    });

    setUniqueChats(Array.from(userSet));
  }, [messages, session]);

  const usersChat = contacts.filter((contact: any) =>
    uniqueChats.includes(contact.user_catalog_id)
  );

  const groupsChat = groups.filter((group: any) =>
    uniqueGroups.includes(group.chat_group_id)
  );

  useEffect(() => {
    if (!session?.user?.user_catalog_id || !groups.length) return;

    const groupsSet = new Set();

    // Add groups where the user is the creator
    groups.forEach((group: any) => {
      if (group.created_user_id == session?.user?.user_catalog_id) {
        groupsSet.add(group.chat_group_id);
      }
    });

    // Add groups where the user is a member
    groups.forEach((group: any) => {
      if (
        group.chat_group_users_json?.some(
          (user: any) =>
            user.user_id == session?.user?.user_catalog_id ||
            user.user_catalog_id == session?.user?.user_catalog_id
        )
      ) {
        groupsSet.add(group.chat_group_id);
      }
    });

    // Also add groups from messages (as before)
    messages.forEach((msg: any) => {
      if (msg?.receiver_group_name) {
        groupsSet.add(msg?.receiver_group_name);
      }
    });

    setUniqueGroups(Array.from(groupsSet));
  }, [messages, groups, session]);

  // Function to get the latest message for a user
  const getLatestMessage = (userId: string) => {
    // Find all messages between current user and the given user
    const userMessages = latestMessages.filter(
      (msg: any) =>
        (msg.sender_id == session?.user?.user_catalog_id &&
          msg.receiver_id == userId) ||
        (msg.receiver_id == session?.user?.user_catalog_id &&
          msg.sender_id == userId)
    );

    // If no messages, return undefined
    if (userMessages.length === 0) return undefined;

    // Sort by created_datetime (newest first)
    return userMessages.reduce((latest: Latest, current: Latest) => {
      return new Date(current.created_datetime).getTime() >
        new Date(latest.created_datetime).getTime()
        ? current
        : latest;
    }, userMessages[0]);
  };

  // Function to get the latest group message
  const getLatestGroupMessage = (groupId: string) => {
    // Find all messages for this group
    const groupMessages = latestMessages.filter(
      (msg: any) => msg.receiver_group_name == groupId
    );

    // If no messages, return undefined
    if (groupMessages.length === 0) return undefined;

    // Get the latest message using reduce
    return groupMessages.reduce((latest: Latest, current: Latest) => {
      return new Date(current.created_datetime).getTime() >
        new Date(latest.created_datetime).getTime()
        ? current
        : latest;
    }, groupMessages[0]);
  };

  // Function to format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  // Sort chats by latest message timestamp (newest first)
  const sortedChats = [...usersChat].sort((a, b) => {
    const latestMsgA = getLatestMessage(a.user_catalog_id);
    const latestMsgB = getLatestMessage(b.user_catalog_id);

    const timeA = latestMsgA
      ? new Date(latestMsgA.created_datetime).getTime()
      : 0;
    const timeB = latestMsgB
      ? new Date(latestMsgB.created_datetime).getTime()
      : 0;

    return timeB - timeA; // Descending order (newest first)
  });

  const sortedGroupsChat = [...groupsChat].sort((a, b) => {
    const latestMsgA = getLatestGroupMessage(a.chat_group_id);
    const latestMsgB = getLatestGroupMessage(b.chat_group_id);

    const timeA = latestMsgA
      ? new Date(latestMsgA.created_datetime).getTime()
      : 0;
    const timeB = latestMsgB
      ? new Date(latestMsgB.created_datetime).getTime()
      : 0;

    return timeB - timeA; // Descending order (newest first)
  });

  return (
    <div>
      <div className="border flex items-center rounded-md pl-4 mt-5">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="border-0"
        />
      </div>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      )}
      <Tabs defaultValue="direct-chat" className="mt-5 w-full">
        <TabsList
          defaultValue="direct-chat"
          className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground"
        >
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="direct-chat"
          >
            Direct Chat
          </TabsTrigger>
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="group-chat"
          >
            Group Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="direct-chat">
          <div className="mt-5 space-y-5">
            {sortedChats.map((user: any) => {
              const latestMsg = getLatestMessage(user.user_catalog_id);

              return (
                <Card key={user.user_catalog_id}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex pt-2.5 items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.profile_pic_url} />
                        <AvatarFallback>
                          {user.first_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      {latestMsg
                        ? formatDate(latestMsg.created_datetime)
                        : "No messages yet"}
                    </p>

                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-sm text-gray-600 truncate w-[80%]">
                        {latestMsg ? latestMsg.chat_message : "No messages yet"}
                      </p>
                      <Link
                        href={`/chat/contacts/messages/${user.user_catalog_id}`}
                      >
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="group-chat">
          <div className="mt-5 space-y-5">
            {sortedGroupsChat.map((group: any) => {
              const latestMsg = getLatestGroupMessage(group.chat_group_id);

              return (
                <Card key={group.chat_group_id}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex pt-2.5 items-center gap-2">
                      <Avatar>
                        {/* <AvatarImage src={group.chat_group_name} /> */}
                        <AvatarFallback>
                          {group.chat_group_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">
                        {group.chat_group_name}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      {latestMsg
                        ? formatDate(latestMsg.created_datetime)
                        : "No messages yet"}
                    </p>

                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-sm text-gray-600 truncate w-[80%]">
                        {latestMsg ? latestMsg.chat_message : "No messages yet"}
                      </p>
                      <Link
                        href={`/chat/groups/messages/${group.chat_group_id}`}
                      >
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chats;
