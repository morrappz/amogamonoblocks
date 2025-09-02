"use server";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { PromptsList } from "../types/types";

interface PromptData {
  title: string;
  status: string;
  is_scheduled: boolean;
  description?: string | undefined;
  remarks?: string | undefined;
  // Schedule configuration fields
  frequency?: string;
  schedule_time?: string;
  timezone?: string;
  start_date?: string;
  end_date?: string;
  selected_weekdays?: string[] | Record<string, any>;
  day_of_month?: number;
  start_month?: number;
  end_month?: number;
  selected_year?: number;
  selected_month?: number;
  selected_day?: number;
  specific_dates?: string[] | Record<string, any>;
  delivery_options?: Record<string, any>;
  target_all_users?: boolean;
  target_user_ids?: any[] | Record<string, any>;
}

export async function savePrompt(
  data: PromptData
): Promise<{ success: boolean }> {
  const session = await auth();
  const payload = {
    ...data,
    created_by: session?.user?.user_catalog_id,
    prompt_group: "report_schedule",
  };
  try {
    const { error } = await postgrest.from("prompts_list").insert(payload);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPrompts(): Promise<{
  success: boolean;
  data: Partial<PromptsList>[] | null;
}> {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("prompts_list")
      .select("title,description,status,id")
      .eq("prompt_group", "report_schedule")
      .eq("created_by", session?.user?.user_catalog_id);
    if (error) throw error;
    return { success: true, data: data as Partial<PromptsList>[] };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePrompt(id: number): Promise<{ success: boolean }> {
  const session = await auth();
  try {
    const { error } = await postgrest
      .from("prompts_list")
      .delete()
      .eq("id", id)
      .eq("created_by", session?.user?.user_catalog_id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getPromptData(
  id: number
): Promise<{ success: boolean; data: PromptsList[] | null }> {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("prompts_list")
      .select("*")
      .eq("id", id)
      .eq("created_by", session?.user?.user_catalog_id);
    if (error) throw error;
    return { success: true, data: data as PromptsList[] };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function editPromptData(
  id: number,
  data: PromptData
): Promise<{ success: boolean }> {
  const session = await auth();
  try {
    const { error } = await postgrest
      .from("prompts_list")
      .update(data)
      .eq("id", id)
      .eq("created_by", session?.user?.user_catalog_id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
