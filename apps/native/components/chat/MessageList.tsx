import { useDatabase, withObservables } from "@nozbe/watermelondb/react";
import { FlatList, ScrollView, View, Image, ActivityIndicator } from "react-native";
import { Text } from "../elements/Text";
import { Button } from "../elements/Button";
import LucideIcon from "../LucideIcon";
import { Avatar, AvatarFallback, AvatarImage } from "../elements/Avatar";
import { useEffect, useRef, useState } from "react";
import { P } from "../elements/Typography";
import Svg, { Path } from "react-native-svg";
import { Download, Eye } from "lucide-react-native";
import { Q } from "@nozbe/watermelondb";
import { MessageSenderInfo } from "./MessageSenderInfo";
import MessageAttachmentPreview from "./MessageAttachmentPreview";
import ReplyPreview from "./ReplyPreview";
import { ChatGroup, Message } from "@/database/model";
import { database } from "@/database";
import * as Clipboard from 'expo-clipboard';
import { toast } from "sonner-native";

interface FormField {
    id: string
    type: "text" | "email" | "phone" | "select" | "textarea"
    label: string
    placeholder?: string
    required: boolean
    options?: string[]
    question?: string
}

interface ChatForm {
    id: string
    title: string
    description: string
    fields: FormField[]
    isActive: boolean
}

const PAGE_SIZE = 20;

function MessageList({ chatGroup: selectedChat, messages: newMessages, page, setPage, searchQuery, userSession, onForwardMessage, onSetReply }: {
    chatGroup: ChatGroup[];
    messages: Message[];
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    userSession: any;
    searchQuery: string;
    onForwardMessage: (message: Message) => void;
    onSetReply: (message: Message | null) => void;
}) {
    const messagesEndRef = useRef(null)
    const scrollViewRef = useRef(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setMessages([]);
        setPage(1);
        setHasMore(true);
    }, [searchQuery]);

    // 👇 Append newMessages on page change
    useEffect(() => {
        if (page === 1) {
            setMessages(newMessages); // first page, reset
        } else {
            setMessages((prev) => [...prev, ...newMessages]);
        }

        if (newMessages.length < PAGE_SIZE) {
            setHasMore(false); // no more to fetch
        }
    }, [newMessages]);


    const [conversationalForms, setConversationalForms] = useState<{
        [key: string]: { form: ChatForm; currentFieldIndex: number; responses: { [key: string]: string } }
    }>({})

    const handleQuickReply = (reply: string, chatId: string) => {
        // Send user's quick reply as a message
        const userMessage = {
            id: Date.now().toString(),
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sender: "You",
            avatar: "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg?height=32&width=32&text=Y",
            isFavorite: false,
            isImportant: false,
        }

        // setMessages((prev) => ({
        //     ...prev,
        //     [chatId]: [...(prev[chatId] || []), userMessage],
        // }))

        // Generate bot response
        // handleBotInteraction(reply, chatId)
    }

    const handleMessageAction = async (action: "copy" | "reply" | "forward" | "important", message: Message) => {
        console.log("handleMessageAction:", action);
        if (action === "copy") {
            await Clipboard.setStringAsync(message.content || '');
            toast.info("Message copied to clipboard");
        } else if (action === "forward") {
            onForwardMessage(message); // <-- THIS IS THE KEY CHANGE
        } else if (action === "reply") {
            onSetReply(message);
        } else if (action === "important") {
            await database.write(async () => {
                await message.update(msg => {
                    msg.important = !msg.important;
                });
            });
        }
    }

    const detectVideoUrl = (text: string) => {
        const videoUrlPatterns = [
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
            /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i,
        ]

        for (const pattern of videoUrlPatterns) {
            const match = text.match(pattern)
            if (match) {
                if (pattern.source.includes("youtube")) {
                    return { type: "youtube", id: match[1], url: text }
                } else if (pattern.source.includes("vimeo")) {
                    return { type: "vimeo", id: match[1], url: text }
                } else {
                    return { type: "direct", url: text }
                }
            }
        }
        return null
    }

    // return (
    //     <FlatList
    //         data={messages}
    //         renderItem={({ item }) => (
    //             <View style={{ padding: 8 }}>
    //                 <Text>{item.text}</Text>
    //             </View>
    //         )}
    //         keyExtractor={(item, index) => index.toString()}
    //         inverted
    //         contentContainerStyle={{ padding: 16 }}
    //     />
    // );

    // return (
    //     <FlatList
    //         data={messages}
    //         keyExtractor={(item) => item.id}
    //         renderItem={renderItem}
    //         contentContainerStyle={{ padding: 8 }}
    //     />
    // );
    return (
        // <ScrollView ref={scrollViewRef} className="flex-1 p-4 space-y-4" showsVerticalScrollIndicator={true}>
        <FlatList
            data={messages}
            renderItem={({ item: message }: { item: Message }) => (
                <View key={message?.id} className="flex flex-col mb-6">
                    <View className="flex flex-row items-start justify-between">
                        <MessageSenderInfo message={message} />
                        {/* <View className="flex flex-col">
                            <Text>created user id {String(message.senderId)}</Text>
                            <Avatar alt={message?.senderId} className="size-8 android:size-12 rounded-full mb-2">
                                <AvatarImage
                                    source={{
                                        uri: message?.attachmentUrl || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg",
                                    }}
                                />
                                <AvatarFallback>
                                    <Text>{(message?.senderName || "fname")?.slice(0, 2)}</Text>
                                </AvatarFallback>
                            </Avatar>
                            <View>
                                <Text className="font-medium text-lg text-primary">{message?.senderName}</Text>
                                <Text className="text-sm text-primary/60">{message?.createdAt?.toDateString()} at {message?.createdAt?.toTimeString().split(" ")[0]}</Text>
                            </View>
                        </View> */}
                        <View className="flex flex-col items-end gap-1">
                            {/* <Text className="text-gray-400">•</Text> */}
                        </View>
                    </View>

                    {/* Message Content */}
                    <View className="ml-0 mb-4">
                        {message.replyToMessageId && (
                            <View className="mb-2 rounded-md overflow-hidden">
                                <ReplyPreview messageId={message.replyToMessageId} />
                            </View>
                        )}
                        {/* Regular Message */}
                        {message?.content && !message?.attachmentUrl && (
                            <View>
                                <P className="text-sm text-gray-800 leading-normal">{(message?.content || "")}</P>
                                {(() => {
                                    const videoInfo = detectVideoUrl(message?.content)
                                    if (videoInfo) {
                                        return (
                                            <View className="mt-2 w-full">
                                                {videoInfo.type === "youtube" && (
                                                    <iframe
                                                        width="100%"
                                                        height="200"
                                                        src={`https://www.youtube.com/embed/${videoInfo.id}`}
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        className="rounded-md"
                                                    />
                                                )}
                                                {videoInfo.type === "vimeo" && (
                                                    <iframe
                                                        width="100%"
                                                        height="200"
                                                        src={`https://player.vimeo.com/video/${videoInfo.id}`}
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        className="rounded-md"
                                                    />
                                                )}
                                                {videoInfo.type === "direct" && (
                                                    <video width="100%" height="200" controls className="rounded-md">
                                                        <source src={videoInfo.url} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                            </View>
                                        )
                                    }
                                    return null
                                })()}
                            </View>
                        )}

                        {message.fileUpload && message.fileUpload.length > 0 && (
                            <MessageAttachmentPreview files={message.fileUpload} offline={true} />
                        )}
                        {/* File Display */}
                        {/* {message?.attachmentUrl && (
                            <View>
                                <Text>attachmentUrl : {message.attachmentUrl}</Text>
                                {message?.fileType === "multiple" ? (
                                    <View className="w-full">
                                        <View className="text-left space-y-2">
                                            {JSON.parse(message?.fileName || "[]").map((file: any, index: number) => (
                                                <View key={index}>
                                                    {file.type.startsWith("audio/") ? (
                                                        <View className="flex items-center justify-between p-3 bg-gray-100 rounded-md w-full">
                                                            <View className="flex-1 min-w-0 pr-3">
                                                                <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                <View className="text-sm text-gray-500">
                                                                    {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                </View>
                                                            </View>
                                                            <View className="flex items-center gap-3 flex-shrink-0">
                                                                <Button
                                                                    onPress={() => {
                                                                        try {
                                                                            const audio = new Audio(file.url)
                                                                            audio.play().catch((error) => {
                                                                                console.error("Error playing audio:", error)
                                                                            })
                                                                        } catch (error) {
                                                                            console.error("Error creating audio:", error)
                                                                        }
                                                                    }}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <Svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                                        <Path d="M8 5v14l11-7z" />
                                                                    </Svg>
                                                                </Button>
                                                                <Button
                                                                    onPress={() => {
                                                                        const link = document.createElement("a")
                                                                        link.href = file.url
                                                                        link.download = file.name
                                                                        link.click()
                                                                    }}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </View>
                                                        </View>
                                                    ) : file.type.startsWith("image/") ? (
                                                        <View className="w-full mb-2">
                                                            <Image
                                                                src={file.url || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                                                alt={file.name}
                                                                className="w-full h-auto rounded-md max-h-64 object-cover mb-2"
                                                            />
                                                            <View className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                                                <View className="flex-1 min-w-0 pr-3">
                                                                    <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                    <View className="text-sm text-gray-500">
                                                                        {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                    </View>
                                                                </View>
                                                                <View className="flex items-center gap-3 flex-shrink-0">
                                                                    <Button
                                                                        onPress={() => window.open(file.url, "_blank")}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        onPress={() => {
                                                                            const link = document.createElement("a")
                                                                            link.href = file.url
                                                                            link.download = file.name
                                                                            link.click()
                                                                        }}
                                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ) : (
                                                        <View className="flex items-center justify-between p-3 bg-gray-100 rounded-md w-full">
                                                            <View className="flex-1 min-w-0 pr-3">
                                                                <View className="text-sm font-medium text-primary truncate">{file.name}</View>
                                                                <View className="text-sm text-gray-500">
                                                                    {file.type} • {(file.size / 1024).toFixed(1)} KB
                                                                </View>
                                                            </View>
                                                            <View className="flex items-center gap-3 flex-shrink-0">
                                                                <Button
                                                                    onPress={() => window.open(file.url, "_blank")}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    onPress={() => {
                                                                        const link = document.createElement("a")
                                                                        link.href = file.url
                                                                        link.download = file.name
                                                                        link.click()
                                                                    }}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ) : message?.fileType?.startsWith("audio/") ? (
                                    <View className="max-w-xs">
                                        <View className="text-left">
                                            <View className="text-sm font-normal text-primary mb-2">{message?.fileName}</View>
                                            <View className="flex items-center gap-3">
                                                <Button
                                                    onPress={() => {
                                                        try {
                                                            if (message?.fileUrl) {
                                                                const audio = new Audio(message?.fileUrl)
                                                                audio.play().catch((error) => {
                                                                    console.error("Error playing audio:", error)
                                                                })
                                                            }
                                                        } catch (error) {
                                                            console.error("Error creating audio:", error)
                                                        }
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <Path d="M8 5v14l11-7z" />
                                                    </Svg>
                                                </Button>
                                                <Button
                                                    onPress={() => {
                                                        const link = document.createElement("a")
                                                        link.href = message?.fileUrl!
                                                        link.download = message?.fileName!
                                                        link.click()
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </View>
                                        </View>
                                    </View>
                                ) : message?.fileType?.startsWith("image/") ? (
                                    <View className="w-full">
                                        <Image
                                            src={message?.fileUrl || "https://kzmg7z31oykfx6ggk11t.lite.vusercontent.net/placeholder.svg"}
                                            alt={message?.fileName}
                                            className="w-full h-auto rounded-md max-h-64 object-cover mb-2"
                                        />
                                        <View className="text-left">
                                            <View className="text-sm font-medium text-primary mb-2">{message?.fileName}</View>
                                            <View className="flex items-center gap-3">
                                                <Button
                                                    onPress={() => window.open(message?.fileUrl, "_blank")}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onPress={() => {
                                                        const link = document.createElement("a")
                                                        link.href = message?.fileUrl!
                                                        link.download = message?.fileName!
                                                        link.click()
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="max-w-xs">
                                        <View className="text-left">
                                            <View className="text-sm font-normal text-primary mb-2">{message?.fileName}</View>
                                            <View className="flex items-center gap-3">
                                                <Button
                                                    onPress={() => {
                                                        if (message?.fileUrl) {
                                                            window.open(message?.fileUrl, "_blank")
                                                        }
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onPress={() => {
                                                        const link = document.createElement("a")
                                                        link.href = message?.fileUrl!
                                                        link.download = message?.fileName!
                                                        link.click()
                                                    }}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )} */}

                        {/* Product Cards Display */}
                        {message?.messageType === "products" && message?.products && (
                            <View className="ml-0 mb-4">
                                <View className="grid gap-4">
                                    {message?.products.map((product) => (
                                        //   <ProductCard
                                        //     key={product.id}
                                        //     product={product}
                                        //     onAddToCart={handleAddToCart}
                                        //     onViewDetails={handleViewProductDetails}
                                        //     onToggleWishlist={handleToggleWishlist}
                                        //     isInWishlist={wishlist.includes(product.id)}
                                        //   />
                                        <Text>produccts</Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {selectedChat && conversationalForms[selectedChat] && (
                        <View className="ml-0 mb-4">
                            {/* <ConversationalForm
                                            form={conversationalForms[selectedChat].form}
                                            currentFieldIndex={conversationalForms[selectedChat].currentFieldIndex}
                                            responses={conversationalForms[selectedChat].responses}
                                            onFieldSubmit={(fieldId, value, isComplete) =>
                                                handleFieldSubmit(selectedChat, fieldId, value, isComplete)
                                            }
                                            onCancel={() => {
                                                setConversationalForms((prev) => {
                                                const newForms = { ...prev }
                                                delete newForms[selectedChat]
                                                return newForms
                                                })
                                            }}
                                            /> */}
                            <Text>ConversationalForm</Text>
                        </View>
                    )}

                    {/* Quick Replies */}
                    {message?.senderId !== userSession.user_catalog_id && (selectedChat === "4" || selectedChat === "5") && (
                        <View className="ml-0 mb-4">
                            <View className="flex flex-row flex-wrap gap-2">
                                {selectedChat === "4"
                                    ? ["Ask question", "Contact form", "Support hours", "Help"].map((reply) => (
                                        <Button
                                            key={reply}
                                            variant="outline"
                                            size="sm"
                                            onPress={() => handleQuickReply(reply, selectedChat)}
                                            className="text-xs px-3 py-1 h-auto bg-white hover:bg-gray-50 border-gray-300"
                                        >
                                            <Text className="text-primary/70">{reply}</Text>
                                        </Button>
                                    ))
                                    : ["Show products", "Browse electronics", "View cart", "Help"].map((reply) => (
                                        <Button
                                            key={reply}
                                            variant="outline"
                                            size="sm"
                                            onPress={() => handleQuickReply(reply, selectedChat)}
                                            className="text-xs px-3 py-1 h-auto bg-white hover:bg-gray-50 border-gray-300"
                                        >
                                            <Text className="text-primary/70">{reply}</Text>
                                        </Button>
                                    ))}
                            </View>
                        </View>
                    )}

                    {/* Action Buttons - back outside message box */}
                    <View className="flex flex-row items-center gap-4 ml-0 text-sm text-gray-400">
                        <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("copy", message)}>
                            <LucideIcon className="size-4 android:size-7 text-primary/35" name="MessagesSquare" size={22} />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("reply", message)}>
                            <LucideIcon className="size-4 android:size-7 text-primary/35" name="Reply" size={22} />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-gray-600" onPress={() => handleMessageAction("forward", message)}>
                            <LucideIcon className="size-4 android:size-7 text-primary/35" name="Forward" size={22} />
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            className={`hover:text-gray-600 ${message?.important ? "text-yellow-500" : ""}`}
                            onPress={() => handleMessageAction("important", message)}
                        >
                            <LucideIcon className={`size-4 android:size-7 ${message?.important ? "text-yellow-500" : " text-primary/35"}`} name="Star" size={22} />
                        </Button>
                        {/* <Button
                            variant="ghost" size="icon"
                            className={`hover:text-gray-600 ${message?.isImportant ? "text-red-500" : ""}`}
                            onPress={() => toggleImportant(message?.id)}
                        >
                            <LucideIcon className="size-4 android:size-7 text-primary/35" name="CirclePlus" size={22} />
                        </Button> */}
                    </View>
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            inverted
            contentContainerStyle={{ padding: 16 }}
            className="flex-1 h-full space-y-4"
            onEndReached={() => {
                if (hasMore) setPage((prev) => prev + 1);
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={hasMore ? <ActivityIndicator size="small" /> : null}

        />
        /* <View ref={messagesEndRef} /> */
        // </ScrollView>
    )
}

export default withObservables(['chatGroup', 'searchQuery', 'page'], ({ chatGroup, searchQuery, page }) => {
    const offset = (page - 1) * PAGE_SIZE;

    const baseQuery = chatGroup.collections
        .get('messages')
        .query(
            Q.where('group_id', chatGroup.id),
            ...(searchQuery?.trim()
                ? [Q.where('content', Q.like(`%${Q.sanitizeLikeString(searchQuery.toLowerCase())}%`))]
                : []),
            Q.sortBy('created_at', Q.desc),
            Q.skip(offset),
            Q.take(PAGE_SIZE)
        ).observeWithColumns(['important'])
    // .observe();

    // const messagesWithLoading$ = new Observable(subscriber => {
    //     subscriber.next({ messages: [], loading: true }); // loading start
    //     const sub = messages$.subscribe(data => {
    //         subscriber.next({ messages: data, loading: false }); // loading end
    //     });
    //     return () => sub.unsubscribe();
    // });

    // return {
    //     messagesWithLoading: messagesWithLoading$,
    // };
    return ({
        messages: baseQuery, // You can define a `.messages` lazy relation
    })
})(MessageList);
