import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import ChatListItem from './ChatListItem';
import { PressableCard } from '../elements/Card';
import { Input } from '../elements/Input';
import LucideIcon from '../LucideIcon';
import ChatListItemVirtual from './ChatListItemVirtual';
import { useOnlineStatus } from '@/context/online-status';
import { Button } from '../elements/Button';
import { database } from '@/database';
import { createNewChatWith } from '@/database/chatService';

const ChatList = ({ chatGroups, users, setSelectedChat, currentUserId, setSelectedScreen }) => {
    const [searchQueryRaw, setSearchQueryRaw] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { onlineUsers } = useOnlineStatus()

    const mergedChats = useMemo(() => {
        const knownUserIds = new Set<string>();

        const formatted = chatGroups.map(g => {
            let userIds: string[] = [];
            let isOnline: boolean = false

            try {
                userIds = JSON.parse(g.chatGroupUsersJson || '[]').map((u: any) => String(u.id));
            } catch (e) {
                console.warn('Invalid JSON in chatGroupUsersJson:', g.chatGroupUsersJson);
            }

            userIds.forEach(uid => knownUserIds.add(uid));

            let groupName = g.chatGroupName || 'Private Chat';

            if ((!g.chatGroupName || g.chatGroupName.trim() === '') && userIds.length === 2) {
                const otherUserId = userIds.find(uid => uid !== String(currentUserId));
                const otherUser = users.find(u => String(u.id) === String(otherUserId));

                // console.log("otherUserId", currentUserId, userIds, otherUserId, otherUser, users)
                if (otherUser) {
                    groupName = `${otherUser.firstName} ${otherUser.lastName || ''}`.trim();
                }
                if (onlineUsers.includes(String(otherUserId))) {
                    isOnline = true
                }
            }

            return {
                isVirtual: false,
                id: g.id,
                chatGroupName: groupName,
                isOnline,
                chatGroup: g, // <-- important: keep WatermelonDB model
            };
        });

        const pseudoChats = users
            .filter(u => !knownUserIds.has(String(u.id)))
            .map(u => ({
                isVirtual: true,
                id: `virtual-${u.id}`,
                chatGroupName: `${u.firstName} ${u.lastName || ''}`.trim(),
                user: u,
            }));

        const allChats = [...formatted, ...pseudoChats];
        // return allChats;

        allChats.sort((a, b) => {
            const aTime = a.isVirtual
                ? new Date(a.user.createdAt || 0).getTime()
                : a.chatGroup.lastMessageCreatedAt || 0;

            const bTime = b.isVirtual
                ? new Date(b.user.createdAt || 0).getTime()
                : b.chatGroup.lastMessageCreatedAt || 0;
            if (!b.isVirtual)
                console.log("bbb", b.chatGroup?.lastMessageCreatedAt)
            return bTime - aTime;
        });

        return allChats;
    }, [chatGroups, users, currentUserId]);

    const filteredChats = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return mergedChats.filter(c =>
            c.chatGroupName?.toLowerCase().includes(query)
        );
    }, [mergedChats, searchQuery]);

    const handleSelect = async (chat: any) => {
        if (chat.isVirtual) {
            // 🔧 Create new chat here
            console.log("neww chat")
            const newChatId = await createNewChatWith(chat.user.id, currentUserId)
            console.log("newChatId", newChatId)
            setSelectedChat(newChatId);
        } else {
            setSelectedChat(chat.id);
        }
    };

    return (
        <View className="flex-1">
            <View className="flex flex-row w-full justify-between items-center p-3 border-b">
                {/* <Button onPress={sync} ><Text>SYNC</Text></Button> */}
                {/* <Button onPress={async () => {
                        const users = await database.get('user_catalog').query().fetch()
                        console.log("user_catalog", users)
                        const user = await database.get('user_catalog').find("319")
                        console.log("###user_catalog", user)
                    }} ><Text>get users</Text></Button> */}
                {/* <Button onPress={async () => {
                        // const users = await database.get('messages').query().fetch()
                        // console.log("messages", users)
                        const messages = await database.get('messages').query().fetch();
                        console.log(messages.map(m => ({ id: m.id, c_at: m.createdAt, u_at: m.updatedAt, group_id: m.groupId, seender_id: m.senderId, content: m.content })));
                        console.log("mesages count", messages.length)
                    }} ><Text>get message</Text></Button> */}
                {/* <Button onPress={async () => {
                    const users = await database.get('chat_group').query().fetch()
                    console.log("chat_group", users)
                }} ><Text>get groups</Text></Button> */}
                <View className="relative flex-1">
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`pl-8 pr-8 h-12 text-base `}
                    />
                    <View className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8">
                        <Text>
                            <LucideIcon name="Search" size={22} />
                        </Text>
                    </View>
                </View>
                <Button variant="ghost" size="icon" onPress={() => setSelectedScreen("group-cu")} className="p-2 ml-2">
                    <LucideIcon name="Users" />
                </Button>
            </View>
            <ScrollView className="flex-1 p-2 mb-3">
                {filteredChats.map((chat) => (
                    <PressableCard
                        key={chat.id}
                        className="flex flex-col mb-1 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        onPress={() => handleSelect(chat)}
                    >
                        <>
                            {chat.isVirtual ? (
                                <ChatListItemVirtual user={chat.user} chatGroupName={chat.chatGroupName} isOnline={chat.isOnline} />
                            ) : (
                                <View className='min-h-36'><ChatListItem chatGroup={chat.chatGroup} chatGroupName={chat.chatGroupName} isOnline={chat.isOnline} /></View>
                            )}
                        </>
                    </PressableCard>
                ))}
                {/* <FlatList
                data={sortedGroups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatListItem chatGroup={item} />}
                ListEmptyComponent={<Text>No chats yet</Text>}
            /> */}
            </ScrollView>
        </View >
    );
};

const enhance = withObservables(["currentUserId"], ({ database }) => ({
    chatGroups: database.get('chat_group').query().observeWithColumns(['last_message_created_at']),
    users: database.get('user_catalog').query().observeWithColumns(['first_name', 'last_name']),
}));

// 💡 Enhance the component, then export a wrapper that accepts props like `setSelectedChat`
const EnhancedChatList = withDatabase(enhance(ChatList));

export default EnhancedChatList;