"use server";

import { postgrest } from "@/lib/postgrest";
import { getSupabaseSessionMain } from "@/lib/supabase-server";
import { v4 as uuidv4 } from "uuid";

export async function getChatHistory(chatGroup: string) {
  const session = await getSupabaseSessionMain();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("id,title,createdAt,assistantId")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("status", "active")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    return error;
  }
}

export async function getChatImportant(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("id,chatId,content,createdAt,assistantId,prompt_uuid")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("important", true)
      .order("createdAt", { ascending: false });
    if (error) throw error;

    return data;
  } catch (error) {
    return error;
  }
}

export async function getChatFavorites(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("id, chatId ,content,createdAt, assistantId")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("favorite", true)

      .order("createdAt", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    return error;
  }
}

export async function createChat(payload) {
  const session = await auth();
  try {
    const { data, error } = await postgrest.from("chat").insert({
      ...payload,
      business_number: session?.user?.business_number,
      created_user_id: session?.user?.user_catalog_id,
      business_name: session?.user?.business_name,
      created_user_name: session?.user?.user_name,
      user_email: session?.user?.user_email,
      for_business_number: session?.user?.for_business_number,
      for_business_name: session?.user?.for_business_name,
    });
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}

export async function createNewChatSession() {
  const session = await auth();
  try {
    const newChatId = uuidv4();
    const initialMessageId = uuidv4();
    const shareToken = uuidv4();
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

    // Create the chat first
    const { data, error } = await postgrest.from("chat").insert({
      id: newChatId,
      title: "New Chat",
      chat_group: "LangStarter",
      status: "active",
      user_id: session?.user?.user_catalog_id,
      createdAt: new Date().toISOString(),
      business_number: session?.user?.business_number,
      created_user_id: session?.user?.user_catalog_id,
      business_name: session?.user?.business_name,
      created_user_name: session?.user?.user_name,
      user_email: session?.user?.user_email,
      for_business_number: session?.user?.for_business_number,
      for_business_name: session?.user?.for_business_name,
      share_token: shareToken,
      share_url: shareUrl,
    });

    if (error) throw error;

    // Save initial assistant message
    const initialMessage = {
      id: initialMessageId,
      chatId: newChatId,
      role: "assistant",
      content: `Hello ${session?.user?.user_name}! How can I help you today?`,
      chat_group: "LangStarter",
      status: "active",
      user_id: session?.user?.user_catalog_id,
      createdAt: new Date().toISOString(),
      isLike: false,
      bookmark: false,
      favorite: false,
    };

    const { error: messageError } = await postgrest
      .asAdmin()
      .from("message")
      .insert(initialMessage);

    if (messageError) {
      console.error("Failed to save initial message:", messageError);
      // Don't throw here as the chat was already created successfully
    }

    return { chatId: newChatId, success: true };
  } catch (error) {
    console.error("Failed to create new chat session:", error);
    throw error;
  }
}

export async function saveMessage(payload) {
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("*")
      .eq("chatId", chatId)
      // .eq("user_id", session?.user?.user_catalog_id)
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get messages:", error);
    throw error;
  }
}

export async function getMessagesByPromptUuid(promptUuid: string | null) {
  // Return empty array if promptUuid is null or undefined
  if (!promptUuid || promptUuid === "null") {
    console.log("promptUuid is null or invalid, returning empty array");
    return [];
  }

  const session = await auth();
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("*")
      .eq("prompt_uuid", promptUuid)
      .eq("user_id", session?.user?.user_catalog_id)
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get messages by prompt_uuid:", error);
    throw error;
  }
}

export async function getMessageById(messageId: string) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("id,chatId,role,content,prompt_uuid")
      .eq("id", messageId)
      .eq("user_id", session?.user?.user_catalog_id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get message by id:", error);
    throw error;
  }
}

export async function deleteChat(id: string) {
  try {
    const { error } = await postgrest
      .from("chat")
      .update({ status: "delete" })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to delete chat");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

export async function removeFavorite(id: string) {
  try {
    const { error } = await postgrest
      .asAdmin()
      .from("message")
      .update({ favorite: false })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to remove favorite");
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}

export async function removeImportant(id: string) {
  try {
    const { error } = await postgrest
      .asAdmin()
      .from("message")
      .update({ important: false })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to remove important");
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing important:", error);
    throw error;
  }
}

export async function removeBookmark(id: string) {
  try {
    const { error } = await postgrest

      .from("chat")
      .update({ bookmark: false })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to remove bookmark");
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw error;
  }
}

export async function updateMessageStatus({
  messageId,
  isLike,
  important,
  favorite,
}: {
  messageId: string;
  isLike?: boolean;
  important?: boolean;
  favorite?: boolean;
}) {
  try {
    const updateData: any = {};

    if (isLike !== undefined) {
      updateData.isLike = isLike;
    }
    if (important !== undefined) {
      updateData.important = important;
    }
    if (favorite !== undefined) {
      updateData.favorite = favorite;
    }

    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .update(updateData)
      .eq("id", messageId);

    if (error) throw error;

    return { data, success: true };
  } catch (error) {
    console.error("Error updating message status:", error);
    throw new Error("Failed to update message status");
  }
}

export async function getFormSetupData() {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("form_id,form_name,status,data_api_url,api_connection_json")
      .filter("users_json", "cs", `["${session?.user?.user_email}"]`);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchFormSetupData(formId: string) {
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select(
        "form_name, form_id, content, data_api_url,content,api_connection_json,db_connection_json,story_api"
      )
      .eq("form_id", formId);
    if (error) return error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchChatTitle(id?: string) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("title,bookmark,createdAt,share_token")
      .eq("id", id)
      .eq("user_id", session?.user?.user_catalog_id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch chat title:", error);
    throw error;
  }
}

export async function updateChatTitle(
  title: string,
  bookmark: boolean,
  id?: string
) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("chat")
      .update({ title, bookmark })
      .eq("id", id)
      .eq("user_id", session?.user?.user_catalog_id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to update chat title:", error);
    throw error;
  }
}

export async function getChatBookMarks(chatGroup: string) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("id,title,bookmark,createdAt")
      .eq("chat_group", chatGroup)
      .eq("bookmark", true)
      .eq("user_id", session?.user?.user_catalog_id)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch chat bookmarks:", error);
    throw error;
  }
}

// chat share

export async function getChatByShareId(id: string) {
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("id")
      .eq("share_token", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to Fetch Chat By Share Id:", error);
    throw error;
  }
}
