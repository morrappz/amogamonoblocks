"use server";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

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

export async function createMessage(payload) {
  try {
    const { data, error } = await postgrest.from("message").insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchMessages(chatId: string) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .select("*")
      .eq("chatId", chatId);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getChatHistory() {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("*")
      .eq("user_id", userId)
      .eq("chat_group", "Chat with Analytic Agent");
    if (error) throw error;
    return data;
  } catch (error) {
    return error;
  }
}

export async function getChatFavorites() {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .from("message")
      .select("*")
      .eq("user_id", userId)
      .eq("favorite", true);
    if (error) throw error;
    return data;
  } catch (error) {
    return error;
  }
}

export async function addFavorite(id: string) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .update({ favorite: true })
      .eq("id", id);
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}

export async function addFeedback(id: string, isLike: boolean | null) {
  try {
    const { data, error } = await postgrest
      .from("message")
      .update({ isLike: isLike })
      .eq("id", id);
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}
