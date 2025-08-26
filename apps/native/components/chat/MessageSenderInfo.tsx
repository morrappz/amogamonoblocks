// Add these imports at the top
import { withObservables } from "@nozbe/watermelondb/react";
import { ChatGroup, Message, UserCatalog } from "@/database/types"; // Make sure UserCatalog is imported
import { FlatList, View } from "react-native";
import { Text } from "../elements/Text";
import { Avatar, AvatarFallback, AvatarImage } from "../elements/Avatar";
import { map, of } from "@nozbe/watermelondb/utils/rx";
import { Q } from "@nozbe/watermelondb";
// ... all your other imports

// --- 1. THE PRESENTATIONAL COMPONENT ---
// This component is "dumb". It just receives props and renders them.
// It expects to receive both the `message` and the resolved `sender`.
const MessageItem = ({ message, sender }: { message: Message; sender?: UserCatalog }) => {
    // We can render a placeholder/skeleton while the related sender is being fetched.
    if (!sender) {
        return (
            <View className="flex flex-row items-start justify-between mb-3">
                <View className="flex flex-row items-start gap-3">
                    <View className="size-8 android:size-12 rounded-full bg-gray-200" />
                    <View className="flex flex-col gap-1 pt-1">
                        <View className="h-5 w-24 bg-gray-200 rounded" />
                        <View className="h-4 w-32 bg-gray-200 rounded" />
                    </View>
                </View>
            </View>
        );
    }

    // Once the sender is loaded, use its data.
    const displayName = `${sender?.firstName} ${sender?.lastName || ''}`.trim();
    const fallbackInitials = `${sender?.firstName?.[0] || ''}${sender?.lastName?.[0] || ''}`.toUpperCase();
    const avatarUrl = sender?.avatarUrl || sender?.avatarLocalPath; // Prioritize remote URL

    return (
        <View className="flex flex-row items-start justify-between mb-3">
            <View className="flex flex-row items-start gap-3">
                <Avatar alt={displayName} className="size-10 android:size-12 rounded-full">
                    <AvatarImage source={{ uri: avatarUrl }} />
                    <AvatarFallback>
                        <Text>{fallbackInitials}</Text>
                    </AvatarFallback>
                </Avatar>
                <View>
                    <Text className="font-medium text-lg text-primary">{displayName}</Text>
                    <Text className="text-sm text-primary/60">{message?.createdAt?.toDateString()} at {message?.createdAt?.toTimeString().split(" ")[0]}</Text>
                </View>
            </View>
        </View>
    );
};

// --- 2. THE HOC TO FETCH DATA FOR THE ITEM ---
// This HOC will take a `message` prop and provide the related `sender` prop.
const enhance = withObservables(['message'], ({ message }: { message: Message }) => {
    if (!message.senderId) {
        return { sender: of(null) };
    }

    // Manually query the user_catalog table.
    // This will return an observable of an array: UserCatalog[]
    const senderQuery = message.collections.get('user_catalog').query(
        Q.where('id', message.senderId),
        Q.take(1) // We only expect one user
    ).observe();

    return {
        // Use the 'map' operator to transform the array result.
        // If the array has a user in it, pass that user.
        // If the array is empty (user not found), pass null.
        sender: senderQuery.pipe(
            map(users => (users.length > 0 ? users[0] : null))
        )
    };
});

// --- 3. THE FINAL, ENHANCED COMPONENT ---
// This is the component we will actually use in our FlatList.
export const MessageSenderInfo = enhance(MessageItem);