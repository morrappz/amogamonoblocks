"use server";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { Pool } from "pg";

export async function fetchFormSetupData(formId: number) {
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

export async function getDataFromDb(
  db_connection_json: string | undefined,
  query: string
) {
  try {
    const pool = new Pool({
      connectionString: db_connection_json,
    });
    const result = await pool.query(query);
    await pool.end();
    return [{ data: result.rows, label: query }];
  } catch (error) {
    throw error;
  }
}

export async function getChatHistory(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("*")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup);
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
      .from("message")
      .select("*")
      .eq("user_id", userId)
      .eq("favorite", true)
      .eq("chat_group", chatGroup);
    if (error) throw error;
    return data;
  } catch (error) {
    return error;
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
