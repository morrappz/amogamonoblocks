export interface Message {
    id: string; // WatermelonDB string ID (can also be number depending on setup)
    agentMsgId: number;
    chat_identifier: string;
    created_user_id: string;
    created_user_name: string;
    senderId: string;
    senderName?: string;
    group_id: string;
    chat_message_type: string;
    content?: string;
    file_meta?: string;
    timestamp: number;
    status: string;
    is_forwarded?: boolean;
    is_liked?: boolean;
    attachment_name?: string;
    attachment_type?: string;
    attachment_url?: string;
    attachment_local_path?: string;
    attachmentUrl?: string;
    updated_at: number;
    created_at: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCatalog {
    id: string;
    user_catalog_id: string;
    first_name: string;
    last_name?: string;
    user_email?: string;
    user_mobile?: string;
    user_name: string;
    user_status?: string;
    avatar_local_path?: string;
    avatar_url?: string;
    for_business_name?: string;
    for_business_number?: string;
    business_number?: string;
    business_name?: string;
    updated_at: number;
    created_at: number;
}

export interface ChatGroup {
    id: string;
    chat_group_id: number;
    group_id: string;
    chat_identifier: string;
    chat_group_name?: string;
    is_group: boolean;
    is_public?: boolean;
    created_user_id: string;
    for_business_name?: string;
    for_business_number?: string;
    business_number?: string;
    business_name?: string;
    last_message_id?: string;
    last_message_preview?: string;
    last_message_timestamp?: number;
    chat_group_users_json?: string;
    updated_at: number;
    created_at: number;
}
