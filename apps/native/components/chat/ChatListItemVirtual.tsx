// ChatListItemVirtual.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '../elements/Avatar';

const ChatListItemVirtual = ({ user, chatGroupName, isOnline }: { user: any, chatGroupName: string, isOnline: boolean | undefined }) => {
  return (
    <View className="flex flex-row items-center gap-3 p-2">
      <Avatar alt={chatGroupName} className="size-10 rounded-full">
        <AvatarImage source={{ uri: "https://placeholder.svg" }} />
        <AvatarFallback><Text>{chatGroupName.slice(0, 2)}</Text></AvatarFallback>
      </Avatar>
      <View>
        <Text className="text-lg font-medium">{chatGroupName}</Text>
        <Text className="text-sm text-gray-400">Start a conversation</Text>
      </View>
    </View>
  );
};

export default ChatListItemVirtual;
