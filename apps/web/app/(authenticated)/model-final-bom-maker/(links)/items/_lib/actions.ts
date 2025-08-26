"use server";

import { type FinalBomItem } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type {
  CreateFinalBomItemSchema,
  UpdateFinalBomItemSchema,
  QuickUpdateFinalBomItemSchema,
} from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { auth } from "@/auth";

export async function createRecord(
input: CreateFinalBomItemSchema, final_bom_id: number) {
  unstable_noStore();
  try {
    const session = await auth();
    // Get the final_bom details before saving and pass it
    const query = postgrest.from("final_bom")
    .select("bom_type,bom_name,bom_code,model,variant,frame,engine,mission")
    .eq("final_bom_id", final_bom_id);
    
    const { data: bomData, error: bomError } = await query;
    
    if (bomError) throw bomError;

    const { data, error } = await postgrest
      .from("final_bom_item")
      .insert([
        {
          ...input,
          bom_code:bomData[0]?.bom_code|| "",
          bom_name:bomData[0]?.bom_name|| "",
          bom_type:bomData[0]?.bom_type|| "",
          model:bomData[0]?.model|| "",
          variant:bomData[0]?.variant|| "",
          frame:bomData[0]?.frame|| "",
          engine:bomData[0]?.engine|| "",
          mission:bomData[0]?.mission|| "",
          final_bom_id:final_bom_id,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          for_business_number: session?.user?.business_number || "",
          for_business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString()
        },
      ])
      .select("final_bom_item_id")
      .single();

    if (error) throw error;

    revalidateTag("finalbomitem");
    revalidateTag("finalbomitem-status-counts");

    return {
      data,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateRecord(
  input: UpdateFinalBomItemSchema & { id: number}
) {
  unstable_noStore();
  try {
    const { id, ...rest } = input;
    
    const { data, error } = await postgrest
      .from("final_bom_item")
      .update({
        ...rest,
        final_bom_item_id: id,
        updated_date: new Date().toISOString(),
      })
      .eq("final_bom_item_id", input.id)
      .select("status")
      .single();

    if (error) {
      console.log(error);
      throw error;
    }

    // Revalidate cache/tags
    revalidateTag("finalbomitem");
    if (data?.status === input.status) revalidateTag("finalbomitem-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function quickUpdateRecord(
  input: QuickUpdateFinalBomItemSchema & { id: number }
) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("final_bom_item")
      .update({
        status: input.status,
      })
      .eq("final_bom_item_id", input.id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("finalbomitem");
    if (data?.status === input.status) revalidateTag("finalbomitem-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateRecords(input: {
  ids: number[];
  status?: FinalBomItem["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("final_bom_item")
      .update({
        status: input.status,
      })
      .in("final_bom_item_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("finalbomitem");
    if (data?.some((r) => r.status === input.status))
      revalidateTag("finalbomitem-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteRecord(input: { id: number }) {
  unstable_noStore();
  try {
    const { error } = await postgrest
      .from("final_bom_item")
      .delete()
      .eq("final_bom_item_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("finalbomitem");
    revalidateTag("finalbomitem-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteRecords(input: { ids: number[] }) {
  unstable_noStore();
  try {
    const { error } = await postgrest
      .from("final_bom_item")
      .delete()
      .in("final_bom_item_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("finalbomitem");
    revalidateTag("finalbomitem-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
