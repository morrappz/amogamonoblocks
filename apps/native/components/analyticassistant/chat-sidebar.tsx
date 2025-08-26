import { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '@/lib/globalAnalyticAssistantStore';
import { useAuth } from '@/context/supabase-provider';
import { Text } from '@/components/elements/Text';
// import { PlusCircle } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from 'expo-router';
import { expoFetchWithAuth, generateAPIUrl } from '@/lib/utils';
import { Trash2 } from 'lucide-react-native';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../elements/alert-dialog';

// Make sure your Chat type is defined somewhere, e.g., in a schema file
// export type Chat = { id: string; title: string | null; created_at: string };

export const ChatSidebar = ({ closeDrawer }: { closeDrawer: () => void }) => {
  const { session } = useAuth();
  const {
    chats,
    isChatsLoading,
    fetchChats, // Use the fetch function from the store
    setChatId,
    chatId,
    removeChat
  } = useStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);

  // Fetch chats when the component mounts or session changes
  useEffect(() => {
    if (session) {
      fetchChats(session);
    }
  }, [session, fetchChats]);

  const handleSelectChat = (id: string) => {
    // Navigate to the selected chat route
    router.push(`/analyticassistant/${id}`);
    closeDrawer();
  };

  const handleNewChat = () => {
    // Navigate to the dedicated "new chat" route
    router.push('/analyticassistant/new');
    closeDrawer();
  };

  const handleDeleteChat = (id: string, title: string) => {
    setChatToDelete({ id, title });
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    const { id } = chatToDelete;
    setDeletingId(id);

    try {
      const res = await expoFetchWithAuth(session)(
        generateAPIUrl(`/api/analyticassistant/chats?id=${id}`),
        { method: 'DELETE' }
      );

      if (res.ok) {
        removeChat(id);
        if (chatId?.id === id) {
          router.push('/analyticassistant/new');
        }
      } else {
        const errorData = await res.json();
        console.warn("Delete error:", errorData);
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeletingId(null);
      setChatToDelete(null); // close the dialog
    }
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <View className={`flex-row items-center rounded-lg mb-2 ${item.id === chatId?.id ? 'bg-accent' : 'bg-card'}`}>
      <TouchableOpacity
        onPress={() => handleSelectChat(item.id)}
        className={`flex-1 p-3 rounded-l-lg transition-colors`}
      >
        <Text
          className={`font-semibold text-sm truncate ${item.id === chatId?.id ? 'text-accent-foreground' : 'text-card-foreground'}`}
          numberOfLines={1}
        >
          {item.title || 'Untitled Conversation'}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDeleteChat(item.id, item.title)}
        className="p-3"
        disabled={deletingId === item.id}
      >
        {deletingId === item.id ? (
          <ActivityIndicator size="small" />
        ) : (
          <Trash2 size={16} className="text-destructive" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-2 bg-background border-r border-border">
      {/* Header with New Chat Button */}
      <View className="p-2 mb-4">
        <TouchableOpacity
          onPress={handleNewChat}
          className="flex-row items-center justify-center p-3 bg-primary rounded-lg shadow"
        >
          {/* <PlusCircle size={16} className="text-primary-foreground mr-2" /> */}
          <Text className="text-primary-foreground font-bold">New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {isChatsLoading && !chats.length ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlashList
          data={chats}
          extraData={chatId?.id}
          keyExtractor={(item: any) => item.id}
          renderItem={renderChatItem}
          estimatedItemSize={60}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="text-muted-foreground">No chats yet.</Text>
            </View>
          }
        />
      )}

      {chatToDelete && (
        <AlertDialog open onOpenChange={(open) => !open && setChatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <Text className="font-semibold">{chatToDelete.title || 'this chat'}</Text>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onPress={() => setChatToDelete(null)}>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={confirmDeleteChat} disabled={deletingId === chatToDelete.id}>
                <Text>
                  {deletingId === chatToDelete.id ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "Delete"
                  )}
                </Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </View>
  );
};