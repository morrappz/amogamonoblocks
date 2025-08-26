import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { Text } from '../elements/Text';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { ChatGroup, UserCatalog } from '@/database/model';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import * as Crypto from 'expo-crypto';
import { sync } from '@/database/sync';
import { useOnlineStatus } from '@/context/online-status';

interface Props {
  currentUserId: string;
  currentUserEmail: string;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  setSelectedScreen: (screen: string | null) => void;
}

export default function GroupEditor({ currentUserId, currentUserEmail, selectedChat, setSelectedChat, setSelectedScreen }: Props) {
  const [loading, setLoading] = useState(true);
  const [existingGroup, setExistingGroup] = useState<ChatGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<UserCatalog[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserCatalog[]>([]);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // const allUsers = await database.get<UserCatalog>('user_catalog').query().fetch();
      const otherUsers = await database
        .get<UserCatalog>('user_catalog')
        .query(Q.where('id', Q.notEq(currentUserId)))
        .fetch();

      setUsers(otherUsers);


      if (selectedChat) {
        try {
          const group: ChatGroup = await database.get<ChatGroup>('chat_group').find(selectedChat);
          setExistingGroup(group);
          setName(group.chatGroupName || '');
          setDescription(group.description || '');
          const parsedUsers = JSON.parse(group.chatGroupUsersJson || '[]');
          const selected = otherUsers.filter(u => parsedUsers.some(p => p.id === u.id));
          setSelectedUsers(selected);
        } catch (e) {
          console.error('Error loading existing group', e);
        }
      }

      setLoading(false);
    };
    load();
  }, [selectedChat]);

  const handleToggleUser = (user: UserCatalog) => {
    setSelectedUsers(prev =>
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleSubmit = async () => {
    const now = new Date();
    const groupId = existingGroup?.id || Crypto.randomUUID();
    const groupIdentifier = existingGroup?.chatIdentifier || `group_${name.trim()}`;

    const allSelected = [
      ...selectedUsers,
      ...([{ id: currentUserId, userEmail: currentUserEmail, role: 'admin' }])
    ];

    const uniqueUsers = allSelected.reduce((acc, user) => {
      if (!acc.find(u => u.id === user.id)) acc.push(user as any);
      return acc;
    }, [] as UserCatalog[]);

    await database.write(async () => {
      if (existingGroup) {
        await existingGroup.update(group => {
          group.chatGroupName = name.trim();
          // group.description = description.trim();
          group.chatGroupUsersJson = JSON.stringify(
            uniqueUsers.map(u => ({ id: u.id, email: u.userEmail, role: (u as any).role || 'member' }))
          );
          group.updatedAt = now;
        });
      } else {
        await database.get<ChatGroup>('chat_group').create((group: ChatGroup) => {
          group._raw.id = groupId;
          group.chatIdentifier = groupIdentifier;
          group.chatGroupName = name.trim();
          // group.description = description.trim();
          group.chatGroupUsersJson = JSON.stringify(
            uniqueUsers.map(u => ({ id: u.id, email: u.userEmail, role: (u as any).role || 'member' }))
          );
          group.createdAt = now;
          group.updatedAt = now;
          group.isGroup = true;
        });
      }
    });

    setSelectedScreen(null);

    if (isOnline) {
      await sync()
      console.log('Group saved and synced successfully');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-sm text-gray-500">Loading group...</Text>
      </View>
    );
  }

  if (showUserSelection) {
    return (
      <View className="flex-1 bg-background px-4">
        <View className="flex-row items-center py-3">
          <Button onPress={() => setShowUserSelection(false)} variant="ghost">
            <ArrowLeft />
          </Button>
          <Text className="text-lg font-bold ml-2">Select Users</Text>
          <Button onPress={() => setShowUserSelection(false)} className="ml-auto">
            <Text>Done ({selectedUsers.length})</Text>
          </Button>
        </View>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.some(u => u.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => handleToggleUser(item)}
                className={`flex-row items-center p-4 rounded-md ${isSelected ? 'bg-blue-100' : ''}`}
              >
                <Image
                  source={{ uri: item.avatarUrl || 'https://placehold.co/40x40' }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <View className="ml-3 flex-1">
                  <Text className={`font-medium ${isSelected ? 'text-blue-700' : ''}`}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.userEmail}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4">
      <View className="flex-row items-center py-3">
        <Button onPress={() => setSelectedScreen(null)} variant="ghost">
          <ArrowLeft />
        </Button>
        <Text className="text-lg font-bold ml-2">{existingGroup ? 'Edit Group' : 'Create Group'}</Text>
        <Button onPress={handleSubmit} className="ml-auto">
          <Text>Save</Text>
        </Button>
      </View>

      <View className="mt-4">
        <View className="my-2 space-y-1">
          <Label>Group Name</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter group name"
          />
        </View>

        <View className="my-2 space-y-1">
          <Label>Description (optional)</Label>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Enter group description"
            multiline
          />
        </View>

        <View className="my-2 space-y-1">
          <Label>Users</Label>
          <Button
            onPress={() => setShowUserSelection(true)}
            className="flex-row items-center gap-2"
            variant="outline"
          >
            <UserPlus className="h-4 w-4" />
            <Text>Add Users ({selectedUsers.length})</Text>
          </Button>
        </View>

        {selectedUsers.length > 0 && (
          <View className="mt-3 space-y-2">
            {selectedUsers.map((user) => (
              <View key={user.id} className="flex-row items-center justify-between p-2 py-3 bg-gray-100 rounded-md">
                <Text className="text-sm">{user.firstName} {user.lastName}</Text>
                <TouchableOpacity onPress={() => handleToggleUser(user)}>
                  <Text className="text-red-500 text-sm">Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
