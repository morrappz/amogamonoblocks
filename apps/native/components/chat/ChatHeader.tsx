import { useEffect, useMemo, useState } from "react";
import { TextInput, View, Image } from "react-native";
import { Button } from "../elements/Button";
import { Text } from "../elements/Text";
import { database } from "@/database";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../elements/DropdownMenu";
import { ArrowLeft, ImageIcon, Mic, MoreVertical, Paperclip, Smile } from "lucide-react-native";
import { Input } from "../elements/Input";
import LucideIcon from "../LucideIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatGroup, Message, UserCatalog } from "@/database/model"
import { Avatar, AvatarFallback, AvatarImage } from "../elements/Avatar";
import { H2, P } from "../elements/Typography";
import { Q } from "@nozbe/watermelondb";
import { useOnlineStatus } from "@/context/online-status";
// import * as Crypto from 'expo-crypto';

export default function ChatHeader({ chatGroup, userSession, setSelectedChat, setSelectedScreen, isGroupAdmin }: {
    chatGroup: ChatGroup;
    userSession: any; setSelectedChat: (id: string | null) => void;
    setSelectedScreen: (screen: string | null) => void;
    isGroupAdmin: boolean;
}) {
    const [newMessage, setNewMessage] = useState("")
    const [displayName, setDisplayName] = useState("Loading...");
    const [chatUsers, setChatUsers] = useState<UserCatalog[]>([]);
    const { onlineUsers } = useOnlineStatus()
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        const resolveDisplayName = async () => {
            if (chatGroup?.isGroup) {
                setDisplayName(chatGroup.chatGroupName ?? "Group Chat");
                const rawUsers = JSON.parse(chatGroup.chatGroupUsersJson ?? "[]");
                const userIds = rawUsers.map((u: { id: number }) => String(u.id));

                const matchedUsers = await database
                    .get<UserCatalog>('user_catalog')
                    .query(Q.where('id', Q.oneOf(userIds)))
                    .fetch();

                setChatUsers(matchedUsers);
            } else {
                const users = JSON.parse(chatGroup.chatGroupUsersJson ?? "[]");
                if (users.length === 2) {
                    const otherUser = users.find(
                        (u: { id: number }) => String(u.id) !== String(userSession.user_catalog_id)
                    );
                    if (otherUser) {
                        if (onlineUsers.includes(String(otherUser.id))) setIsOnline(true)
                        setChatUsers([otherUser])
                        const otherUserRecord = await database.get("user_catalog").find(String(otherUser.id));
                        if (otherUserRecord) {
                            setDisplayName(`${otherUserRecord.firstName || ""} ${otherUserRecord.lastName || ""}`);
                            return;
                        }
                    }
                    setDisplayName("Private Chat");
                }
            }
        };

        resolveDisplayName();
    }, [chatGroup, userSession]);

    return (
        <View className="flex flex-row items-center gap-3 p-4 border-b bg-gray-50">
            <View className="flex flex-row space-x-2">
                <Avatar alt={displayName || ""} className="size-11 rounded-full">
                    <AvatarImage
                        source={{
                            uri: chatGroup?.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                        }}
                    />
                    <AvatarFallback>
                        <Text>{(displayName || "fname").slice(0, 2)}</Text>
                    </AvatarFallback>
                </Avatar>
            </View>
            <View className="flex-1">
                <View className="flex flex-row items-center gap-2">
                    <H2 className="font-semibold text-primary text-sm">{displayName} {" "} {isOnline && <Text className=' text-green-600'>•</Text>}</H2>
                    {chatGroup?.isGroup && chatUsers && (
                        <View className="flex flex-row -space-x-1">
                            {chatUsers.slice(0, 4).map((member: UserCatalog, index) => (
                                <Image
                                    key={index}
                                    src={member.avatar || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    className="w-5 h-5 rounded-full border border-white"
                                />
                            ))}
                            {chatUsers.length > 4 && (
                                <Text className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                    +{chatUsers.length - 4}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
                {(chatGroup?.isGroup && chatUsers.length) ? <P className="text-xs text-gray-500">{chatUsers.length} members</P> : <></>}
            </View>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {chatGroup?.isGroup && isGroupAdmin && (
                        <DropdownMenuItem onPress={() => setSelectedScreen("group-cu")}>
                            <Text>Edit Group</Text>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem disabled onPress={() => setSelectedChat(null)}>
                        <Text>Leave Chat</Text>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onPress={() => setSelectedChat(null)}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </View>
    );
}
