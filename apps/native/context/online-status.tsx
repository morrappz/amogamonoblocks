import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { addNetworkStateListener, getNetworkStateAsync, NetworkState } from 'expo-network';
import { sync } from '@/database/sync';
import { toast } from 'sonner-native';
import { useRealtimeChat } from '@/database/realtime';
import { useAuth } from './supabase-provider';
import { useDatabase } from '@nozbe/watermelondb/react';
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync';

type OnlineStatusContextType = {
    isOnline: boolean;
    onlineUsers: string[]
};

const OnlineStatusContext = createContext<OnlineStatusContextType>({
    isOnline: true,
    onlineUsers: []
});

export const OnlineStatusProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const wasOffline = useRef(false);
    const { session, userCatalog } = useAuth()
    const database = useDatabase()
    useRealtimeChat(userCatalog?.user_catalog_id ? String(userCatalog.user_catalog_id) : null, setOnlineUsers);

    // === Live Network Listener ===
    useEffect(() => {
        const subscription = addNetworkStateListener(
            ({ isConnected, isInternetReachable }: NetworkState) => {
                const connected = Boolean(isConnected && isInternetReachable);
                setIsOnline(connected);

                if (!connected) {
                    wasOffline.current = true;
                    console.log('📴 Went offline');
                    toast.error("Went offline")
                } else if (wasOffline.current) {
                    console.log('📶 Reconnected — syncing...');
                    toast.success('Reconnected — syncing...')
                    sync(); // Trigger sync on reconnect
                    wasOffline.current = false;
                }
            }
        );

        return () => subscription.remove();
    }, []);

    // === Manual Initial Sync (on mount) ===
    useEffect(() => {
        // hasUnsyncedChanges({ database }).then((res) => {
        //     if (res) sync()
        // })
        sync()
    }, [database])

    // === Periodic Fallback Sync (in case listener missed it) ===
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const net = await getNetworkStateAsync();
                const connected = Boolean(net.isConnected && net.isInternetReachable);

                if (connected) {
                    const hasChanges = await hasUnsyncedChanges({ database });
                    if (hasChanges) {
                        console.log('🔁 Periodic sync triggered...');
                        sync();
                    }
                }
            } catch (err) {
                console.warn('🔌 Error checking periodic sync status:', err);
            }
        }, 300000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [database]);

    return (
        <OnlineStatusContext.Provider value={{ isOnline, onlineUsers }}>
            {children}
        </OnlineStatusContext.Provider>
    );
};

export const useOnlineStatus = () => useContext(OnlineStatusContext);
