import { Q } from '@nozbe/watermelondb';
import { database } from '.';
import { combineLatest, map, switchMap } from 'rxjs';
import * as Crypto from 'expo-crypto';
import { ChatGroup, Message, UserCatalog } from './model';
import { supabase } from "@/config/supabase";
import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system';
import { sync } from './sync';

function base64ToBlob(base64: string, mime: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mime });
}

export async function uploadAttachmentToSupabase(localPath: string, fileName: string, contentType: string): Promise<string> {
  try {
    let fileBlob: any;
    if (Platform.OS === 'web') {
      fileBlob = base64ToBlob(localPath, contentType);
    } else {
      // const base64 = await FileSystem.readAsStringAsync(localPath, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
      // const dataUri = `data:${contentType};base64,${base64}`;

      const response = await fetch(localPath);
      fileBlob = await response.arrayBuffer();
    }
    console.log("filedata", fileBlob, fileName, contentType);

    const { data, error } = await supabase.storage
      .from("chat-attachments") // <-- change to your storage bucket name
      .upload(`uploads/${Date.now()}-${fileName}`, fileBlob, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase
      .storage
      .from("chat-attachments")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  } catch (err: any) {
    console.error("📦 Upload error:", err.message);
    return "";
  }
}

export async function createNewChatWith(userId: string, currentUserID: string, db = database): Promise<string> {
  const chatIdentifier = generateDeterministicChatId(userId, currentUserID);

  try {
    const existing = await database.get<ChatGroup>('chat_group').query(Q.where('chat_identifier', chatIdentifier)).fetch();
    if (existing.length > 0) {
      return existing[0].id;
    }
  } catch { }

  const newChat = await db.write(async () => {
    return await db.get('chat_group').create((chat: ChatGroup) => {
      chat._raw.id = Crypto.randomUUID();
      chat.chatIdentifier = chatIdentifier;
      chat.isGroup = false;
      chat.createdUserId = currentUserID;
      chat.chatGroupUsersJson = JSON.stringify([{ id: currentUserID }, { id: userId }]);
      chat.createdAt = new Date();
      chat.updatedAt = new Date();
      chat.lastMessageCreatedAt = Date.now();
    });
  });

  return newChat.id;
}

// generateDeterministicChatId(userId1: bigint, userId2: bigint)
export function generateDeterministicChatId(a: string | number | bigint, b: string | number | bigint) {
  const [low, high] = [BigInt(a), BigInt(b)].sort((x, y) => (x < y ? -1 : 1));
  return `chat_${low}_${high}`;
}

// generateGroupChatId()
export function generateGroupChatId() {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export const forwardMessage = async (
  messageToForward: Message,
  targetChatIds: string[],
  currentUserId: string,
) => {
  await database.write(async () => {
    const now = new Date();
    const timestamp = now.getTime();

    for (const targetId of targetChatIds) {
      let chatGroupId = targetId;
      let targetChat: ChatGroup;

      // If it's a virtual chat ID, we need to create the chat first
      if (targetId.startsWith('virtual-')) {
        console.log("create new group chat for virtual ID", targetId);
        const otherUserId = targetId.replace('virtual-', '');
        const newChatId = await createNewChatWith(otherUserId, currentUserId);
        chatGroupId = newChatId;
      }

      try {
        targetChat = await database.get<ChatGroup>('chat_group').find(chatGroupId);
        const newMessage = await database.get<Message>('messages').create((message: Message) => {
          message._raw.id = Crypto.randomUUID();
          message.groupId = targetChat.id;
          message.senderId = currentUserId;
          message.content = messageToForward?.content;
          message.messageType = messageToForward?.messageType;
          message.isForwarded = true;
          message.forwardedMessageId = messageToForward.id; // Link to original
          message.status = 'sent';
          message.createdAt = now;
          message.updatedAt = now;
          // Copy attachment info
          message.fileUpload = messageToForward?.fileUpload;
        });
        console.log(`Message forwarded to chat ${targetChat.id} (${targetChat.chatIdentifier})`);
        // Update the chat group with last message details
        if (targetChat)
          await targetChat.update(cg => {
            // cg.lastMessageId = newMessage.id;
            // cg.lastMessagePreview = newMessage.content || 'Attachment';
            // cg.lastMessageTimestamp = newMessage.timestamp;
            cg.lastMessageCreatedAt = new Date().getTime();
          });

      } catch (error) {
        console.error(`Failed to forward message to chat ${chatGroupId}:`, error);
      }
    }
  });

  // Optionally trigger a sync
  await sync();
  console.log(`Message forwarded to ${targetChatIds.length} chats.`);
};