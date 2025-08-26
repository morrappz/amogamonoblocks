import { useEffect, useMemo, useState } from "react";
import { Platform, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../elements/Button";
import { Text } from "../elements/Text";
import { database } from "@/database";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../elements/DropdownMenu";
import { ImageIcon, Mic, MoreVertical, Paperclip, Smile } from "lucide-react-native";
import { Input } from "../elements/Input";
import LucideIcon from "../LucideIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatGroup, Message } from "@/database/model"
import * as Crypto from 'expo-crypto';
import { useOnlineStatus } from "@/context/online-status";
import { sync } from "@/database/sync";
import ReplyPreview from "./ReplyPreview";


type MessageType = 'text' | 'image' | 'audio' | 'file' | 'video';

export default function MessageInput({ chatGroup, userSession, replyingToMessage, onSetReply }: {
    chatGroup: ChatGroup;
    userSession: any;
    replyingToMessage: Message | null;
    onSetReply: (message: Message | null) => void;
}) {
    const [newMessage, setNewMessage] = useState("")
    const [attachments, setAttachments] = useState<any[]>([]);

    const [stagedFiles, setStagedFiles] = useState<File[]>([])
    const { isOnline } = useOnlineStatus();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ base64: false });
        if (!result.canceled && result.assets.length > 0) {
            setAttachments(prev => [...prev, { ...result.assets[0], type: "image" }]);
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
        if (result.assets && result.assets.length > 0) {
            setAttachments(prev => [...prev, { ...result.assets[0], type: "file" }]);
        }
    };

    let otherUserID = useMemo(() => {
        const users = JSON.parse(chatGroup.chatGroupUsersJson ?? "[]")
        if (!chatGroup.isGroup && users.length === 2) {
            const otherUser = users.find((u: { id: number; }) => String(u.id) !== userSession.user_catalog_id);
            // console.log("otherUser u", users, otherUser)
            if (otherUser) {
                return String(otherUser.id)
            }
        }
        return null

    }, [chatGroup])

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const readWebFileAsBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const sendMessage = async () => {
        console.log("send message")
        if (!newMessage.trim() && attachments.length === 0) return;
        console.log("send message")
        const timestamp = Date.now();

        await database.write(async () => {
            await database.get<Message>('messages').create((message: Message) => {
                message._raw.id = Crypto.randomUUID();
                message.chatIdentifier = chatGroup.chatIdentifier;
                message.groupId = chatGroup.id;
                message.senderId = userSession.user_catalog_id;
                message.senderName = `${userSession?.first_name} ${userSession?.last_name}`
                message.status = 'sent';
                message.createdAt = new Date();
                message.updatedAt = new Date();

                if (replyingToMessage) {
                    message.replyToMessageId = replyingToMessage.id;
                }

                if (attachments.length > 0) {
                    const fileCount = attachments.length;
                    const filePlural = fileCount > 1 ? 's' : '';
                    // Use the text from the input if available, otherwise use a default message
                    message.content = newMessage.trim() || `${fileCount} attachment${filePlural} sent`;
                    message.messageType = 'file'; // Treat any message with attachments as a 'file' type

                    // Prepare the JSON data for the `fileUpload` field
                    message.fileUpload = attachments.map(att => {
                        const type = att.mimeType ?? 'application/octet-stream';
                        let chat_message_type: 'image' | 'file' | 'audio' | 'video' = 'file';
                        if (type.startsWith('image')) chat_message_type = 'image';
                        else if (type.startsWith('audio')) chat_message_type = 'audio'
                        else if (type.startsWith('video')) chat_message_type = 'video';

                        return {
                            attachmentName: att.name,
                            attachmentType: chat_message_type,
                            attachmentUrl: '',
                            attachmentLocalPath: att.uri,
                            attachmentMimeType: type,
                        }
                    });
                } else {
                    message.content = newMessage.trim();
                    message.messageType = 'text';
                }
            })

            await chatGroup.update((cg) => {
                cg.lastMessageCreatedAt = timestamp;
            });
        });

        setNewMessage("");
        setAttachments([]);
        onSetReply(null);

        if (isOnline) sync();
        console.log("sssync")
    };

    const createMessage = async (type: MessageType, content: string, attachmentName: string | undefined = undefined, attachmentType: string | undefined = undefined, attachmentLocalPath: string | undefined = undefined) => {
        await database.get<Message>('messages').create((message: Message) => {
            message._raw.id = Crypto.randomUUID();
            message.chatIdentifier = chatGroup.chatIdentifier;
            message.groupId = chatGroup.id;
            message.senderId = userSession.user_catalog_id;
            message.senderName = `${userSession?.first_name} ${userSession?.last_name}`
            message.messageType = type ?? 'text';
            message.content = content;
            message.status = 'sent';
            message.createdAt = new Date();
            message.updatedAt = new Date();
            if (attachmentName) {
                message.attachmentName = attachmentName
            }
            if (attachmentType) {
                message.attachmentType = attachmentType
            }
            if (attachmentLocalPath) {
                message.attachmentLocalPath = attachmentLocalPath || "nothing !!"
            }
            if (replyingToMessage) {
                message.replyToMessageId = replyingToMessage.id;
            }
        })
    };

    return (
        <View className="p-3">
            {replyingToMessage && (
                <View className="mb-2 p-2 bg-gray-100 rounded-lg">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <ReplyPreview messageId={replyingToMessage.id} />
                        </View>
                        <Button variant="ghost" size="icon" onPress={() => onSetReply(null)}><LucideIcon name="X" size={16} /></Button>
                    </View>
                </View>
            )}
            {attachments.length > 0 && (
                <View className="mb-3 border-t-2 pt-1">
                    <Text className="text-xs text-gray-500 mb-1">Attachments:</Text>
                    {attachments.map((file, idx) => (
                        <View key={idx} className="flex-row justify-between">
                            <Text className="truncate">{file.name || file.uri.split("/").pop()}</Text>
                            <Button variant="ghost" size="icon" onPress={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                                <Text>
                                    <LucideIcon name="X" size={22} />
                                </Text>
                            </Button>
                        </View>
                    ))}
                </View>
            )}
            <View className="relative">
                <DropdownMenu className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                            <MoreVertical className="h-3 w-3 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        insets={contentInsets}
                        className="w-64 native:w-72"
                    >
                        <DropdownMenuItem onPress={pickImage}>
                            <ImageIcon size={16} />
                            <Text>Send Images</Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem onPress={pickDocument}>
                            <Paperclip size={16} />
                            <Text>Files Message</Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem onPress={() => {
                            // Create a mock audio file for voice message
                            const audioBlob = new Blob(["mock audio data"], { type: "audio/wav" })
                            const audioFile = new File([audioBlob], "voice_message.wav", { type: "audio/wav" })
                            setStagedFiles((prev) => [...prev, audioFile])
                            // setShowMenu(false)
                        }}>
                            <Mic size={16} />
                            <Text>Voice Message</Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem onPress={() => {
                            setNewMessage(newMessage + "😊")
                            // setShowMenu(false)
                        }}>
                            <Smile className="h-4 w-4" />
                            <Text>Emoji</Text>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* <Button onPress={pickImage}> <Text>Image</Text> </Button>
                <Button onPress={pickDocument}><Text>File</Text></Button> */}
                {/* Send button on the right inside text box */}
                <View className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <Button
                        onPress={sendMessage}
                        variant={!newMessage.trim() && attachments.length === 0 ? "secondary" : "default"}
                        disabled={!newMessage.trim() && attachments.length === 0}
                        size="icon"
                        className="p-1.5 size-8 android:size-10 rounded-lg"
                    >
                        <LucideIcon className={`size-4 android:size-7 ${!newMessage.trim() && attachments.length === 0 ? "text-primary" : "text-primary-foreground"}`} name="SendHorizontal" size={22} />
                    </Button>
                </View>

                <Input
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    className="w-full border border-gray-300 rounded-md pl-10 pr-10 text-sm"
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            sendMessage()
                        }
                    }}
                />
            </View>
        </View>
    );
}
