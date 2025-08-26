import React from 'react';
import { View, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { of } from '@nozbe/watermelondb/utils/rx';
import { Q } from '@nozbe/watermelondb';
import { PressableCard } from '../elements/Card';
import { Button } from '../elements/Button';
import LucideIcon from '../LucideIcon';
import { Avatar, AvatarFallback, AvatarImage } from '../elements/Avatar';
import { P } from '../elements/Typography';
import { ChatGroup, Message, UserCatalog } from '@/database/model';
import { useRelativeTime } from '@/hooks/useRelativeTime';

const ChatListItem = ({ chatGroup, chatGroupName, isOnline, lastMessage, users }: {
    chatGroup: ChatGroup, chatGroupName: string, isOnline: boolean | undefined, lastMessage: Message[], users: UserCatalog[]
}) => {
    const latestMessage = lastMessage?.[0];
    const displayTime = latestMessage?.createdAt ? useRelativeTime(latestMessage.createdAt) : undefined;


    // if (!chatGroup.isGroup && users?.length === 2) {
    //     const otherUser = users.find(u => u.id !== String(currentUserId));
    //     if (otherUser) {
    //         chatGroupName = latestMessage.senderName;
    //     }
    // }

    const chat = {}
    return (
        <>
            <View className="flex flex-row items-start justify-between mb-3">
                <View className="flex flex-col">
                    <Avatar alt={chatGroupName} className="size-10 rounded-full mb-2">
                        <AvatarImage
                            source={{
                                uri: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                            }}
                        />
                        <AvatarFallback>
                            <Text>{(chatGroupName || "fname")?.slice(0, 2)}</Text>
                        </AvatarFallback>
                    </Avatar>
                    <View>
                        <Text className="font-medium text-lg text-primary">{chatGroupName}</Text>
                        <Text className="text-sm text-primary"> {latestMessage
                            ? displayTime
                            : ''}
                            {" "} {isOnline && <Text className=' text-green-600'>•</Text>}
                        </Text>
                    </View>
                </View>
                <View className="flex flex-col items-end gap-1">
                    {/* <Text className="font-medium text-lg text-primary/40">•</Text> */}
                </View>
            </View>

            {/* Message Content */}
            <View className="ml-0 mb-2">
                <P className="text-sm text-gray-800 leading-normal">{(latestMessage?.content)?.slice(0, 150) ?? 'No messages yet'}</P>
                {chatGroup.isGroup && <P className="text-xs text-gray-500 mt-1">{users?.length} members</P>}
            </View>

            {/* Action Buttons */}
            <View className="flex flex-row items-center gap-4 ml-0 text-sm text-gray-400">
                <Button
                    className="hover:text-gray-600"
                    size="icon"
                    variant="ghost"
                    onPress={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(latestMessage?.content ?? 'No messages yet')
                    }}
                >
                    <LucideIcon className="size-5 android:size-7 text-primary/35" name="MessagesSquare" size={22} />
                </Button>
                <Button
                    className={`hover:text-gray-600 ${chat.isFavorite ? "text-yellow-500" : ""}`}
                    size="icon"
                    variant="ghost"
                    onPress={(e) => {
                        e.stopPropagation()
                        // toggleChatFavorite(chat.id)
                    }}
                >
                    <LucideIcon className={`size-5 android:size-7 ${chat.isFavorite ? "fill-current text-yellow-500" : "text-primary/35"}`} name="Star" size={22} />
                </Button>
                <Button
                    className={`hover:text-gray-600 ${chat.isImportant ? "text-red-500" : ""}`}
                    size="icon"
                    variant="ghost"
                    onPress={(e) => {
                        e.stopPropagation()
                        // toggleChatImportant(chat.id)
                    }}
                >
                    <LucideIcon className={`size-5 android:size-7 ${chat.isImportant ? "fill-current text-red-500" : "text-primary/35"}`} name="CirclePlus" size={22} />
                </Button>
            </View>
        </>
    )
};

export function observeUsers(chatGroup: ChatGroup) {
    try {
        const userIds = JSON.parse(chatGroup.chatGroupUsersJson || '[]').map((u: any) => String(u.id));
        return chatGroup.collections
            .get('user_catalog')
            .query(Q.where('id', Q.oneOf(userIds)))
            .observe();
    } catch (e) {
        console.warn('Invalid JSON in chatGroupUsersJson', e);
        return of([]); // RxJS 'of' from 'rxjs'
    }
}

export default withObservables(['chatGroup', 'chatGroupName', 'isOnline'], ({ chatGroup }) => ({
    chatGroup,
    lastMessage: chatGroup.lastMessage,
    users: observeUsers(chatGroup),
}))(ChatListItem);
