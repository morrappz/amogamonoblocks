import "server-only";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";

export async function getContacts() {
  try {
    const { data, error } = await postgrest.from("user_catalog").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getSingleContact(id: number) {
  try {
    const { data, error } = await postgrest
      .from("user_catalog")
      .select("*")
      .eq("user_catalog_id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchMessages() {
  try {
    const { data, error } = await postgrest.from("message").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchLatestMessage() {
  try {
    const { data, error } = await postgrest.from("latest_message").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getGroupsData() {
  try {
    const { data, error } = await postgrest.from("chat_group").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getAgentsData() {
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
