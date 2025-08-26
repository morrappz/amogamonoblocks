import React, { useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Text } from '../elements/Text';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import LucideIcon from '../LucideIcon';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { Message } from '@/database/model';
import { useAuth } from '@/context/supabase-provider';
import { forwardMessage } from '@/database/chatService';
import { useOnlineStatus } from '@/context/online-status';
import ChatListItemVirtual from './ChatListItemVirtual';
import ChatListItem from './ChatListItem';
import { P } from '../elements/Typography';
import { Avatar, AvatarFallback, AvatarImage } from '../elements/Avatar';

interface Props {
    messageToForward: Message;
    onClose: () => void;
    currentUserId: string;
    chatGroups: any[];
    users: any[];
}

function MessageForwarderComponent({ messageToForward, onClose, currentUserId, chatGroups, users }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const [isForwarding, setIsForwarding] = useState(false);
    const { isOnline } = useOnlineStatus();

    const mergedChats = useMemo(() => {
        // This logic is copied directly from your ChatList component
        const knownUserIds = new Set<string>();
        const formatted = chatGroups.map(g => {
            let userIds: string[] = [];
            try {
                userIds = JSON.parse(g.chatGroupUsersJson || '[]').map((u: any) => String(u.id));
            } catch (e) { /* ignore */ }
            userIds.forEach(uid => knownUserIds.add(uid));
            let groupName = g.chatGroupName || 'Private Chat';
            if (!g.chatGroupName && userIds.length === 2) {
                const otherUserId = userIds.find(uid => uid !== String(currentUserId));
                const otherUser = users.find(u => String(u.id) === String(otherUserId));
                if (otherUser) {
                    groupName = `${otherUser.firstName} ${otherUser.lastName || ''}`.trim();
                }
            }
            return { isVirtual: false, id: g.id, chatGroupName: groupName, chatGroup: g };
        });

        const pseudoChats = users
            .filter(u => String(u.id) !== currentUserId && !knownUserIds.has(String(u.id)))
            .map(u => ({ isVirtual: true, id: `virtual-${u.id}`, chatGroupName: `${u.firstName} ${u.lastName || ''}`.trim(), user: u }));

        return [...formatted, ...pseudoChats].sort((a, b) => (a.chatGroupName > b.chatGroupName ? 1 : -1));
    }, [chatGroups, users, currentUserId]);

    const filteredChats = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return mergedChats;
        return mergedChats.filter(c => c.chatGroupName?.toLowerCase().includes(query));
    }, [mergedChats, searchQuery]);

    const handleToggleSelection = (chatId: string) => {
        setSelectedChats(prev =>
            prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
        );
    };

    const handleSend = async () => {
        if (selectedChats.length === 0 || !isOnline) return;
        setIsForwarding(true);
        try {
            await forwardMessage(messageToForward, selectedChats, currentUserId);
            onClose();
        } catch (e) {
            console.error("Failed to forward message:", e);
            // Optionally show an error to the user
        } finally {
            setIsForwarding(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedChats.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => handleToggleSelection(item.id)}
                className={`flex-row items-center p-3 ${isSelected ? 'bg-blue-50' : 'bg-white'}   ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
            >
                {/* <View className="mr-4">
          {isSelected ? <CheckCircle2 size={16} color="#3b82f6" /> : <Circle size={16} color="#d1d5db" />}
        </View> */}
                <View className="flex-1">
                    {item.isVirtual ? (
                        <ChatListItemVirtual user={item.user} chatGroupName={item.chatGroupName} isOnline={undefined} />
                    ) : (
                        <>
                            <View className="flex flex-row items-start justify-between">
                                <View className="flex flex-row items-center">
                                    <Avatar alt={item.chatGroupName} className="size-10 rounded-full">
                                        <AvatarImage
                                            source={{
                                                uri: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                                            }}
                                        />
                                        <AvatarFallback>
                                            <Text>{(item.chatGroupName || "fname")?.slice(0, 2)}</Text>
                                        </AvatarFallback>
                                    </Avatar>
                                    <View className='ml-3'>
                                        <Text className="font-medium text-lg text-primary">{item.chatGroupName} {" "} {item.isOnline && <Text className=' text-green-600'>•</Text>}</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white absolute top-0 left-0 right-0 bottom-0 z-50">
            <View className="flex-row items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <Button onPress={onClose} variant="ghost" size="icon">
                    <ArrowLeft size={16} color="#374151" />
                </Button>
                <View>
                    <Text className="text-lg font-bold text-primary">Forward to...</Text>
                    {selectedChats.length > 0 && (
                        <Text className="text-sm text-center text-gray-500">{selectedChats.length} selected</Text>
                    )}
                </View>
                <Button
                    onPress={handleSend}
                    disabled={selectedChats.length === 0 || isForwarding || !isOnline}
                    variant="default"
                >
                    {isForwarding ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Send</Text>}
                </Button>
            </View>
            <View className="p-3">
                <Input
                    placeholder="Search for people or groups"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="pl-4 pr-8 h-12 text-base"
                />
            </View>
            <FlatList
                data={filteredChats}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text className="text-center mt-8 text-gray-500">No chats found</Text>}
            />
        </View>
    );
}


// Enhance the component with data from WatermelonDB
const enhance = withObservables([], ({ database }) => ({
    chatGroups: database.get('chat_group').query().observe(),
    users: database.get('user_catalog').query().observe(),
}));

const MessageForwarder = withDatabase(enhance(MessageForwarderComponent));

export default MessageForwarder;