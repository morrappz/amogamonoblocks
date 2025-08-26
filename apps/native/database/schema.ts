import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const userCatalogSchema = tableSchema({
  name: 'user_catalog',
  columns: [
    { name: 'user_catalog_id', type: 'number' }, // stringified BIGINT
    { name: 'first_name', type: 'string' },
    { name: 'last_name', type: 'string', isOptional: true },
    { name: 'user_email', type: 'string', isOptional: true },
    { name: 'user_mobile', type: 'string', isOptional: true },
    { name: 'user_status', type: 'string', isOptional: true },
    { name: 'user_status', type: 'string', isOptional: true },
    { name: 'avatar_local_path', type: 'string', isOptional: true }, // NEW: offline image
    { name: 'avatar_url', type: 'string', isOptional: true }, // remote image if synced
    { name: 'for_business_name', type: 'string', isOptional: true },
    { name: 'for_business_number', type: 'string', isOptional: true },
    { name: 'business_number', type: 'string', isOptional: true },
    { name: 'business_name', type: 'string', isOptional: true },
    { name: 'updated_at', type: 'number' },
    { name: 'created_at', type: 'number' }
  ]
});

export const chatGroupSchema = tableSchema({
  name: 'chat_group',
  columns: [
    { name: 'chat_group_id', type: 'number' },
    { name: 'chat_identifier', type: 'string' },
    { name: 'chat_group_name', type: 'string', isOptional: true },
    { name: 'is_group', type: 'boolean' },
    { name: 'is_public', type: 'boolean', isOptional: true },
    { name: 'created_user_id', type: 'string' },
    { name: 'for_business_name', type: 'string', isOptional: true },
    { name: 'for_business_number', type: 'string', isOptional: true },
    { name: 'business_number', type: 'string', isOptional: true },
    { name: 'business_name', type: 'string', isOptional: true },
    { name: 'chat_group_users_json', type: 'string', isOptional: true },
    { name: 'updated_at', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'last_message_created_at', type: 'number', isOptional: true },
  ]
});

export const messageSchema = tableSchema({
  name: 'messages',
  columns: [
    { name: 'agentMsgId', type: 'number' },
    { name: 'chat_identifier', type: 'string' },
    { name: 'created_user_id', type: 'string' },
    { name: 'created_user_name', type: 'string' },
    { name: 'group_id', type: 'string' },
    { name: 'chat_message_type', type: 'string' },
    { name: 'content', type: 'string', isOptional: true },
    { name: 'attachment_local_path', type: 'string', isOptional: true }, // NEW: offline file
    { name: 'file_meta', type: 'string', isOptional: true },
    { name: 'status', type: 'string' },
    { name: 'is_forwarded', type: 'boolean', isOptional: true },
    { name: 'is_liked', type: 'boolean', isOptional: true },
    { name: 'important', type: 'boolean', isOptional: true },
    { name: 'forwarded_message_id', type: 'string', isOptional: true },
    { name: 'replied_to_message_id', type: 'string', isOptional: true }, // NEW: file upload metadata
    { name: 'file_upload_json', type: 'string', isOptional: true },
    { name: 'attachment_name', type: 'string', isOptional: true },
    { name: 'attachment_type', type: 'string', isOptional: true },
    { name: 'attachment_url', type: 'string', isOptional: true },
    { name: 'updated_at', type: 'number' },
    { name: 'created_at', type: 'number' }
  ]
});

export const schema = appSchema({
  version: 2,
  tables: [
    userCatalogSchema,
    chatGroupSchema,
    messageSchema
  ],
});
