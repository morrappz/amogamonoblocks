import { Model, Q, Relation } from '@nozbe/watermelondb';
import { field, children, relation, text, lazy, date, json } from '@nozbe/watermelondb/decorators';

export class UserCatalog extends Model {
  static table = 'user_catalog';

  @field('user_catalog_id') userCatalogId!: string;
  @field('first_name') firstName!: string;
  @field('last_name') lastName?: string;
  @field('user_email') userEmail?: string;
  @field('user_mobile') userMobile?: string;
  @field('user_name') userName!: string;
  @field('user_status') userStatus?: string;
  @field('avatar_local_path') avatarLocalPath?: string;
  @field('avatar_url') avatarUrl?: string;
}

const sanitizechatGroupUsers = (users: any[]) => {
  return Array.isArray(users) ? users : [];
}

export class ChatGroup extends Model {
  static table = 'chat_group';

  @field('chat_identifier') chatIdentifier!: string;
  @field('chat_group_name') chatGroupName?: string;
  @field('is_group') isGroup!: boolean;
  @field('created_user_id') createdUserId!: string;
  @field('last_message_id') lastMessageId?: string;
  @field('last_message_preview') lastMessagePreview?: string;
  @field('last_message_timestamp') lastMessageTimestamp?: number;
  @field('chat_group_users_json') chatGroupUsersJson?: string;
  @json('chat_group_users_json', sanitizechatGroupUsers) chatGroupUsers?: object[];
  @field('last_message_created_at') lastMessageCreatedAt!: number
  @date('updated_at') updatedAt!: Date;
  @date('created_at') createdAt!: Date;
  // @children('chat_group_user') members: any; // Type will be Collection<ChatGroupUser>
  // @has_many('messages', 'chat_identifier') messages;
  // @relation('messages', 'last_message_id') lastMessage: any; // Type will be Relation<Message>

  @lazy lastMessage = this.collections
    .get('messages')
    .query(
      Q.where('group_id', this.id),
      Q.sortBy('created_at', Q.desc),
      Q.take(1)
    )
    .observe();

  @lazy users = this.collections
    .get('user_catalog')
    .query(Q.where('id', Q.oneOf(
      JSON.parse(this.chatGroupUsersJson || '[]').map(u => u.id)
    )))
    .observe();

  @lazy messages = this.collections
    .get('messages')
    .query(Q.where('group_id', this.id), Q.sortBy('created_at', Q.desc))
    .observe();

  // @lazy
  // groupMembers = this.collections
  //   .get('user_catalog')
  //   .query(Q.on('chat_group_user', 'chat_identifier', this.chatIdentifier));

  @lazy groupLastMessage = this.collections
    .get('messages')
    .findAndObserve(this.lastMessageId);

  // Inside ChatGroup model:
  @lazy getLastMessage = this.collections
    .get('messages')
    .query(
      Q.where('group_id', this.id),
      Q.sortBy('created_at', Q.desc),
      Q.take(1)
    )
    .observe();

  getUsers = async () => {
    try {
      const json = this.chatGroupUsersJson ?? '[]';
      const userIds = JSON.parse(json).map((u: any) => u.id);
      return await this.collections
        .get('user_catalog')
        .query(Q.where('id', Q.oneOf(userIds)))
        .fetch();
    } catch (e) {
      console.warn('Failed to get users:', e);
      return [];
    }
  };
}

const sanitizefileUpload = (files: any[]) => {
  return Array.isArray(files) ? files : [];
}
export class Message extends Model {
  static table = 'messages';

  @field('chat_identifier') chatIdentifier!: string;
  @field('group_id') groupId!: string;
  @field('created_user_id') senderId!: string;
  @field('created_user_name') senderName?: string;
  @field('chat_message_type') messageType!: string;
  @field('content') content?: string;
  @field('file_meta') fileMeta?: string;
  @field('timestamp') timestamp!: number;
  @field('status') status!: string;
  @field('is_forwarded') isForwarded?: boolean;
  @field('is_liked') isLiked?: boolean;
  @field('important') important?: boolean;
  @field('forwarded_message_id') forwardedMessageId?: string;
  @field('replied_to_message_id') replyToMessageId?: string;
  @json('file_upload_json', sanitizefileUpload) fileUpload?: { attachmentName: string, attachmentMimeType: string, attachmentType: string, attachmentUrl: string }[];
  @field('attachment_name') attachmentName?: string;
  @field('attachment_type') attachmentType?: string;
  @field('attachment_url') attachmentUrl?: string;
  @field('attachment_local_path') attachmentLocalPath?: string;
  @date('updated_at') updatedAt!: Date;
  @date('created_at') createdAt!: Date;

  // @relation('chat_group', 'chat_identifier') chat: any; // Type will be Relation<ChatGroup>
  @relation('chat_group', 'group_id') chat: any; // Type will be Relation<ChatGroup>
  @relation('user_catalog', 'created_user_id') sender: Relation<UserCatalog>; // Type will be Relation<UserCatalog>
}
