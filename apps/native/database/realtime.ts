import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { Message } from './model';
import { database } from '.';
import { usePathname, useRouter } from 'expo-router';

export function useRealtimeChat(userId: string | null, setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>> | undefined = undefined) {
    const pathname = usePathname();
    const router = useRouter()

    useEffect(() => {
        if (!userId) return;

        // --- 1. Realtime Sync ---
        const chatChannel = supabase
            .channel('chat-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message',
                },
                async (payload) => {
                    const { eventType, new: newRecord }: { eventType: "INSERT" | "UPDATE" | "DELETE"; new: Record<string, any> } = payload;
                    if (payload && newRecord?.chat_message_type && newRecord?.chat_message_type === "APP_NOTIFICATION" && String(newRecord.receiver_user_id) === String(userId)) {
                        console.log("resived notification", pathname)
                        if (pathname === '/notifications') {
                            router.push('/notifications');
                        }
                        return
                    }

                    if (newRecord?.chat_message_type !== "text" && newRecord?.chat_message_type !== "file") return

                    console.log('📥 New message event:', payload);

                    if (eventType === 'INSERT' || eventType === 'UPDATE' && String(newRecord.created_user_id) !== String(userId)) {
                        await database.write(async () => {
                            let existing;
                            try {
                                existing = await database.get<Message>('messages').find(String(newRecord.id));
                            } catch (err) {
                                console.warn('message not found, will create it:', err);
                            }
                            if (existing) {
                                await existing.update((msg: Message) => {
                                    msg.groupId = String(newRecord.group_id);
                                    msg.senderId = String(newRecord.created_user_id);
                                    msg.senderName = String(newRecord.created_user_name);
                                    msg.content = newRecord.content;
                                    msg.createdAt = new Date(newRecord.created_at + "Z");
                                    msg.updatedAt = new Date(newRecord.updated_at + "Z");
                                    msg.messageType = newRecord.chat_message_type ?? 'text';
                                    msg.status = 'sent';
                                    msg.attachmentUrl = newRecord.attachment_url || '';
                                    msg.attachmentName = newRecord.attachment_name || '';
                                    msg.attachmentType = newRecord.attachment_type || '';
                                });
                            } else {
                                await database.get<Message>('messages').create((msg: Message) => {
                                    msg._raw.id = String(newRecord.id); // Make sure IDs match
                                    msg.groupId = String(newRecord.group_id);
                                    msg.senderId = String(newRecord.created_user_id);
                                    msg.senderName = String(newRecord.created_user_name)
                                    msg.content = newRecord.content;
                                    msg.createdAt = new Date(newRecord.created_at + "Z");
                                    msg.updatedAt = new Date(newRecord.updated_at + "Z");
                                    msg.messageType = newRecord.chat_message_type ?? 'text';
                                    msg.status = 'sent';
                                    msg.attachmentUrl = newRecord.attachment_url || '';
                                    msg.attachmentName = newRecord.attachment_name || '';
                                    msg.attachmentType = newRecord.attachment_type || '';
                                });
                            }
                        });
                    } else {
                        console.log('Ignoring message event for user:', userId);
                    }

                    if (eventType === 'DELETE') {
                        await database.write(async () => {
                            const existing = await database.get<Message>('messages').find(String(newRecord.id));
                            await existing.markAsDeleted(); // Soft delete
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_group',
                },
                async (payload) => {
                    console.log('📥 Chat group event:', payload);
                    const { eventType, new: newRecord } = payload;

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        await database.write(async () => {
                            let chatGroup;
                            try {
                                chatGroup = await database.get('chat_group').find(String(newRecord.id));
                            } catch (err) {
                                console.warn('Chat group not found, will create it:', err);
                            }

                            if (chatGroup) {
                                await chatGroup.update((cg) => {
                                    cg.chatGroupName = newRecord.chat_group_name;
                                    cg.isGroup = newRecord.is_group;
                                    cg.isPublic = newRecord.is_public;
                                    cg.forBusinessName = newRecord.for_business_name;
                                    cg.forBusinessNumber = newRecord.for_business_number;
                                    cg.businessNumber = newRecord.business_number;
                                    cg.businessName = newRecord.business_name;
                                    cg.chatGroupUsersJson = JSON.stringify(newRecord.chat_group_users_json || []);
                                    if (newRecord.last_message_created_at)
                                        cg.lastMessageCreatedAt = new Date(newRecord.last_message_created_at + "Z");
                                });
                            } else {
                                await database.get('chat_group').create((cg) => {
                                    cg._raw.id = String(newRecord.id);
                                    cg.chatIdentifier = newRecord.chat_identifier;
                                    cg.chatGroupName = newRecord.chat_group_name;
                                    cg.isGroup = newRecord.is_group;
                                    cg.isPublic = newRecord.is_public;
                                    cg.forBusinessName = newRecord.for_business_name;
                                    cg.forBusinessNumber = newRecord.for_business_number;
                                    cg.businessNumber = newRecord.business_number;
                                    cg.businessName = newRecord.business_name;
                                    cg.chatGroupUsersJson = JSON.stringify(newRecord.chat_group_users_json || []);
                                    if (newRecord.last_message_created_at)
                                        cg.lastMessageCreatedAt = new Date(newRecord.last_message_created_at + "Z");
                                    cg.createdAt = new Date(newRecord.created_at + "Z");
                                    cg.updatedAt = new Date(newRecord.updated_at + "Z");
                                });
                            }
                        });
                    }

                    if (eventType === 'DELETE') {
                        await database.write(async () => {
                            const chatGroup = await database.get('chat_group').find(String(newRecord.id));
                            await chatGroup.markAsDeleted(); // Soft delete
                        });
                    }
                }
            )
            .subscribe();

        // --- 2. Presence for online status ---
        const presenceChannel = supabase.channel('presence-room', {
            config: { presence: { key: userId } },
        });

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const usersOnline = Object.keys(presenceChannel.presenceState());
                if (setOnlineUsers && setOnlineUsers instanceof Function) {
                    setOnlineUsers(usersOnline);
                }
                console.log('🟢 Online users:', usersOnline);
            })
            .on('presence', { event: 'join' }, ({ key }) => {
                console.log(`✅ User joined: ${key}`);
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                console.log(`❌ User left: ${key}`);
            });

        presenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({ online_at: Date.now() });
            }
        });

        // --- Cleanup ---
        return () => {
            supabase.removeChannel(chatChannel);
            supabase.removeChannel(presenceChannel);
            if (setOnlineUsers) setOnlineUsers([]);
            console.log('🧹 Realtime channels cleaned up');
        };
    }, [userId]);
}
